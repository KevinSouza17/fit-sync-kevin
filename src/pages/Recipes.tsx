import { useEffect, useState, useRef } from "react";
import { Search, UtensilsCrossed, Plus, X, Flame } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";

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

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Carnes": { bg: "bg-red-50", text: "text-red-600" },
  "Peixes": { bg: "bg-cyan-50", text: "text-cyan-600" },
  "Ovos e Laticínios": { bg: "bg-amber-50", text: "text-amber-600" },
  "Grãos e Cereais": { bg: "bg-yellow-50", text: "text-yellow-700" },
  "Frutas": { bg: "bg-green-50", text: "text-green-600" },
  "Verduras e Legumes": { bg: "bg-emerald-50", text: "text-emerald-600" },
  "Oleaginosas": { bg: "bg-orange-50", text: "text-orange-600" },
  "Açúcares": { bg: "bg-pink-50", text: "text-pink-600" },
  "Bebidas": { bg: "bg-primary-50", text: "text-primary-600" },
  "Preparações": { bg: "bg-violet-50", text: "text-violet-600" },
  "Condimentos": { bg: "bg-surface-base", text: "text-content-body" },
  "Suplementos": { bg: "bg-teal-50", text: "text-teal-600" },
};

const mealTypeOptions = [
  { value: "breakfast", label: "Café da Manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "dinner", label: "Jantar" },
  { value: "snack", label: "Lanche" },
];

export function Recipes() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filtered, setFiltered] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState("1");
  const [mealType, setMealType] = useState("snack");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    loadFoods();
  }, []);

  async function loadFoods() {
    setLoading(true);
    const { data } = await supabase.from("foods").select("*").order("category").order("name");
    if (data) {
      setFoods(data);
      setFiltered(data);
      const cats = [...new Set(data.map((f) => f.category))];
      setCategories(cats);
    }
    setLoading(false);
  }

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFilters(value, activeCategory), 200);
  }

  function handleCategoryFilter(cat: string | null) {
    const next = activeCategory === cat ? null : cat;
    setActiveCategory(next);
    applyFilters(search, next);
  }

  function applyFilters(query: string, cat: string | null) {
    let result = foods;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );
    }
    if (cat) {
      result = result.filter((f) => f.category === cat);
    }
    setFiltered(result);
  }

  function openFoodDetail(food: Food) {
    setSelectedFood(food);
    setServings("1");
    setMealType("snack");
    setSaved(false);
  }

  function computedValues() {
    if (!selectedFood) return { cal: 0, prot: "0", carb: "0", fat: "0", fiber: "0" };
    const n = parseFloat(servings) || 1;
    return {
      cal: Math.round(selectedFood.calories * n),
      prot: (Number(selectedFood.protein_g) * n).toFixed(1),
      carb: (Number(selectedFood.carbs_g) * n).toFixed(1),
      fat: (Number(selectedFood.fat_g) * n).toFixed(1),
      fiber: (Number(selectedFood.fiber_g) * n).toFixed(1),
    };
  }

  async function addFromCatalog() {
    if (!selectedFood) return;
    setSaving(true);
    const n = parseFloat(servings) || 1;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("meals")
      .insert({
        name: selectedFood.name,
        meal_type: mealType,
        calories: Math.round(selectedFood.calories * n),
        protein_g: (Number(selectedFood.protein_g) * n).toFixed(1),
        carbs_g: (Number(selectedFood.carbs_g) * n).toFixed(1),
        fat_g: (Number(selectedFood.fat_g) * n).toFixed(1),
        logged_date: today,
      })
      .select()
      .single();
    setSaving(false);
    if (data) {
      setSaved(true);
      setTimeout(() => {
        setSelectedFood(null);
        setSaved(false);
      }, 1500);
    }
  }

  const totalFoods = foods.length;

  return (
    <div className="flex flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold text-content-strong">Catálogo de Alimentos</h1>
        <p className="mt-0.5 text-sm text-content-muted">
          Pesquise e selecione alimentos para registrar automaticamente calorias e nutrientes
        </p>
      </header>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-muted" />
        <input
          className="flex h-12 w-full rounded-xl border border-edge-base bg-surface-card pl-12 pr-4 text-base text-content-strong placeholder:text-content-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          placeholder="Buscar alimento por nome ou categoria..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryFilter(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !activeCategory ? "bg-primary-600 text-white" : "bg-surface-subtle text-content-body hover:bg-slate-200"
          }`}
        >
          Todos ({totalFoods})
        </button>
        {categories.map((cat) => {
          const count = foods.filter((f) => f.category === cat).length;
          const color = categoryColors[cat] ?? { bg: "bg-surface-subtle", text: "text-content-body" };
          return (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? `${color.bg} ${color.text} ring-2 ring-offset-1 ring-current`
                  : "bg-surface-subtle text-content-body hover:bg-slate-200"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <UtensilsCrossed className="mb-3 h-12 w-12 text-slate-200" />
            <h3 className="text-base font-semibold text-content-body">Nenhum alimento encontrado</h3>
            <p className="mt-1 text-sm text-content-muted">Tente outro termo de busca ou selecione outra categoria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((food) => {
            const color = categoryColors[food.category] ?? { bg: "bg-surface-base", text: "text-content-body" };
            return (
              <Card
                key={food.id}
                className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => openFoodDetail(food)}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-content-strong leading-tight">{food.name}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${color.bg} ${color.text}`}>
                      {food.category}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-content-muted">Porção: {food.serving_size}</p>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="rounded-lg bg-surface-base px-1 py-1.5">
                      <p className="text-sm font-bold text-content-strong">{food.calories}</p>
                      <p className="text-[9px] text-content-muted">kcal</p>
                    </div>
                    <div className="rounded-lg bg-primary-50 px-1 py-1.5">
                      <p className="text-sm font-bold text-primary-600">{food.protein_g}</p>
                      <p className="text-[9px] text-content-muted">Prot</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 px-1 py-1.5">
                      <p className="text-sm font-bold text-orange-600">{food.carbs_g}</p>
                      <p className="text-[9px] text-content-muted">Carb</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 px-1 py-1.5">
                      <p className="text-sm font-bold text-amber-600">{food.fat_g}</p>
                      <p className="text-[9px] text-content-muted">Gord</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Food detail drawer */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface-card p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-content-strong">{selectedFood.name}</h2>
                <p className="text-sm text-content-muted">
                  {selectedFood.category} · Porção: {selectedFood.serving_size}
                </p>
              </div>
              <button onClick={() => setSelectedFood(null)} className="text-content-muted hover:text-content-body">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nutrition per serving */}
            <div className="mb-4 grid grid-cols-5 gap-2 text-center">
              <div className="rounded-xl bg-surface-base p-2">
                <p className="text-lg font-bold text-content-strong">{selectedFood.calories}</p>
                <p className="text-[10px] text-content-muted">kcal</p>
              </div>
              <div className="rounded-xl bg-primary-50 p-2">
                <p className="text-lg font-bold text-primary-600">{selectedFood.protein_g}</p>
                <p className="text-[10px] text-content-muted">Prot (g)</p>
              </div>
              <div className="rounded-xl bg-orange-50 p-2">
                <p className="text-lg font-bold text-orange-600">{selectedFood.carbs_g}</p>
                <p className="text-[10px] text-content-muted">Carb (g)</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2">
                <p className="text-lg font-bold text-amber-600">{selectedFood.fat_g}</p>
                <p className="text-[10px] text-content-muted">Gord (g)</p>
              </div>
              <div className="rounded-xl bg-green-50 p-2">
                <p className="text-lg font-bold text-green-600">{selectedFood.fiber_g}</p>
                <p className="text-[10px] text-content-muted">Fibra (g)</p>
              </div>
            </div>

            {/* Add to diary section */}
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-content-strong">
                <Plus className="h-4 w-4" />
                Adicionar ao diário de hoje
              </h3>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs font-medium text-content-body">Porções</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.25"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="mt-1 block w-20 rounded-lg border border-primary-300 bg-surface-card px-2 py-1.5 text-sm text-content-strong focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-content-body">Refeição</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="mt-1 block rounded-lg border border-primary-300 bg-surface-card px-2 py-1.5 text-sm text-content-strong focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
                  >
                    {mealTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={addFromCatalog}
                  disabled={saving || saved}
                  className="gap-2"
                >
                  {saved ? (
                    <>
                      <Flame className="h-4 w-4" />
                      Adicionado!
                    </>
                  ) : saving ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>

              {/* Computed values */}
              <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
                {(() => {
                  const v = computedValues();
                  return (
                    <>
                      <div className="rounded-lg bg-surface-card px-1 py-1">
                        <p className="text-sm font-bold text-content-strong">{v.cal}</p>
                        <p className="text-[9px] text-content-muted">kcal</p>
                      </div>
                      <div className="rounded-lg bg-surface-card px-1 py-1">
                        <p className="text-sm font-bold text-primary-600">{v.prot}</p>
                        <p className="text-[9px] text-content-muted">Prot</p>
                      </div>
                      <div className="rounded-lg bg-surface-card px-1 py-1">
                        <p className="text-sm font-bold text-orange-600">{v.carb}</p>
                        <p className="text-[9px] text-content-muted">Carb</p>
                      </div>
                      <div className="rounded-lg bg-surface-card px-1 py-1">
                        <p className="text-sm font-bold text-amber-600">{v.fat}</p>
                        <p className="text-[9px] text-content-muted">Gord</p>
                      </div>
                      <div className="rounded-lg bg-surface-card px-1 py-1">
                        <p className="text-sm font-bold text-green-600">{v.fiber}</p>
                        <p className="text-[9px] text-content-muted">Fibra</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedFood(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
