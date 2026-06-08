import { Droplets, Flame, Scale, Plus } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";

const summaryCards = [
  {
    title: "Ingestão de Água",
    value: "1.2L",
    subtitle: "Meta: 2.5L",
    icon: Droplets,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    title: "Calorias Gastas",
    value: "450",
    subtitle: "De 2 Treinos",
    icon: Flame,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    title: "Peso Atual",
    value: "75.2 kg",
    subtitle: "-0.3 kg esta semana",
    icon: Scale,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
];

const macroNutrients = [
  { name: "Proteína", current: "120g", target: "150g", progress: 80, color: "bg-blue-500" },
  { name: "Carboidratos", current: "180g", target: "250g", progress: 72, color: "bg-orange-400" },
  { name: "Gordura", current: "45g", target: "70g", progress: 64, color: "bg-violet-500" },
];

const meals = [
  { name: "Oatmeal & Berries", type: "Café da Manhã", calories: "320 kcal" },
  { name: "Grilled Chicken Salad", type: "Almoço", calories: "450 kcal" },
  { name: "Protein Shake", type: "Lanche", calories: "210 kcal" },
  { name: "Salmon & Quinoa", type: "Jantar", calories: "580 kcal" },
];

const totalCalories = 1840;
const goalCalories = 2400;
const percentage = (totalCalories / goalCalories) * 100;

const radius = 80;
const circumference = 2 * Math.PI * radius;
const offset = circumference - (percentage / 100) * circumference;

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumo do Dia</h1>
          <p className="mt-0.5 text-sm text-slate-500">Quinta-feira, 24 de Outubro</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Refeição
        </Button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{card.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Calories + Macros */}
        <Card className="xl:col-span-2">
          <CardContent className="flex flex-col gap-8 p-6 md:flex-row md:items-center">
            {/* Ring chart */}
            <div className="flex shrink-0 justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center">
                <svg className="h-48 w-48 -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#EFF6FF"
                    strokeWidth="16"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{totalCalories}</span>
                  <span className="mt-0.5 text-xs text-slate-500">de {goalCalories} kcal</span>
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="flex flex-1 flex-col gap-5">
              <h3 className="text-lg font-semibold text-slate-900">Macronutrientes</h3>
              {macroNutrients.map((macro) => (
                <div key={macro.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{macro.name}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-slate-900">{macro.current}</span>
                      <span className="text-xs text-slate-400">/ {macro.target}</span>
                    </div>
                  </div>
                  <Progress value={macro.progress} indicatorClassName={macro.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meals */}
        <Card>
          <CardContent className="flex flex-col p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Refeições</h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Ver Tudo
              </button>
            </div>
            <div className="flex flex-col">
              {meals.map((meal, index) => (
                <div
                  key={meal.name}
                  className={`flex items-start justify-between py-3.5 ${
                    index < meals.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{meal.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{meal.type}</p>
                  </div>
                  <span className="text-sm text-slate-700">{meal.calories}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
