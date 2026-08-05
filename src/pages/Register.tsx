import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff, User, Briefcase, GraduationCap, Award, MapPin, Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useI18n } from "../context/I18nContext";

const professionalRoles = [
  "Nutricionista",
  "Personal Trainer",
  "Médico do Esporte",
  "Fisioterapeuta",
  "Psicóloga(o)",
  "Endocrinologista",
  "Coach de Saúde",
  "Outro",
];

const specialties = [
  "Nutrição Esportiva",
  "Hipertrofia e Força",
  "Performance Atlética",
  "Bem-estar Mental",
  "Reabilitação",
  "Emagrecimento",
  "Nutrição Clínica",
  "Treinamento Funcional",
  "Outro",
];

export function Register() {
  const [accountType, setAccountType] = useState<"user" | "professional">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [proRole, setProRole] = useState("");
  const [proSpecialty, setProSpecialty] = useState("");
  const [proCredentials, setProCredentials] = useState("");
  const [proCity, setProCity] = useState("");
  const [regType, setRegType] = useState<"autonomo" | "empresa">("autonomo");
  const [docNumber, setDocNumber] = useState("");
  const [docError, setDocError] = useState("");

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  async function checkEmail(value: string): Promise<boolean> {
    if (!value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setEmailChecked(false);
      setEmailExists(false);
      return false;
    }
    setEmailChecking(true);
    const { data, error } = await supabase.rpc("email_exists", { check_email: value.trim() });
    setEmailChecking(false);
    if (error) {
      setEmailChecked(false);
      setEmailExists(false);
      return false;
    }
    const exists = !!data;
    setEmailChecked(true);
    setEmailExists(exists);
    return exists;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(t("register.passwordMismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("register.passwordShort"));
      return;
    }
    if (accountType === "professional" && (!proRole || !proSpecialty)) {
      setError(t("register.fillFields"));
      return;
    }
    if (accountType === "professional" && !docNumber.trim()) {
      setError(t("proreg.documentRequired"));
      return;
    }
    if (accountType === "professional" && regType === "empresa") {
      const digits = docNumber.replace(/\D/g, "");
      if (digits.length !== 14) {
        setError(t("proreg.invalidCnpj"));
        return;
      }
    }
    const exists = emailChecked ? emailExists : await checkEmail(email);
    if (exists) {
      setError(t("register.emailExists"));
      return;
    }
    setLoading(true);
    const proData = accountType === "professional"
      ? { role: proRole, specialty: proSpecialty, credentials: proCredentials, registrationType: regType, documentNumber: docNumber.trim() }
      : undefined;
    const { error } = await signUp(email, password, fullName, proData);
    if (error) {
      if (error.includes("already registered")) {
        setError(t("register.emailExists"));
      } else {
        setError(error);
      }
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center bg-surface-card px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-content-strong">FitSync</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-content-strong">Criar uma conta</h1>
            <p className="mt-1.5 text-sm text-content-muted">Comece sua jornada de saúde hoje mesmo</p>
          </div>

          {/* Account type toggle */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("user")}
              className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                accountType === "user"
                  ? "border-primary-600 bg-primary-50"
                  : "border-edge-base bg-surface-card hover:border-slate-300"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                accountType === "user" ? "bg-primary-600 text-white" : "bg-slate-100 text-content-muted"
              }`}>
                <User className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${accountType === "user" ? "text-primary-700" : "text-content-body"}`}>
                  Aluno
                </p>
                <p className="text-[11px] text-content-muted">Acompanhar saúde e treinos</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("professional")}
              className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                accountType === "professional"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-edge-base bg-surface-card hover:border-slate-300"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                accountType === "professional" ? "bg-emerald-600 text-white" : "bg-slate-100 text-content-muted"
              }`}>
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${accountType === "professional" ? "text-emerald-700" : "text-content-body"}`}>
                  Profissional
                </p>
                <p className="text-[11px] text-content-muted">Oferecer serviços e acompanhar clientes</p>
              </div>
              <span className="absolute -top-2 right-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                PRO
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common fields */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content-body">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
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
              <label className="text-sm font-medium text-content-body">{t("register.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailChecked(false);
                    setEmailExists(false);
                  }}
                  onBlur={(e) => checkEmail(e.target.value)}
                  className="pl-9 pr-10"
                  required
                />
                {emailChecking && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-content-muted" />
                )}
                {emailChecked && !emailChecking && !emailExists && (
                  <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {emailChecked && !emailChecking && emailExists && (
                  <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {emailChecked && emailExists && (
                <p className="text-xs text-red-500">{t("register.emailExists")}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content-body">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-body"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content-body">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-body"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Professional fields */}
            {accountType === "professional" && (
              <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <Briefcase className="h-4 w-4" />
                  Informações Profissionais
                </h3>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-content-body">Função *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                    <select
                      value={proRole}
                      onChange={(e) => setProRole(e.target.value)}
                      className="mt-0 flex h-10 w-full rounded-lg border border-edge-base bg-surface-card pl-9 pr-3 py-2 text-sm text-content-strong focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      required
                    >
                      <option value="">Selecione sua função</option>
                      {professionalRoles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-content-body">Especialidade *</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                    <select
                      value={proSpecialty}
                      onChange={(e) => setProSpecialty(e.target.value)}
                      className="mt-0 flex h-10 w-full rounded-lg border border-edge-base bg-surface-card pl-9 pr-3 py-2 text-sm text-content-strong focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      required
                    >
                      <option value="">Selecione sua especialidade</option>
                      {specialties.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Registration type toggle */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-content-body">Tipo de Registro *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { setRegType("autonomo"); setDocNumber(""); setDocError(""); }}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                        regType === "autonomo"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-edge-base bg-surface-card text-content-body hover:border-slate-300"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Autônomo
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRegType("empresa"); setDocNumber(""); setDocError(""); }}
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                        regType === "empresa"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-edge-base bg-surface-card text-content-body hover:border-slate-300"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      Empresa
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-content-body">
                    {regType === "empresa" ? "CNPJ *" : "Registro Profissional (CRN, CREF, CRM...) *"}
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                    <Input
                      placeholder={regType === "empresa" ? "Ex: 12.345.678/0001-90" : "Ex: CRN-3 12345"}
                      value={docNumber}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDocNumber(v);
                        if (regType === "empresa") {
                          const digits = v.replace(/\D/g, "");
                          setDocError(digits.length === 14 || digits.length === 0 ? "" : t("proreg.invalidCnpj"));
                        } else {
                          setDocError(v.trim().length < 3 ? t("proreg.invalidDoc") : "");
                        }
                      }}
                      className="pl-9"
                      required
                    />
                  </div>
                  {docError && <p className="text-xs text-red-500">{docError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-content-body">Cidade</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                    <Input
                      placeholder="Ex: São Paulo, SP"
                      value={proCity}
                      onChange={(e) => setProCity(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full ${accountType === "professional" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              size="lg"
              disabled={loading}
            >
              {loading ? "Criando conta..." : accountType === "professional" ? "Criar Conta Profissional" : "Criar Conta"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-content-muted">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      <div className={`hidden w-1/2 flex-col justify-between p-12 lg:flex ${
        accountType === "professional" ? "bg-emerald-600" : "bg-primary-600"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FitSync</span>
        </div>
        <div className="space-y-4">
          {accountType === "professional" ? (
            <>
              <h2 className="text-4xl font-bold leading-tight text-white">
                Conecte-se com<br />seus clientes.
              </h2>
              <p className="text-base leading-relaxed text-emerald-100">
                Gerencie seus pacientes, crie planos alimentares e de treino, e amplie seu alcance como profissional de saúde e fitness.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold leading-tight text-white">
                Comece sua jornada<br />hoje mesmo.
              </h2>
              <p className="text-base leading-relaxed text-primary-100">
                Defina suas metas, acompanhe seu progresso e transforme seus hábitos com o suporte de nossa comunidade.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
