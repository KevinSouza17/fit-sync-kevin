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
    const json = decodeURIComponent(
      decoded
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
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
    if (!inviterId) {
      return json({ error: "Sessão inválida." }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body?.email;
    const code: string | undefined = body?.code;
    const expectedUserId: string | undefined = body?.expectedUserId;

    if (!email || !code) {
      return json({ error: "E-mail e código são obrigatórios." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Configuração ausente." }, 500);
    }

    // Verify the OTP code against Supabase Auth. A successful response means the
    // code was delivered to and entered for this email — i.e. the email is real
    // and controlled by whoever supplied the code. We do NOT keep the session
    // that this call returns; we only use it to confirm the code is valid.
    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/verify`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "email", token: String(code).trim(), email: email.trim() }),
    });

    if (!verifyRes.ok) {
      return json({ error: "Código inválido ou expirado." }, 400);
    }

    const verifyData = await verifyRes.json().catch(() => ({}));
    const inviteeId: string | undefined = verifyData?.user?.id;
    if (!inviteeId) {
      return json({ error: "Não foi possível confirmar este e-mail." }, 400);
    }

    if (inviteeId === inviterId) {
      return json({ error: "Você não pode convidar a si mesmo." }, 400);
    }

    if (expectedUserId && expectedUserId !== inviteeId) {
      return json({ error: "Este e-mail não pertence à pessoa selecionada." }, 400);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const [userA, userB] =
      inviterId < inviteeId ? [inviterId, inviteeId] : [inviteeId, inviterId];

    // Reuse an existing conversation between these two users, otherwise create one.
    const { data: existing } = await serviceClient
      .from("conversations")
      .select("id")
      .eq("user_a_id", userA)
      .eq("user_b_id", userB)
      .maybeSingle();

    let conversationId = existing?.id;

    if (!conversationId) {
      const { data: created, error: insertErr } = await serviceClient
        .from("conversations")
        .insert({ user_a_id: userA, user_b_id: userB })
        .select("id")
        .single();
      if (insertErr || !created) {
        return json({ error: "Erro ao criar a conversa." }, 500);
      }
      conversationId = created.id;
    }

    const { data: inviteeProfile } = await serviceClient
      .from("profiles")
      .select("full_name")
      .eq("id", inviteeId)
      .maybeSingle();

    return json({
      conversationId,
      inviteeName: inviteeProfile?.full_name || "Usuário",
    });
  } catch (err) {
    return json({ error: "Erro interno. Tente novamente." }, 500);
  }
});
