import { useEffect, useMemo, useState } from "react";
import {
  Users, UserPlus, UtensilsCrossed, Dumbbell, Plus, Trash2, X,
  CheckCircle2, Loader2, Activity, Target, Calendar,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { supabase } from "../lib/supabase";
import type { ClientPlan } from "../lib/types";
import { cn } from "../lib/utils";

interface ClientProfile {
  id: string; full_name: string; avatar_url: string | null;
  health_goal: string; daily_calorie_goal: number;
  weight_kg: number | null; height_cm: number | null; plan: string;
}
interface MealEntry { name: string; items: string; }
interface DayEntry { name: string; exercises: string; }

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export function MyClients() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [allPlans, setAllPlans] = useState<ClientPlan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [planType, setPlanType] = useState<"diet" | "workout">("diet");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinPct, setProteinPct] = useState("");
  const [carbsPct, setCarbsPct] = useState("");
  const [fatPct, setFatPct] = useState("");

  // Convert macro percentages into grams based on the calorie target.
  // Protein and carbs = 4 kcal/g; fat = 9 kcal/g.
  const macroGrams = (() => {
    const kcal = Number(calories) || 0;
    const pPct = Number(proteinPct) || 0;
    const cPct = Number(carbsPct) || 0;
    const fPct = Number(fatPct) || 0;
    return {
      protein: kcal && pPct ? Math.round((kcal * pPct) / 100 / 4) : null,
      carbs: kcal && cPct ? Math.round((kcal * cPct) / 100 / 4) : null,
      fat: kcal && fPct ? Math.round((kcal * fPct) / 100 / 9) : null,
    };
  })();
  const macroPctSum = (Number(proteinPct) || 0) + (Number(carbsPct) || 0) + (Number(fatPct) || 0);
  const [meals, setMeals] = useState<MealEntry[]>([{ name: "", items: "" }]);
  const [days, setDays] = useState<DayEntry[]>([{ name: "", exercises: "" }]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [{ data: aptData }, { data: planData }, { data: convData }] = await Promise.all([
        supabase.from("appointments").select("user_id").eq("professional_id", user.id),
        supabase.from("client_plans").select("client_id").eq("professional_id", user.id),
        supabase.from("conversations").select("user_a_id, user_b_id").or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`),
      ]);
      const ids = [...new Set([
        ...(aptData || []).map((a) => a.user_id),
        ...(planData || []).map((p) => p.client_id),
        ...(convData || []).flatMap((c) =>
          c.user_a_id === user.id ? [c.user_b_id] : [c.user_a_id]
        ),
      ])].filter((id) => id !== user.id);
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, health_goal, daily_calorie_goal, weight_kg, height_cm, plan")
          .in("id", ids);
        setClients((profiles as ClientProfile[]) || []);
        setSelectedId(ids[0]);
      } else {
        setClients([]);
        setSelectedId(null);
      }
      const { data: plans } = await supabase
        .from("client_plans").select("*").eq("professional_id", user.id)
        .order("created_at", { ascending: false });
      setAllPlans((plans as ClientPlan[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const selectedClient = clients.find((c) => c.id === selectedId) ?? null;
  const clientPlans = useMemo(
    () => allPlans.filter((p) => p.client_id === selectedId),
    [allPlans, selectedId]
  );
  const activePlansCount = allPlans.filter((p) => p.active).length;

  function resetForm() {
    setPlanType("diet"); setTitle(""); setDescription("");
    setCalories(""); setProteinPct(""); setCarbsPct(""); setFatPct("");
    setMeals([{ name: "", items: "" }]); setDays([{ name: "", exercises: "" }]);
    setSuccess(false); setSaveError("");
  }
  function openNewPlan() {
    if (!selectedClient) return;
    resetForm();
    setModalOpen(true);
  }
  const addMeal = () => setMeals((m) => [...m, { name: "", items: "" }]);
  const removeMeal = (i: number) => setMeals((m) => m.filter((_, idx) => idx !== i));
  const addDay = () => setDays((d) => [...d, { name: "", exercises: "" }]);
  const removeDay = (i: number) => setDays((d) => d.filter((_, idx) => idx !== i));

  async function savePlan() {
    if (!user || !selectedClient || !title.trim()) return;
    setSaving(true); setSaveError("");
    const content = planType === "diet"
      ? { meals: meals.filter((m) => m.name.trim()) }
      : { days: days.filter((d) => d.name.trim()) };
    const { data, error } = await supabase.from("client_plans").insert({
      professional_id: user.id, client_id: selectedClient.id,
      plan_type: planType, title: title.trim(), description: description.trim(),
      target_calories: planType === "diet" ? Number(calories) || null : null,
      target_protein_g: planType === "diet" ? macroGrams.protein : null,
      target_carbs_g: planType === "diet" ? macroGrams.carbs : null,
      target_fat_g: planType === "diet" ? macroGrams.fat : null,
      content, active: true,
    }).select().single();
    if (error) {
      setSaveError(error.message);
    } else if (data) {
      setAllPlans((prev) => [data as ClientPlan, ...prev]);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setModalOpen(false); resetForm(); }, 1400);
    }
    setSaving(false);
  }

  async function deletePlan(id: string) {
    const { error } = await supabase.from("client_plans").delete().eq("id", id);
    if (!error) setAllPlans((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-3 text-content-muted">{t("loading")}</span>
      </div>
    );
  }

  const taCls =
    "w-full rounded-lg border border-edge-base bg-surface-base px-3 py-2 text-sm text-content-strong placeholder:text-content-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:bg-surface-subtle";

  function StatCard({ icon: Icon, value, label, tone }: {
    icon: typeof Users; value: number; label: string; tone: string;
  }) {
    return (
      <Card className="bg-surface-card">
        <CardContent className="flex items-center gap-3 p-4">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone)}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold text-content-strong">{value}</p>
            <p className="text-xs text-content-muted">{label}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  function EmptyState({ icon: Icon, text, sub }: {
    icon: typeof Users; text: string; sub?: string;
  }) {
    return (
      <Card className="mt-6 bg-surface-card">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-subtle text-content-muted">
            <Icon className="h-7 w-7" />
          </span>
          <p className="text-base font-semibold text-content-strong">{text}</p>
          {sub && <p className="text-xs text-content-muted">{sub}</p>}
        </CardContent>
      </Card>
    );
  }

  function ClientAvatar({ c, size = "h-11 w-11", fs = "text-sm" }: {
    c: ClientProfile; size?: string; fs?: string;
  }) {
    return (
      <Avatar className={size}>
        {c.avatar_url ? (
          <AvatarImage src={c.avatar_url} alt={c.full_name} />
        ) : (
          <AvatarFallback className={cn("bg-primary-50 font-bold text-primary-600", fs)}>
            {initials(c.full_name)}
          </AvatarFallback>
        )}
      </Avatar>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-content-strong sm:text-3xl">{t("plans.title")}</h1>
        <p className="text-sm text-content-muted">{t("plans.subtitle")}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md sm:gap-4">
        <StatCard icon={Users} value={clients.length} label={t("pro.clientCount")} tone="bg-primary-50 text-primary-600" />
        <StatCard icon={Activity} value={activePlansCount} label={t("plans.active")} tone="bg-emerald-50 text-emerald-600" />
      </div>

      {clients.length === 0 ? (
        <EmptyState icon={UserPlus} text={t("pro.noClients")} />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          {/* Client list */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-content-muted">
              {t("pro.clientCount")}
            </h2>
            {clients.map((c) => {
              const count = allPlans.filter((p) => p.client_id === c.id && p.active).length;
              const active = c.id === selectedId;
              return (
                <button key={c.id} onClick={() => setSelectedId(c.id)}
                  className="text-left transition-all duration-200 hover:scale-[1.01] data-[on=true]:scale-[1.01]">
                  <Card className={cn("bg-surface-card transition-colors",
                    active ? "border-primary-500 ring-2 ring-primary-100" : "border-edge-base hover:border-primary-300")}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <ClientAvatar c={c} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-content-strong">{c.full_name}</p>
                        <p className="truncate text-xs text-content-muted">{c.health_goal || "—"}</p>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-content-muted">
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" />{c.daily_calorie_goal || 0} kcal</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>

          {/* Plans panel */}
          <div className="flex flex-col gap-4">
            {selectedClient ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <ClientAvatar c={selectedClient} size="h-10 w-10" fs="text-sm" />
                    <div>
                      <p className="text-sm font-bold text-content-strong">{selectedClient.full_name || t("pro.unnamedClient")}</p>
                      <p className="text-xs text-content-muted">{t("plans.assignTo")} {selectedClient.full_name}</p>
                    </div>
                  </div>
                  <Button onClick={openNewPlan} className="gap-2"><Plus className="h-4 w-4" />{t("plans.new")}</Button>
                </div>

                {clientPlans.length === 0 ? (
                  <EmptyState icon={Dumbbell} text={t("plans.noPlans")} sub={t("plans.noPlansSub")} />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {clientPlans.map((p) => {
                      const diet = p.plan_type === "diet";
                      return (
                        <Card key={p.id} className="bg-surface-card">
                          <CardContent className="flex flex-col gap-3 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                diet ? "bg-orange-50 text-orange-600" : "bg-cyan-50 text-cyan-600")}>
                                {diet ? <UtensilsCrossed className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
                                  p.active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500")}>
                                  {p.active ? t("plans.active") : t("plans.inactive")}
                                </span>
                                <button onClick={() => deletePlan(p.id)} aria-label={t("plans.deletePlan")}
                                  className="text-content-muted transition-colors hover:text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-content-strong">{p.title}</p>
                              {p.description && <p className="mt-1 text-xs text-content-muted">{p.description}</p>}
                            </div>
                            {diet && (
                              <div className="flex flex-wrap gap-2 text-[11px]">
                                {p.target_calories != null && <span className="rounded-md bg-surface-subtle px-2 py-1 text-content-body">{p.target_calories} kcal</span>}
                                {p.target_protein_g != null && <span className="rounded-md bg-surface-subtle px-2 py-1 text-content-body">P {p.target_protein_g}g</span>}
                                {p.target_carbs_g != null && <span className="rounded-md bg-surface-subtle px-2 py-1 text-content-body">C {p.target_carbs_g}g</span>}
                                {p.target_fat_g != null && <span className="rounded-md bg-surface-subtle px-2 py-1 text-content-body">G {p.target_fat_g}g</span>}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <EmptyState icon={Users} text={t("plans.selectClientFirst")} />
            )}
          </div>
        </div>
      )}

      {/* New Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setModalOpen(false)}>
          <Card className="w-full max-w-lg overflow-hidden rounded-b-none border-edge-base bg-surface-card shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-edge-base p-4">
              <h3 className="text-base font-bold text-content-strong">{t("plans.new")}</h3>
              <button onClick={() => setModalOpen(false)} className="text-content-muted transition-colors hover:text-content-strong">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {success ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <p className="text-sm font-semibold text-content-strong">{t("plans.success")}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {saveError && (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {(["diet", "workout"] as const).map((pt) => (
                      <button key={pt} onClick={() => setPlanType(pt)}
                        className={cn("flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                          planType === pt ? "border-primary-500 bg-primary-50 text-primary-600"
                            : "border-edge-base bg-surface-base text-content-muted hover:bg-surface-subtle")}>
                        {pt === "diet" ? <UtensilsCrossed className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                        {t(`plans.${pt}`)}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-content-muted">{t("plans.planTitle")}</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("plans.planTitlePlaceholder")} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-content-muted">{t("plans.description")}</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("plans.descriptionPlaceholder")} rows={2} className={taCls} />
                  </div>

                  {planType === "diet" ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-content-muted">{t("plans.targetCalories")}</label>
                        <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="2000" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-content-muted">{t("plans.macros")}</p>
                        <span className={`text-xs font-medium ${macroPctSum === 100 ? "text-green-600" : macroPctSum > 0 ? "text-amber-600" : "text-content-muted"}`}>
                          {macroPctSum}%{macroPctSum === 100 ? " ✓" : "/100%"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ v: proteinPct, set: setProteinPct, k: "plans.protein", g: macroGrams.protein },
                          { v: carbsPct, set: setCarbsPct, k: "plans.carbs", g: macroGrams.carbs },
                          { v: fatPct, set: setFatPct, k: "plans.fat", g: macroGrams.fat }].map((m) => (
                          <div key={m.k} className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-content-muted">{t(m.k)} (%)</label>
                            <Input type="number" min="0" max="100" value={m.v} onChange={(e) => m.set(e.target.value)} placeholder="0" />
                            <span className="text-[11px] text-content-muted">≈ {m.g ?? 0}g</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-content-muted">{t("plans.meals")}</p>
                        <Button variant="ghost" size="sm" onClick={addMeal} className="gap-1">
                          <Plus className="h-3.5 w-3.5" />{t("plans.addMeal")}
                        </Button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {meals.map((meal, i) => (
                          <div key={i} className="rounded-xl border border-edge-base bg-surface-base p-3">
                            <div className="flex items-center gap-2">
                              <Input value={meal.name}
                                onChange={(e) => setMeals((m) => m.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                                placeholder={t("plans.mealName")} />
                              {meals.length > 1 && (
                                <button onClick={() => removeMeal(i)} className="text-content-muted transition-colors hover:text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <textarea value={meal.items}
                              onChange={(e) => setMeals((m) => m.map((x, idx) => idx === i ? { ...x, items: e.target.value } : x))}
                              placeholder={t("plans.mealItemsPlaceholder")} rows={2} className={cn("mt-2", taCls)} />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-content-muted">{t("plans.workoutDays")}</p>
                        <Button variant="ghost" size="sm" onClick={addDay} className="gap-1">
                          <Plus className="h-3.5 w-3.5" />{t("plans.addDay")}
                        </Button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {days.map((day, i) => (
                          <div key={i} className="rounded-xl border border-edge-base bg-surface-base p-3">
                            <div className="flex items-center gap-2">
                              <Input value={day.name}
                                onChange={(e) => setDays((d) => d.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                                placeholder={t("plans.dayName")} />
                              {days.length > 1 && (
                                <button onClick={() => removeDay(i)} className="text-content-muted transition-colors hover:text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <textarea value={day.exercises}
                              onChange={(e) => setDays((d) => d.map((x, idx) => idx === i ? { ...x, exercises: e.target.value } : x))}
                              placeholder={t("plans.exercisePlaceholder")} rows={3} className={cn("mt-2", taCls)} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {!success && (
              <div className="flex items-center justify-end gap-2 border-t border-edge-base p-4">
                <Button variant="outline" onClick={() => setModalOpen(false)}>{t("cancel")}</Button>
                <Button onClick={savePlan} disabled={saving || !title.trim()} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t("plans.save")}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
