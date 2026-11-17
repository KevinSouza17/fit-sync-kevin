import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Lock,
  Play,
  Server,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface Endpoint {
  path: string;
  name: string;
  description: string;
  auth: "jwt" | "stripe";
  bodyExample: string;
  requiresBody: boolean;
  headerExtra?: { name: string; placeholder: string; description: string }[];
}

const BASE_URL = "https://ryqzwvmzysohgqxbwtoj.supabase.co/functions/v1";

const ENDPOINTS: Endpoint[] = [
  {
    path: "/notify-message",
    name: "notify-message",
    description: "Notifica o destinatário de uma conversa sobre uma nova mensagem.",
    auth: "jwt",
    requiresBody: true,
    bodyExample: JSON.stringify(
      { conversationId: "11111111-1111-1111-1111-111111111111", content: "Olá, tudo bem?" },
      null,
      2
    ),
  },
  {
    path: "/send-invite",
    name: "send-invite",
    description: "Envia um convite (com código de 6 dígitos) para outro usuário via e-mail.",
    auth: "jwt",
    requiresBody: true,
    bodyExample: JSON.stringify({ email: "amigo@exemplo.com" }, null, 2),
  },
  {
    path: "/stripe-checkout",
    name: "stripe-checkout",
    description:
      "Cria uma sessão de checkout do Stripe para a assinatura PRO e retorna a URL de pagamento.",
    auth: "jwt",
    requiresBody: false,
    bodyExample: "{}",
    headerExtra: [
      {
        name: "Origin",
        placeholder: "https://meu-app.com",
        description: "Usado para montar as URLs de sucesso/cancelamento",
      },
    ],
  },
  {
    path: "/stripe-webhook",
    name: "stripe-webhook",
    description:
      "Recebe eventos do Stripe e atualiza assinaturas. Chamada pelo Stripe — não usa JWT.",
    auth: "stripe",
    requiresBody: true,
    bodyExample: JSON.stringify(
      { id: "evt_1", object: "event", type: "checkout.session.completed", data: { object: {} } },
      null,
      2
    ),
    headerExtra: [
      {
        name: "stripe-signature",
        placeholder: "t=...,v1=...",
        description: "Assinatura do evento enviada pelo Stripe",
      },
    ],
  },
];

interface RequestResult {
  status: number;
  statusText: string;
  ok: boolean;
  durationMs: number;
  body: string;
}

