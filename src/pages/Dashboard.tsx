import { useEffect, useState, useRef } from "react";
import { Droplets, Flame, Scale, Plus, X, Search, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Meal } from "../lib/types";

const today = new Date().toISOString().slice(0, 10);

const mealTypeLabels: Record<string, string> = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

const mealTypeOptions = [
  { value: "breakfast", label: "Café da Manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "dinner", label: "Jantar" },
  { value: "snack", label: "Lanche" },
];

interface Food {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

interface MealForm {
  name: string;
  meal_type: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
}

const emptyForm: MealForm = {
  name: "",
  meal_type: "snack",
  calories: "",
  protein_g: "",
  carbs_g: "",
  fat_g: "",
};

export function Dashboard() {
  const { profile } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterTotal, setWaterTotal] = useState(0);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [form, setForm] = useState<MealForm>(emptyForm);
  const [waterAmount, setWaterAmount] = useState("0.25");
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState("1");
  const [customEntry, setCustomEntry] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const calGoal = profile?.daily_calorie_goal ?? 2400;
  const waterGoal = profile?.daily_water_goal_liters ?? 2.5;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setFoodResults([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadData() {
    setLoading(true);
    const [mealsRes, waterRes, weightRes] = await Promise.all([
      supabase.from("meals").select("*").eq("logged_date", today).order("created_at"),
      supabase.from("water_logs").select("amount_liters").eq("logged_date", today),
      supabase.from("weight_logs").select("weight_kg, logged_date").order("logged_date", { ascending: false }).limit(1),
    ]);
    if (mealsRes.data) setMeals(mealsRes.data);
    if (waterRes.data) {
      setWaterTotal(waterRes.data.reduce((s, r) => s + Number(r.amount_liters), 0));
    }
    if (weightRes.data?.[0]) setLatestWeight(Number(weightRes.data[0].weight_kg));
    setLoading(false);
  }

  async function searchFoods(query: string) {
    if (!query.trim()) {
      setFoodResults([]);
      return;
    }
    setSearching(true);
    const { data } = await supabase
      .from("foods")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(15);
    setFoodResults(data ?? []);
    setSearching(false);
  }

  function handleFoodSearch(value: string) {
    setFoodSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setFoodResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchFoods(value), 250);
  }

  function selectFood(food: Food) {
    setSelectedFood(food);
    setFoodSearch(food.name);
    setFoodResults([]);
    setServings("1");
    setCustomEntry(false);
    const n = parseFloat(servings) || 1;
    setForm({
      ...form,
      name: food.name,
      calories: String(Math.round(food.calories * n)),
      protein_g: String((Number(food.protein_g) * n).toFixed(1)),
      carbs_g: String((Number(food.carbs_g) * n).toFixed(1)),
      fat_g: String((Number(food.fat_g) * n).toFixed(1)),
    });
  }

  function updateServings(value: string) {
    setServings(value);
    if (!selectedFood) return;
    const n = parseFloat(value) || 1;
    setForm({
      ...form,
      name: selectedFood.name,
      calories: String(Math.round(selectedFood.calories * n)),
      protein_g: String((Number(selectedFood.protein_g) * n).toFixed(1)),
      carbs_g: String((Number(selectedFood.carbs_g) * n).toFixed(1)),
      fat_g: String((Number(selectedFood.fat_g) * n).toFixed(1)),
    });
  }

  function openMealModal() {
    setForm(emptyForm);
    setFoodSearch("");
    setFoodResults([]);
    setSelectedFood(null);
    setServings("1");
    setCustomEntry(false);
    setShowMealModal(true);
  }

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + Number(m.protein_g), 0);
  const totalCarbs = meals.reduce((s, m) => s + Number(m.carbs_g), 0);
  const totalFat = meals.reduce((s, m) => s + Number(m.fat_g), 0);

  const proteinGoal = Math.round(calGoal * 0.3 / 4);
  const carbsGoal = Math.round(calGoal * 0.45 / 4);
  const fatGoal = Math.round(calGoal * 0.25 / 9);

  const calPct = Math.min(100, Math.round((totalCalories / calGoal) * 100));
  const radius = 80;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (calPct / 100) * circ;

  async function saveMeal() {
    if (!form.name || !form.calories) return;
    setSaving(true);
    const { data } = await supabase
      .from("meals")
      .insert({
        name: form.name,
        meal_type: form.meal_type,
        calories: parseInt(form.calories) || 0,
        protein_g: parseFloat(form.protein_g) || 0,
        carbs_g: parseFloat(form.carbs_g) || 0,
        fat_g: parseFloat(form.fat_g) || 0,
        logged_date: today,
      })
      .select()
      .single();
    if (data) setMeals((prev) => [...prev, data]);
    setForm(emptyForm);
    setShowMealModal(false);
    setSaving(false);
  }

  async function deleteMeal(id: string) {
    await supabase.from("meals").delete().eq("id", id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  async function logWater() {
    const amount = parseFloat(waterAmount);
    if (!amount || amount <= 0) return;
    setSaving(true);
    await supabase.from("water_logs").insert({ amount_liters: amount, logged_date: today });
    setWaterTotal((prev) => prev + amount);
    setShowWaterModal(false);
    setWaterAmount("0.25");
    setSaving(false);
  }

  async function logWeight() {
    const w = parseFloat(newWeight);
    if (!w || w <= 0) return;
    setSaving(true);
    await supabase.from("weight_logs").insert({ weight_kg: w, logged_date: today });
    setLatestWeight(w);
    setShowWeightModal(false);
    setNewWeight("");
    setSaving(false);
  }

  const summaryCards = [
    {
      title: "Ingestão de Água",
      value: `${waterTotal.toFixed(2).replace(/\.?0+$/, "")}L`,
      subtitle: `Meta: ${waterGoal}L`,
      icon: Droplets,
      iconBg: "bg-primary-50",
      iconColor: "text-primary-500",
      onClick: () => setShowWaterModal(true),
    },
    {
      title: "Calorias Consumidas",
      value: String(totalCalories),
      subtitle: `Meta: ${calGoal} kcal`,
      icon: Flame,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      onClick: openMealModal,
    },
    {
      title: "Peso Atual",
      value: latestWeight ? `${latestWeight} kg` : "–",
      subtitle: profile?.goal_weight_kg ? `Meta: ${profile.goal_weight_kg} kg` : "Registre seu peso",
      icon: Scale,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      onClick: () => setShowWeightModal(true),
    },
  ];

  const macros = [
    { name: "Proteína", current: totalProtein, goal: proteinGoal, unit: "g", color: "bg-primary-500" },
    { name: "Carboidratos", current: totalCarbs, goal: carbsGoal, unit: "g", color: "bg-orange-400" },
    { name: "Gordura", current: totalFat, goal: fatGoal, unit: "g", color: "bg-violet-500" },
  ];

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-strong">Resumo do Dia</h1>
          <p className="mt-0.5 text-sm text-content-muted">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Button className="gap-2" onClick={openMealModal}>
          <Plus className="h-4 w-4" />
          Registrar Refeição
        </Button>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {summaryCards.map((card) => (
              <Card
                key={card.title}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={card.onClick}
              >
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-content-muted">{card.title}</span>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                      <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-content-strong">{card.value}</p>
                    <p className="mt-0.5 text-xs text-content-muted">{card.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardContent className="flex flex-col gap-8 p-6 md:flex-row md:items-center">
                <div className="flex shrink-0 justify-center">
                  <div className="relative flex h-48 w-48 items-center justify-center">
                    <svg className="h-48 w-48 -rotate-90" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r={radius} fill="none" stroke="#EFF6FF" strokeWidth="16" />
                      <circle
                        cx="100" cy="100" r={radius} fill="none" stroke="#3B82F6" strokeWidth="16"
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-content-strong">{totalCalories}</span>
                      <span className="mt-0.5 text-xs text-content-muted">de {calGoal} kcal</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-5">
                  <h3 className="text-lg font-semibold text-content-strong">Macronutrientes</h3>
                  {macros.map((m) => (
                    <div key={m.name} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-content-body">{m.name}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-semibold text-content-strong">{Math.round(m.current)}{m.unit}</span>
                          <span className="text-xs text-content-muted">/ {m.goal}{m.unit}</span>
                        </div>
                      </div>
                      <Progress
                        value={m.goal > 0 ? Math.min(100, (m.current / m.goal) * 100) : 0}
                        indicatorClassName={m.color}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-content-strong">Refeições</h3>
                  <button
                    onClick={openMealModal}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    + Adicionar
                  </button>
                </div>
                {meals.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                    <Flame className="mb-2 h-8 w-8 text-slate-200" />
                    <p className="text-sm text-content-muted">Nenhuma refeição registrada hoje</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {meals.map((meal, i) => (
                      <div
                        key={meal.id}
                        className={`group flex items-start justify-between py-3.5 ${
                          i < meals.length - 1 ? "border-b border-edge-base" : ""
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-content-strong">{meal.name}</p>
                          <p className="mt-0.5 text-xs text-content-muted">
                            {mealTypeLabels[meal.meal_type] ?? meal.meal_type}
                            <span className="ml-2 text-content-muted">
                              P:{Math.round(Number(meal.protein_g))}g C:{Math.round(Number(meal.carbs_g))}g G:{Math.round(Number(meal.fat_g))}g
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-content-body">{meal.calories} kcal</span>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="hidden text-slate-300 hover:text-red-500 group-hover:block"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-strong">Registrar Refeição</h2>
              <button onClick={() => setShowMealModal(false)} className="text-content-muted hover:text-content-body">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => { setCustomEntry(false); setSelectedFood(null); setForm(emptyForm); setFoodSearch(""); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  !customEntry ? "bg-primary-50 text-primary-700" : "text-content-muted hover:bg-surface-base"
                }`}
              >
                <Search className="h-4 w-4" />
                Buscar Alimento
              </button>
              <button
                onClick={() => { setCustomEntry(true); setSelectedFood(null); setFoodResults([]); setForm(emptyForm); }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  customEntry ? "bg-primary-50 text-primary-700" : "text-content-muted hover:bg-surface-base"
                }`}
              >
                <UtensilsCrossed className="h-4 w-4" />
                Inserir Manual
              </button>
            </div>

            <div className="space-y-3">
              {/* Food search */}
              {!customEntry && (
                <div ref={searchRef} className="relative">
                  <label className="text-sm font-medium text-content-body">Buscar alimento *</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
                    <Input
                      className="pl-9"
                      placeholder="Ex: Frango, Arroz, Banana..."
                      value={foodSearch}
                      onChange={(e) => handleFoodSearch(e.target.value)}
                      autoFocus
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                      </div>
                    )}
                  </div>
                  {foodResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-edge-base bg-surface-card shadow-lg">
                      {foodResults.map((food) => (
                        <button
                          key={food.id}
                          onClick={() => selectFood(food)}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-primary-50 first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-content-strong truncate">{food.name}</p>
                            <p className="text-xs text-content-muted">{food.category} · {food.serving_size}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-content-body">{food.calories} kcal</p>
                            <p className="text-[10px] text-content-muted">
                              P:{food.protein_g}g C:{food.carbs_g}g G:{food.fat_g}g
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {foodSearch.trim().length > 2 && foodResults.length === 0 && !searching && (
                    <p className="mt-1.5 text-xs text-content-muted">Nenhum alimento encontrado. Tente outro termo ou insira manualmente.</p>
                  )}
                </div>
              )}

              {/* Selected food info */}
              {selectedFood && !customEntry && (
                <div className="rounded-xl border border-primary-200 bg-primary-50 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-content-strong">{selectedFood.name}</p>
                      <p className="text-xs text-content-muted">{selectedFood.category} · Porção: {selectedFood.serving_size}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedFood(null); setFoodSearch(""); setForm(emptyForm); }}
                      className="text-content-muted hover:text-content-body"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs font-medium text-content-body">Qtd de porções:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.25"
                      value={servings}
                      onChange={(e) => updateServings(e.target.value)}
                      className="w-20 rounded-lg border border-primary-300 bg-surface-card px-2 py-1 text-sm text-content-strong focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg bg-surface-card px-2 py-1">
                      <p className="text-sm font-bold text-content-strong">{form.calories}</p>
                      <p className="text-[10px] text-content-muted">kcal</p>
                    </div>
                    <div className="rounded-lg bg-surface-card px-2 py-1">
                      <p className="text-sm font-bold text-primary-600">{form.protein_g}</p>
                      <p className="text-[10px] text-content-muted">Prot (g)</p>
                    </div>
                    <div className="rounded-lg bg-surface-card px-2 py-1">
                      <p className="text-sm font-bold text-orange-600">{form.carbs_g}</p>
                      <p className="text-[10px] text-content-muted">Carb (g)</p>
                    </div>
                    <div className="rounded-lg bg-surface-card px-2 py-1">
                      <p className="text-sm font-bold text-amber-600">{form.fat_g}</p>
                      <p className="text-[10px] text-content-muted">Gord (g)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal type */}
              <div>
                <label className="text-sm font-medium text-content-body">Tipo de refeição</label>
                <select
                  className="mt-1 flex h-10 w-full rounded-lg border border-edge-base bg-surface-card px-3 py-2 text-sm text-content-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  value={form.meal_type}
                  onChange={(e) => setForm({ ...form, meal_type: e.target.value })}
                >
                  {mealTypeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Manual entry fields */}
              {customEntry && (
                <>
                  <div>
                    <label className="text-sm font-medium text-content-body">Nome *</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex: Frango com arroz"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-content-body">Calorias (kcal) *</label>
                      <Input className="mt-1" type="number" placeholder="0" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-content-body">Proteína (g)</label>
                      <Input className="mt-1" type="number" placeholder="0" value={form.protein_g} onChange={(e) => setForm({ ...form, protein_g: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-content-body">Carboidratos (g)</label>
                      <Input className="mt-1" type="number" placeholder="0" value={form.carbs_g} onChange={(e) => setForm({ ...form, carbs_g: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-content-body">Gordura (g)</label>
                      <Input className="mt-1" type="number" placeholder="0" value={form.fat_g} onChange={(e) => setForm({ ...form, fat_g: e.target.value })} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowMealModal(false)}>Cancelar</Button>
              <Button
                className="flex-1"
                onClick={saveMeal}
                disabled={saving || !form.name || !form.calories}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Water Modal */}
      {showWaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-strong">Registrar Água</h2>
              <button onClick={() => setShowWaterModal(false)} className="text-content-muted hover:text-content-body">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              {["0.25", "0.5", "1.0"].map((v) => (
                <button
                  key={v}
                  onClick={() => setWaterAmount(v)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    waterAmount === v ? "border-primary-600 bg-primary-50 text-primary-700" : "border-edge-base text-content-body hover:bg-surface-base"
                  }`}
                >
                  {v}L
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-content-body">Quantidade personalizada (L)</label>
              <Input
                className="mt-1"
                type="number"
                step="0.05"
                min="0.05"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-content-muted">
              Total hoje: {waterTotal.toFixed(2)}L / {waterGoal}L
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowWaterModal(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={logWater} disabled={saving}>
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-strong">Registrar Peso</h2>
              <button onClick={() => setShowWeightModal(false)} className="text-content-muted hover:text-content-body">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-content-body">Peso (kg)</label>
              <Input
                className="mt-1"
                type="number"
                step="0.1"
                placeholder={latestWeight ? String(latestWeight) : "75.0"}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowWeightModal(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={logWeight} disabled={saving || !newWeight}>
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
