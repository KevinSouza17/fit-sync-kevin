import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff, Users, GraduationCap, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { supabase } from "../lib/supabase";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ users: number; professionals: number; rating: string } | null>(null);
  const { signIn } = useAuth();
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