export default function ApiTester() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [bodies, setBodies] = useState<Record<string, string>>(() =>
    Object.fromEntries(ENDPOINTS.map((e) => [e.path, e.bodyExample]))
  );
  const [extraHeaders, setExtraHeaders] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, RequestResult | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const t = data.session?.access_token;
        if (t) setToken(t);
      })
      .finally(() => setSessionLoading(false));
  }, []);

  const jwtReady = useMemo(() => ENDPOINTS.some((e) => e.auth === "jwt") && !!token, [token]);

  async function send(ep: Endpoint) {
    setLoading((p) => ({ ...p, [ep.path]: true }));
    setResults((p) => ({ ...p, [ep.path]: null }));
    const started = performance.now();
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Apikey: supabase.supabaseKey,
      };
      if (ep.auth === "jwt") headers["Authorization"] = `Bearer ${token}`;
      for (const h of ep.headerExtra ?? []) {
        const v = extraHeaders[`${ep.path}:${h.name}`];
        if (v) headers[h.name] = v;
      }
      const res = await fetch(`${BASE_URL}${ep.path}`, {
        method: "POST",
        headers,
        body: ep.requiresBody ? bodies[ep.path] || "" : "{}",
      });
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* corpo não é JSON */
      }
      setResults((p) => ({
        ...p,
        [ep.path]: {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          durationMs: Math.round(performance.now() - started),
          body: pretty || "(vazio)",
        },
      }));
    } catch (err) {
      setResults((p) => ({
        ...p,
        [ep.path]: {
          status: 0,
          statusText: "",
          ok: false,
          durationMs: Math.round(performance.now() - started),
          body: err instanceof Error ? err.message : "Erro de rede",
        },
      }));
    } finally {
      setLoading((p) => ({ ...p, [ep.path]: false }));
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-content-strong">Testar APIs</h1>
        <p className="mt-1 text-sm text-content-muted">
          Envie requisições reais para as APIs do FitSync e veja as respostas na hora.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-edge-base bg-surface-card p-4">
        <Server className="mt-0.5 h-5 w-5 shrink-0 text-content-muted" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-content-muted">URL base</p>
          <code className="mt-1 block break-all text-sm text-content-strong">{BASE_URL}</code>
        </div>
      </div>

      <div className="rounded-2xl border border-edge-base bg-surface-card p-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-content-strong">Token de autenticação (JWT)</h2>
        </div>
        <p className="mt-1 text-sm text-content-muted">
          {sessionLoading
            ? "Buscando sua sessão..."
            : token
              ? "Token carregado automaticamente da sua sessão."
              : "Faça login no app e recarregue esta página, ou cole um token manualmente."}
        </p>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi..."
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-edge-base bg-surface-base p-3 font-mono text-xs text-content-strong placeholder-content-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div className="space-y-3">
        {ENDPOINTS.map((ep) => {
          const isOpen = openId === ep.path;
          const result = results[ep.path];
          const isBusy = !!loading[ep.path];
          const blocked = ep.auth === "jwt" && !token;
          return (
            <div
              key={ep.path}
              className="overflow-hidden rounded-2xl border border-edge-base bg-surface-card"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : ep.path)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-subtle"
              >
                <span className="rounded-lg bg-primary-100 px-2 py-1 text-xs font-bold text-primary-700">
                  POST
                </span>
                <span className="font-mono text-sm font-semibold text-content-strong">
                  {ep.name}
                </span>
                {ep.auth === "jwt" ? (
                  <Lock className="ml-auto h-4 w-4 shrink-0 text-content-muted" />
                ) : (
                  <Server className="ml-auto h-4 w-4 shrink-0 text-content-muted" />
                )}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-content-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-edge-base p-4">
                  <p className="text-sm text-content-body">{ep.description}</p>

                  <div className="rounded-xl bg-surface-subtle p-3 text-xs">
                    <p className="font-medium text-content-strong">Autenticação:</p>
                    <p className="mt-1 text-content-muted">
                      {ep.auth === "jwt"
                        ? "Header Authorization: Bearer <JWT> (preenchido acima)"
                        : "Não usa JWT — validada pela assinatura do Stripe (stripe-signature)"}
                    </p>
                  </div>

                  {ep.headerExtra?.map((h) => (
                    <div key={h.name}>
                      <label className="text-xs font-medium text-content-strong">
                        Header {h.name} — {h.description}
                      </label>
                      <input
                        type="text"
                        value={extraHeaders[`${ep.path}:${h.name}`] ?? ""}
                        onChange={(e) =>
                          setExtraHeaders((p) => ({
                            ...p,
                            [`${ep.path}:${h.name}`]: e.target.value,
                          }))
                        }
                        placeholder={h.placeholder}
                        className="mt-1 w-full rounded-xl border border-edge-base bg-surface-base px-3 py-2 font-mono text-xs text-content-strong placeholder-content-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  ))}

                  {ep.requiresBody && (
                    <div>
                      <label className="text-xs font-medium text-content-strong">
                        Corpo da requisição (JSON)
                      </label>
                      <textarea
                        value={bodies[ep.path] ?? ""}
                        onChange={(e) =>
                          setBodies((p) => ({ ...p, [ep.path]: e.target.value }))
                        }
                        rows={6}
                        className="mt-1 w-full resize-y rounded-xl border border-edge-base bg-surface-base p-3 font-mono text-xs text-content-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => send(ep)}
                    disabled={isBusy || blocked}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    {isBusy ? "Enviando..." : "Enviar requisição"}
                  </button>

                  {result && (
                    <div className="overflow-hidden rounded-xl border border-edge-base">
                      <div className="flex items-center gap-2 border-b border-edge-base bg-surface-subtle px-4 py-2">
                        {result.ok ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-bold ${result.ok ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {result.status || "Erro"} {result.statusText}
                        </span>
                        <span className="ml-auto text-xs text-content-muted">
                          {result.durationMs} ms
                        </span>
                      </div>
                      <pre className="max-h-64 overflow-auto bg-surface-base p-4 font-mono text-xs text-content-body">
                        {result.body}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!jwtReady && !sessionLoading && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
          As rotas autenticadas exigem um token. Faça login no app para que ele seja preenchido
          automaticamente.
        </p>
      )}

      <p className="text-xs text-content-muted">
        Dica: respostas 400/401/404 também são úteis — elas confirmam que a API está validando
        corretamente os dados de entrada.
      </p>
    </div>
  );
}
