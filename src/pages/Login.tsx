import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { FitSyncLogo } from "../components/FitSyncLogo";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50/40 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-primary-900/10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <FitSyncLogo size="lg" animated />
          <p className="mt-3 text-sm text-content-muted">{t("login.subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-edge-base/60 bg-surface-card/95 p-6 shadow-xl shadow-primary-900/5 backdrop-blur-sm sm:p-8">
          <h1 className="mb-6 text-xl font-bold text-content-strong">{t("login.title")}</h1>

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
              <label className="text-sm font-medium text-content-body">{t("login.password")}</label>
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
        </div>

        <p className="mt-6 text-center text-sm text-content-muted">
          {t("login.noAccount")}{" "}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            {t("login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
