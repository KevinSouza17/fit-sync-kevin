import { useState } from "react";
import { Plus, Check, ChevronRight, Dumbbell, Apple, Droplets, Moon } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";

interface Task {
  id: number;
  text: string;
  done: boolean;
  category: string;
}

const initialTasks: Task[] = [
  { id: 1, text: "Tomar 2.5L de água", done: true, category: "Hidratação" },
  { id: 2, text: "Fazer 30 min de cardio", done: true, category: "Treino" },
  { id: 3, text: "Registrar café da manhã", done: true, category: "Nutrição" },
  { id: 4, text: "Treino de força - superior", done: false, category: "Treino" },
  { id: 5, text: "Registrar almoço", done: false, category: "Nutrição" },
  { id: 6, text: "Alongamento 15 min", done: false, category: "Treino" },
  { id: 7, text: "Dormir 8 horas", done: false, category: "Descanso" },
];

const exercises = [
  { name: "Supino Reto", sets: "4x12", weight: "80 kg", done: true },
  { name: "Remada Curvada", sets: "3x10", weight: "70 kg", done: true },
  { name: "Desenvolvimento", sets: "3x12", weight: "50 kg", done: false },
  { name: "Rosca Direta", sets: "3x15", weight: "30 kg", done: false },
  { name: "Tríceps Pulley", sets: "4x12", weight: "35 kg", done: false },
];

const dailyStats = [
  { icon: Droplets, label: "Água", value: "1.2L / 2.5L", progress: 48, color: "bg-blue-500", iconColor: "text-blue-500", bg: "bg-blue-50" },
  { icon: Apple, label: "Calorias", value: "1840 / 2400", progress: 77, color: "bg-orange-400", iconColor: "text-orange-500", bg: "bg-orange-50" },
  { icon: Dumbbell, label: "Treino", value: "2 / 3 exerc.", progress: 67, color: "bg-violet-500", iconColor: "text-violet-500", bg: "bg-violet-50" },
  { icon: Moon, label: "Sono", value: "7h / 8h", progress: 88, color: "bg-indigo-500", iconColor: "text-indigo-500", bg: "bg-indigo-50" },
];

export function Diary() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Diário</h1>
          <p className="mt-0.5 text-sm text-slate-500">Quinta-feira, 24 de Outubro</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Entrada
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Tasks */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Tarefas</h2>
                  <p className="text-xs text-slate-500">{done} de {tasks.length} concluídas</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  + Adicionar
                </button>
              </div>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(done / tasks.length) * 100}%` }}
                />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        task.done
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {task.done && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`text-sm font-medium ${
                          task.done ? "text-slate-400 line-through" : "text-slate-900"
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{task.category}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exercises */}
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Treino de Hoje</h2>
                <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                  Superior A
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.name}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          ex.done ? "bg-blue-600" : "bg-slate-100"
                        }`}
                      >
                        <Dumbbell
                          className={`h-4 w-4 ${ex.done ? "text-white" : "text-slate-400"}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ex.name}</p>
                        <p className="text-xs text-slate-500">{ex.sets}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{ex.weight}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - profile + daily stats */}
        <div className="flex flex-col gap-4">
          {/* Profile card */}
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-blue-50 text-2xl font-bold text-blue-700">
                  LS
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-3 text-lg font-bold text-slate-900">Lucas Silva</h3>
              <p className="text-sm text-slate-500">Plano Pro</p>

              <div className="mt-5 grid w-full grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-slate-900">75</span>
                  <span className="text-xs text-slate-500">kg</span>
                </div>
                <div className="flex flex-col items-center border-x border-slate-100">
                  <span className="text-lg font-bold text-slate-900">178</span>
                  <span className="text-xs text-slate-500">cm</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-slate-900">23.6</span>
                  <span className="text-xs text-slate-500">IMC</span>
                </div>
              </div>

              <div className="mt-4 w-full rounded-xl bg-blue-50 px-4 py-3 text-left">
                <p className="text-xs font-medium text-blue-700">Objetivo Principal</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">Hipertrofia Muscular</p>
              </div>
            </CardContent>
          </Card>

          {/* Daily stats */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-base font-semibold text-slate-900">Progresso do Dia</h3>
              <div className="flex flex-col gap-4">
                {dailyStats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${stat.bg}`}>
                          <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                        </div>
                        <span className="text-sm text-slate-600">{stat.label}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-700">{stat.value}</span>
                    </div>
                    <Progress value={stat.progress} indicatorClassName={stat.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-base font-semibold text-slate-900">Notificações</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <p className="text-xs text-slate-700">Hora do lanche! Não esqueça de registrar.</p>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                  <p className="text-xs text-slate-700">Treino de pernas amanhã às 07:00.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
