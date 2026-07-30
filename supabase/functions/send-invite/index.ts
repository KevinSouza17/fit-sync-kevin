import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(b64);
    const text = decodeURIComponent(
      decoded
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function genCode(): string {
  let c = "";
  for (let i = 0; i < 6; i++) c += Math.floor(Math.random() * 10).toString();
  return c;
}

// Sends an email via Resend. Best-effort: failures are swallowed because the
// in-app notification (already inserted) is the primary delivery channel.
async function sendInviteEmail(toEmail: string, inviterName: string, code: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return; // not configured yet — in-app notification still works

  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "FitSync <no-reply@fitsync.app>";
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 40px; height: 40px; border-radius: 10px; background: #2563eb; color: white; font-weight: 800; font-size: 22px; line-height: 40px;">F</div>
      <h1 style="margin: 12px 0 4px; font-size: 20px; color: #0f172a;">FitSync</h1>
    </div>
    <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 8px;">Você recebeu um convite!</h2>
    <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
      <strong>${inviterName}</strong> te convidou para conversar no FitSync. Use o código abaixo para confirmar e iniciar a conversa.
    </p>
    <div style="text-align: center; background: #eff6ff; border-radius: 12px; padding: 20px; margin: 0 0 20px;">
      <p style="font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #2563eb; margin: 0 0 8px;">Código de confirmação</p>
      <p style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; margin: 0; font-family: 'SF Mono', Menlo, monospace;">${code}</p>
    </div>
    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
      Abra o FitSync e vá em <strong>Notificações</strong> para usar o código, ou confirme diretamente no pop-up que apareceu no app.
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Se você não esperava este convite, pode ignorar este e-mail.</p>
  </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `${inviterName} te convidou para conversar no FitSync`,
        html,
      }),
    });
  } catch (_e) {
    // ignored — in-app notification is the source of truth
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Não autenticado." }, 401);
    }
    const jwt = authHeader.slice("Bearer ".length).trim();
    const payload = decodeJwtPayload(jwt);
    const inviterId = payload?.sub as string | undefined;
    if (!inviterId) return json({ error: "Sessão inválida." }, 401);

    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body?.email;
    const expectedUserId: string | undefined = body?.expectedUserId;
    if (!email) return json({ error: "E-mail é obrigatório." }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Configuração ausente." }, 500);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Resolve invitee by email.
    const { data: inviteeIdRaw } = await serviceClient.rpc("find_user_id_by_email", {
      p_email: email.trim(),
    });
    const inviteeId: string | null = inviteeIdRaw ?? null;
    if (!inviteeId) {
      return json({ error: "Este e-mail ainda não tem conta no FitSync. Peça para a pessoa se cadastrar primeiro." }, 404);
    }
    if (inviteeId === inviterId) {
      return json({ error: "Você não pode convidar a si mesmo." }, 400);
    }
    if (expectedUserId && expectedUserId !== inviteeId) {
      return json({ error: "Este e-mail não pertence à pessoa selecionada." }, 400);
    }

    // Inviter display name.
    const { data: inviterProfile } = await serviceClient
      .from("profiles")
      .select("full_name")
      .eq("id", inviterId)
      .maybeSingle();
    const inviterName = inviterProfile?.full_name || "Alguém";

    const code = genCode();
    const cleanEmail = email.trim().toLowerCase();

    // Primary channel: in-app notification carrying the code.
    const { error: notifErr } = await serviceClient.from("notifications").insert({
      user_id: inviteeId,
      type: "invite",
      title: `${inviterName} te convidou para conversar`,
      body: `Use o código ${code} para confirmar e iniciar a conversa.`,
      code,
      invite_email: cleanEmail,
      inviter_id: inviterId,
      inviter_name: inviterName,
      read: false,
    });
    if (notifErr) {
      return json({ error: "Não foi possível enviar o convite." }, 500);
    }

    // Secondary channel: email via Resend (best-effort).
    await sendInviteEmail(cleanEmail, inviterName, code);

    return json({ ok: true });
  } catch (err) {
    return json({ error: "Erro interno. Tente novamente." }, 500);
  }
});
