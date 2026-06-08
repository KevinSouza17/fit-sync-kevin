import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      if (error.includes("already registered")) {
        setError("Este e-mail já está cadastrado.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">FitSync</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Criar uma conta</h1>
            <p className="mt-1.5 text-sm text-slate-500">Comece sua jornada de saúde hoje mesmo</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="João Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita sua senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden w-1/2 flex-col justify-between bg-blue-600 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FitSync</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Comece sua jornada<br />hoje mesmo.
          </h2>
          <p className="text-base leading-relaxed text-blue-100">
            Defina suas metas, acompanhe seu progresso e transforme seus hábitos com o suporte de nossa comunidade.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-2xl font-bold text-white">12k+</div>
            <div className="mt-1 text-sm text-blue-100">Usuários ativos</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="mt-1 text-sm text-blue-100">Receitas saudáveis</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="mt-1 text-sm text-blue-100">Satisfação</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="mt-1 text-sm text-blue-100">Especialistas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
