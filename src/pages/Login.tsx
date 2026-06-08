import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError("E-mail ou senha inválidos. Tente novamente.");
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-blue-600 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FitSync</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Sua jornada para uma<br />vida mais saudável.
          </h2>
          <p className="text-base leading-relaxed text-blue-100">
            Acompanhe sua nutrição, monitore seus treinos e alcance seus objetivos com nossa plataforma completa de saúde e bem-estar.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-full bg-white/20 px-4 py-2 text-sm text-white">+12k usuários ativos</div>
          <div className="rounded-full bg-white/20 px-4 py-2 text-sm text-white">98% satisfação</div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">FitSync</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
            <p className="mt-1.5 text-sm text-slate-500">Insira suas credenciais para acessar sua conta</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                <label className="text-sm font-medium text-slate-700">Senha</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Não tem uma conta?{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
