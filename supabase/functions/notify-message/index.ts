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

// Best-effort email notification for a new message. The in-app notification is
// already created by the database trigger; this just adds the email channel.
async function sendMessageEmail(toEmail: string, senderName: string, preview: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return;
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "FitSync <no-reply@fitsync.app>";
  const snippet = preview.length > 80 ? preview.slice(0, 80) + "…" : preview;
  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 40px; height: 40px; border-radius: 10px; background: #059669; color: white; font-weight: 800; font-size: 22px; line-height: 40px;">F</div>
    </div>
    <h2 style="font-size: 17px; color: #0f172a; margin: 0 0 8px;">Nova mensagem de ${senderName}</h2>
    <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="font-size: 15px; color: #334155; line-height: 1.5; margin: 0;">${snippet}</p>
    </div>
    <p style="font-size: 13px; color: #94a3b8; margin: 0;">Abra o FitSync para ver a mensagem completa e responder.</p>
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
        subject: `${senderName} te enviou uma mensagem no FitSync`,
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
    const senderId = payload?.sub as string | undefined;
    if (!senderId) return json({ error: "Sessão inválida." }, 401);

    const body = await req.json().catch(() => ({}));
    const conversationId: string | undefined = body?.conversationId;
    const content: string | undefined = body?.content;
    if (!conversationId || !content) {
      return json({ error: "conversationId e content são obrigatórios." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Configuração ausente." }, 500);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Resolve the conversation + the recipient.
    const { data: conv } = await serviceClient
      .from("conversations")
      .select("user_a_id, user_b_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv) return json({ error: "Conversa não encontrada." }, 404);

    const recipientId = conv.user_a_id === senderId ? conv.user_b_id : conv.user_a_id;
    if (recipientId === senderId) return json({ ok: true }); // shouldn't happen

    // Sender name + recipient email (via RPC since auth.users is not exposed via PostgREST).
    const [{ data: senderProfile }, { data: recipientEmailRaw }] = await Promise.all([
      serviceClient.from("profiles").select("full_name").eq("id", senderId).maybeSingle(),
      serviceClient.rpc("get_email_by_user_id", { p_user_id: recipientId }),
    ]);

    const senderName = senderProfile?.full_name || "Alguém";
    const recipientEmail = recipientEmailRaw as string | null;
    if (recipientEmail) {
      await sendMessageEmail(recipientEmail, senderName, content);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ error: "Erro interno." }, 500);
  }
});
