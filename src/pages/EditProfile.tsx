import { useEffect, useState } from "react";
import { Camera, Save, Check, Briefcase, GraduationCap, Award, MapPin } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const healthGoals = [
  "Perda de Peso",
  "Hipertrofia Muscular",
  "Manutenção",
  "Ganho de Força",
  "Resistência Cardiovascular",
  "Melhora da Saúde Geral",
];

const activityLevels = [
  "Sedentário",
  "Levemente ativo",
  "Moderadamente ativo",
  "Muito ativo",
  "Extremamente ativo",
];

interface FormState {
  full_name: string;
  height_cm: string;
  weight_kg: string;
  goal_weight_kg: string;
  health_goal: string;
  daily_calorie_goal: string;
  daily_water_goal_liters: string;
  activity_level: string;
  is_professional: boolean;
  professional_role: string;
  specialty: string;
  bio: string;
  credentials: string;
  location_city: string;
  available_for_booking: boolean;
}

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

const specialtiesList = [
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

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function EditProfile() {
  const { profile, user, refreshProfile } = useAuth();
  const [form, setForm] = useState<FormState>({
    full_name: "",
    height_cm: "",
    weight_kg: "",
    goal_weight_kg: "",
    health_goal: "Manutenção",
    daily_calorie_goal: "2400",
    daily_water_goal_liters: "2.5",
    activity_level: "Moderadamente ativo",
    is_professional: false,
    professional_role: "",
    specialty: "",
    bio: "",
    credentials: "",
    location_city: "",
    available_for_booking: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        height_cm: profile.height_cm ? String(profile.height_cm) : "",
        weight_kg: profile.weight_kg ? String(profile.weight_kg) : "",
        goal_weight_kg: profile.goal_weight_kg ? String(profile.goal_weight_kg) : "",
        health_goal: profile.health_goal ?? "Manutenção",
        daily_calorie_goal: String(profile.daily_calorie_goal ?? 2400),
        daily_water_goal_liters: String(profile.daily_water_goal_liters ?? 2.5),
        activity_level: profile.activity_level ?? "Moderadamente ativo",
        is_professional: profile.is_professional ?? false,
        professional_role: profile.professional_role ?? "",
        specialty: profile.specialty ?? "",
        bio: profile.bio ?? "",
        credentials: profile.credentials ?? "",
        location_city: profile.location_city ?? "",
        available_for_booking: profile.available_for_booking ?? false,
      });
    }
  }, [profile]);

  function setField(key: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!user) return;
    setError("");
    setSaving(true);
    const payload = {
      full_name: form.full_name,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      goal_weight_kg: form.goal_weight_kg ? parseFloat(form.goal_weight_kg) : null,
      health_goal: form.health_goal,
      daily_calorie_goal: parseInt(form.daily_calorie_goal) || 2400,
      daily_water_goal_liters: parseFloat(form.daily_water_goal_liters) || 2.5,
      activity_level: form.activity_level,
      is_professional: form.is_professional,
      professional_role: form.is_professional ? form.professional_role : null,
      specialty: form.is_professional ? form.specialty : null,
      bio: form.is_professional ? form.bio : null,
      credentials: form.is_professional ? form.credentials : null,
      location_city: form.is_professional ? form.location_city : null,
      available_for_booking: form.is_professional ? form.available_for_booking : false,
      updated_at: new Date().toISOString(),
    };
    const { error: err } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...payload });
    if (err) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  const displayName = form.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Perfil</h1>
          <p className="mt-0.5 text-sm text-slate-500">Atualize suas informações pessoais e de saúde</p>
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Avatar + habits */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-50 text-3xl font-bold text-blue-700">
                    {initials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{displayName}</h3>
              <p className="text-sm text-slate-500">{user?.email}</p>
              {form.is_professional && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Briefcase className="h-3 w-3" />
                  {form.professional_role || "Profissional"}
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Hábitos e Rotina</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Nível de Atividade</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={form.activity_level}
                    onChange={(e) => setField("activity_level", e.target.value)}
                  >
                    {activityLevels.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Meta de Água (L/dia)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10"
                    className="mt-1"
                    value={form.daily_water_goal_liters}
                    onChange={(e) => setField("daily_water_goal_liters", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Meta Calórica (kcal/dia)</label>
                  <Input
                    type="number"
                    step="50"
                    className="mt-1"
                    value={form.daily_calorie_goal}
                    onChange={(e) => setField("daily_calorie_goal", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main form */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Informações Pessoais</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nome completo</label>
                  <Input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setField("full_name", e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">E-mail</label>
                  <Input type="email" value={user?.email ?? ""} disabled className="bg-slate-50 text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Conta criada em</label>
                  <Input
                    type="text"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : ""}
                    disabled
                    className="bg-slate-50 text-slate-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Medidas e Saúde</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Altura (cm)</label>
                  <Input type="number" step="0.1" placeholder="178" value={form.height_cm} onChange={(e) => setField("height_cm", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Peso atual (kg)</label>
                  <Input type="number" step="0.1" placeholder="75.0" value={form.weight_kg} onChange={(e) => setField("weight_kg", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Peso meta (kg)</label>
                  <Input type="number" step="0.1" placeholder="70.0" value={form.goal_weight_kg} onChange={(e) => setField("goal_weight_kg", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Objetivo de Saúde</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {healthGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setField("health_goal", goal)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      form.health_goal === goal
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Professional account section */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Conta Profissional
                </h2>
                <label className="flex cursor-pointer items-center gap-2">
                  <span className="text-sm text-slate-600">Ativar</span>
                  <button
                    role="switch"
                    aria-checked={form.is_professional}
                    onClick={() => setField("is_professional", !form.is_professional)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.is_professional ? "bg-emerald-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.is_professional ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              </div>
              {!form.is_professional ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">Ative sua conta profissional para oferecer serviços e aparecer na busca de profissionais</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Função</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={form.professional_role}
                        onChange={(e) => setField("professional_role", e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="">Selecione sua função</option>
                        {professionalRoles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Especialidade</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={form.specialty}
                        onChange={(e) => setField("specialty", e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="">Selecione sua especialidade</option>
                        {specialtiesList.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Registro Profissional</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Ex: CRN-3 12345"
                        value={form.credentials}
                        onChange={(e) => setField("credentials", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Cidade</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Ex: São Paulo, SP"
                        value={form.location_city}
                        onChange={(e) => setField("location_city", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Bio Profissional</label>
                    <textarea
                      rows={3}
                      placeholder="Descreva sua experiência e abordagem profissional..."
                      value={form.bio}
                      onChange={(e) => setField("bio", e.target.value)}
                      className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Disponível para agendamentos</p>
                      <p className="text-xs text-slate-500">Alunos poderão encontrar e agendar com você</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={form.available_for_booking}
                      onClick={() => setField("available_for_booking", !form.available_for_booking)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.available_for_booking ? "bg-emerald-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.available_for_booking ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
