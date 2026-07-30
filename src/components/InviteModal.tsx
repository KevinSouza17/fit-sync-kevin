import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Mail, ShieldCheck, Loader2, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  hintName?: string;
  expectedUserId?: string;
}

type Step = "email" | "code";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteModal({ open, onClose, hintName, expectedUserId }: InviteModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function reset() {
    setStep("email");
    setEmail("");
    setCode("");
    setBusy(false);
    setError("");
  }

  function close() {
    reset();
    onClose();
  }

  async function requestOtp(targetEmail: string): Promise<{ ok: boolean; errorKind?: "not_found" | "rate" | "generic" }> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: targetEmail, create_user: false }),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    const msg = (data?.error_description || data?.msg || data?.message || "").toLowerCase();
    if (res.status === 400 || msg.includes("not found") || msg.includes("user_not_found") || msg.includes("no user") || msg.includes("invalid")) {
      return { ok: false, errorKind: "not_found" };
    }
    if (msg.includes("rate") || msg.includes("too many") || msg.includes("over_email_send_rate") || res.status === 429) {
      return { ok: false, errorKind: "rate" };
    }
    return { ok: false, errorKind: "generic" };
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (user?.email && cleanEmail === user.email.toLowerCase()) {
      setError("Você não pode convidar a si mesmo.");
      return;
    }
    setBusy(true);
    const result = await requestOtp(cleanEmail);
    setBusy(false);
    if (!result.ok) {
      if (result.errorKind === "not_found") {
        setError("Este e-mail ainda não tem conta no FitSync. Peça para a pessoa se cadastrar primeiro.");
      } else if (result.errorKind === "rate") {
        setError("Muitos envios. Aguarde alguns minutos e tente novamente.");
      } else {
        setError("Não foi possível enviar o código. Tente novamente.");
      }
      return;
    }
    setStep("code");
  }

  async function resendCode() {
    setError("");
    setBusy(true);
    const result = await requestOtp(email.trim().toLowerCase());
    setBusy(false);
    if (!result.ok) {
      setError("Não foi possível reenviar. Aguarde um instante.");
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.trim().length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setError("Sua sessão expirou. Entre novamente.");
        setBusy(false);
        return;
      }
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-invite`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          expectedUserId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Código inválido ou expirado.");
        setBusy(false);
        return;
      }
      const conversationId = data?.conversationId;
      close();
      if (conversationId) {
        navigate(`/messages?c=${conversationId}`);
      } else {
        navigate("/messages");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
              <Mail className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {hintName ? `Convidar ${hintName.split(" ")[0]}` : "Convidar pessoa"}
              </h2>
              <p className="text-[11px] text-slate-500">Por e-mail, com verificação por código</p>
            </div>
          </div>
          <button onClick={close} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === "email" ? (
            <form onSubmit={sendCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">E-mail da pessoa</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    autoFocus
                    placeholder="pessoa@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              {hintName && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Enviaremos um código de 6 dígitos para o e-mail informado. Use o e-mail que
                  {hintName} usou ao se cadastrar no FitSync.
                </p>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600">{error}</div>
              )}

              <Button type="submit" className="w-full gap-2" size="lg" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    Enviar código
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-start gap-2 rounded-lg bg-primary-50/60 px-3 py-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <span>
                  Só é possível convidar pessoas que já têm conta no FitSync. O código confirma que o
                  e-mail é real e pertence a essa pessoa.
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setCode("");
                }}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Código de verificação</label>
                <p className="text-xs text-slate-500">
                  Enviamos um código de 6 dígitos para{" "}
                  <span className="font-semibold text-slate-700">{email.trim()}</span>. Peça para a
                  pessoa informar o código recebido.
                </p>
                <input
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="flex h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-center text-xl font-bold tracking-[0.5em] text-slate-900 placeholder:tracking-[0.5em] placeholder:text-slate-300 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600">{error}</div>
              )}

              <Button type="submit" className="w-full gap-2" size="lg" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verificar e conversar
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={resendCode}
                disabled={busy}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reenviar código
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
