import { Plus, TrendingUp, Target, Flame, Dumbbell, Scale } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

const nutritionGoals = [
  { label: "Proteína Diária", current: 120, target: 150, unit: "g", color: "bg-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { label: "Carboidratos", current: 180, target: 250, unit: "g", color: "bg-orange-400", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  { label: "Gorduras", current: 45, target: 70, unit: "g", color: "bg-violet-500", iconBg: "bg-violet-50", iconColor: "text-violet-500" },
  { label: "Ingestão de Água", current: 1.2, target: 2.5, unit: "L", color: "bg-cyan-500", iconBg: "bg-cyan-50", iconColor: "text-cyan-500" },
  { label: "Calorias Totais", current: 1840, target: 2400, unit: "kcal", color: "bg-red-400", iconBg: "bg-red-50", iconColor: "text-red-500" },
];

const weeklyWorkouts = [
  { day: "Seg", done: true },
  { day: "Ter", done: true },
  { day: "Qua", done: false },
  { day: "Qui", done: true },
  { day: "Sex", done: false },
  { day: "Sáb", done: false },
  { day: "Dom", done: false },
];

const courseGoals = [
  {
    title: "Correr 5km sem parar",
    category: "Cardio",
    progress: 68,
    deadline: "30 Dez 2024",
    color: "bg-green-500",
  },
  {
    title: "Supinar 100 kg",
    category: "Força",
    progress: 80,
    deadline: "15 Jan 2025",
    color: "bg-blue-500",
  },
  {
    title: "Perder 5 kg de gordura",
    category: "Composição",
    progress: 45,
    deadline: "28 Fev 2025",
    color: "bg-orange-400",
  },
];

const metaCards = [
  { icon: Scale, label: "Peso Atual", value: "75.2 kg", sub: "Meta: 78 kg", iconBg: "bg-green-50", iconColor: "text-green-500" },
  { icon: Flame, label: "Calorias / Dia", value: "2.400", sub: "Média: 2.200 kcal", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  { icon: Dumbbell, label: "Treinos / Semana", value: "4 / 5", sub: "Meta semanal", iconBg: "bg-blue-50", iconColor: "text-blue-500" },
  { icon: TrendingUp, label: "Streak Atual", value: "12 dias", sub: "Recorde: 21 dias", iconBg: "bg-violet-50", iconColor: "text-violet-500" },
];

export function Goals() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minhas Metas</h1>
          <p className="mt-0.5 text-sm text-slate-500">Acompanhe seu progresso e objetivos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metaCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{card.label}</p>
                <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Nutrition goals */}
        <Card className="xl:col-span-2">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Minha Nutrição</h2>
              <span className="text-xs text-slate-400">Hoje</span>
            </div>
            <div className="flex flex-col gap-5">
              {nutritionGoals.map((goal) => {
                const pct = Math.round((goal.current / goal.target) * 100);
                return (
                  <div key={goal.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{goal.label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-900">
                          {goal.current}{goal.unit}
                        </span>
                        <span className="text-xs text-slate-400">/ {goal.target}{goal.unit}</span>
                        <span className="ml-2 text-xs font-medium text-slate-500">{pct}%</span>
                      </div>
                    </div>
                    <Progress value={pct} indicatorClassName={goal.color} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weekly workouts */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Metas Offline</h2>
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-500">Treinos esta semana</p>
              <div className="mt-3 flex items-end gap-2">
                {weeklyWorkouts.map((day) => (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className={`h-8 w-full rounded-md ${
                        day.done ? "bg-blue-600" : "bg-slate-100"
                      }`}
                    />
                    <span className="text-xs text-slate-500">{day.day}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-900">2 de 5</span> treinos concluídos
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-medium text-slate-500">Passos diários</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">8.432</p>
                  <p className="text-xs text-slate-500">Meta: 10.000</p>
                </div>
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#EFF6FF" strokeWidth="6" />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - 0.84)}
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-900">84%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course goals */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Objetivos de Curso</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todos</button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {courseGoals.map((goal) => (
              <div key={goal.title} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{goal.title}</p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {goal.category}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Progresso</span>
                    <span className="text-xs font-semibold text-slate-900">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} indicatorClassName={goal.color} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">Prazo: {goal.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
