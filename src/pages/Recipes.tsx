import { Search, Clock, Flame, BookOpen } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

const categories = ["Todas", "Café da Manhã", "Almoço", "Jantar", "Lanche", "Shake"];

const recipes = [
  { name: "Oatmeal com Frutas Vermelhas", category: "Café da Manhã", time: "10 min", kcal: 320, protein: "12g", tag: "Vegano" },
  { name: "Frango Grelhado com Quinoa", category: "Almoço", time: "25 min", kcal: 450, protein: "42g", tag: "High Protein" },
  { name: "Omelete de Claras", category: "Café da Manhã", time: "8 min", kcal: 220, protein: "28g", tag: "Low Carb" },
  { name: "Salmão ao Forno", category: "Jantar", time: "30 min", kcal: 380, protein: "38g", tag: "Omega-3" },
  { name: "Shake de Proteína e Banana", category: "Shake", time: "5 min", kcal: 280, protein: "30g", tag: "Pós-treino" },
  { name: "Salada Caesar Fit", category: "Almoço", time: "15 min", kcal: 310, protein: "25g", tag: "Leve" },
];

export function Recipes() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Receitas</h1>
          <p className="mt-0.5 text-sm text-slate-500">Receitas saudáveis para sua dieta</p>
        </div>
      </header>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Buscar receitas..." className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                cat === "Todas"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.name} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-36 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-200" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{recipe.name}</h3>
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  {recipe.tag}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{recipe.category}</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {recipe.time}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  {recipe.kcal} kcal
                </div>
                <div className="text-xs text-slate-500">Prot: {recipe.protein}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
