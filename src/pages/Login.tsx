import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff, Loader2, Users, GraduationCap, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { supabase } from "../lib/supabase";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [stats, setStats] = useState<{ users: number; professionals: number; rating: string } | null>(null);
  const { signIn, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      const [{ count: userCount }, { count: proCount }, { data: ratingData }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_professional", true),
        supabase.from("site_reviews").select("rating"),
      ]);
      const ratings = ratingData || [];
      const avg = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : "—";
      setStats({
        users: userCount ?? 0,
        professionals: proCount ?? 0,
        rating: avg,
      });
    }
    fetchStats();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(t("login.invalidCredentials"));
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
    setGoogleLoading(false);
  }

  const statItems = stats
    ? [
        { icon: Users, stat: stats.users.toLocaleString("pt-BR"), label: "Usuários ativos" },
        { icon: GraduationCap, stat: stats.professionals.toLocaleString("pt-BR"), label: "Profissionais cadastrados" },
        { icon: Star, stat: `${stats.rating}/5`, label: "Avaliação dos usuários" },
      ]
    : [];

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FitSync</span>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Sua jornada para uma<br />vida mais saudável.
          </h2>
          <p className="text-base leading-relaxed text-primary-100">
            Acompanhe sua nutrição, monitore seus treinos e alcance seus objetivos com nossa plataforma completa de saúde e bem-estar.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            {statItems.length > 0 ? statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{item.stat}</p>
                    <p className="text-sm text-primary-100">{item.label}</p>
                  </div>
                </div>
              );
            }) : (
              [0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
                  <div className="space-y-1.5">
                    <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <p className="text-sm text-primary-200">© 2026 FitSync. Todos os direitos reservados.</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center bg-surface-card px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-content-strong">FitSync</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-content-strong">{t("login.title")}</h1>
            <p className="mt-1.5 text-sm text-content-muted">{t("login.subtitle")}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Google sign-in */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-edge-base bg-white px-4 py-2.5 text-sm font-medium text-content-strong shadow-sm transition-all hover:bg-slate-50 hover:shadow-md disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-content-muted" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? "Conectando..." : "Continuar com Google"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-content-muted">ou</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content-body">{t("login.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-content-body">{t("login.password")}</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-body"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : t("login.signIn")}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-content-muted">
            {t("login.noAccount")}{" "}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              {t("login.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
