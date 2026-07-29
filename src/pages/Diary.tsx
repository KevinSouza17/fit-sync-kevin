import { useEffect, useState } from "react";
import { Plus, Check, ChevronRight, Dumbbell, Apple, Droplets, Moon, X, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { DiaryTask, Exercise } from "../lib/types";

const today = new Date().toISOString().slice(0, 10);

const categoryOptions = ["Hidratação", "Treino", "Nutrição", "Descanso", "Geral"];
const workoutTypes = ["Superior A", "Superior B", "Inferior A", "Inferior B", "Full Body", "Cardio"];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function Diary() {
  const { profile, user } = useAuth();
  const [tasks, setTasks] = useState<DiaryTask[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskCategory, setTaskCategory] = useState("Geral");

  const [showExModal, setShowExModal] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [exForm, setExForm] = useState({ name: "", sets: "3x12", weight_kg: "", workout_type: "Superior A" });
  const [saving, setSaving] = useState(false);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
  const height = profile?.height_cm;
  const weight = profile?.weight_kg;
  const bmi = height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : null;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [tasksRes, exRes] = await Promise.all([
      supabase.from("diary_tasks").select("*").eq("task_date", today).order("sort_order").order("created_at"),
      supabase.from("exercises").select("*").eq("exercise_date", today).order("created_at"),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (exRes.data) setExercises(exRes.data);
    setLoading(false);
  }

  async function toggleTask(task: DiaryTask) {
    const { data } = await supabase
      .from("diary_tasks")
      .update({ done: !task.done })
      .eq("id", task.id)
      .select()
      .single();
    if (data) setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
  }

  async function deleteTask(id: string) {
    await supabase.from("diary_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function addTask() {
    if (!taskText.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("diary_tasks")
      .insert({ text: taskText, category: taskCategory, task_date: today, sort_order: tasks.length })
      .select()
      .single();
    if (data) setTasks((prev) => [...prev, data]);
    setTaskText("");
    setTaskCategory("Geral");
    setShowTaskModal(false);
    setSaving(false);
  }

  async function toggleExercise(ex: Exercise) {
    const { data } = await supabase
      .from("exercises")
      .update({ done: !ex.done })
      .eq("id", ex.id)
      .select()
      .single();
    if (data) setExercises((prev) => prev.map((e) => (e.id === ex.id ? data : e)));
  }

  async function saveExercise() {
    if (!exForm.name.trim()) return;
    setSaving(true);
    if (editingEx) {
      const { data } = await supabase
        .from("exercises")
        .update({
          name: exForm.name,
          sets: exForm.sets,
          weight_kg: exForm.weight_kg ? parseFloat(exForm.weight_kg) : null,
          workout_type: exForm.workout_type,
        })
        .eq("id", editingEx.id)
        .select()
        .single();
      if (data) setExercises((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    } else {
      const { data } = await supabase
        .from("exercises")
        .insert({
          name: exForm.name,
          sets: exForm.sets,
          weight_kg: exForm.weight_kg ? parseFloat(exForm.weight_kg) : null,
          workout_type: exForm.workout_type,
          exercise_date: today,
        })
        .select()
        .single();
      if (data) setExercises((prev) => [...prev, data]);
    }
    setExForm({ name: "", sets: "3x12", weight_kg: "", workout_type: "Superior A" });
    setEditingEx(null);
    setShowExModal(false);
    setSaving(false);
  }

  function openEditExercise(ex: Exercise) {
    setEditingEx(ex);
    setExForm({ name: ex.name, sets: ex.sets, weight_kg: ex.weight_kg ? String(ex.weight_kg) : "", workout_type: ex.workout_type });
    setShowExModal(true);
  }

  function openAddExercise() {
    setEditingEx(null);
    setExForm({ name: "", sets: "3x12", weight_kg: "", workout_type: "Superior A" });
    setShowExModal(true);
  }

  async function deleteExercise(id: string) {
    await supabase.from("exercises").delete().eq("id", id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  const done = tasks.filter((t) => t.done).length;

  const dailyStats = [
    { icon: Droplets, label: "Água", value: "–", progress: 0, color: "bg-primary-500", iconColor: "text-primary-500", bg: "bg-primary-50" },
    { icon: Apple, label: "Calorias", value: "–", progress: 0, color: "bg-orange-400", iconColor: "text-orange-500", bg: "bg-orange-50" },
    { icon: Dumbbell, label: "Treino", value: `${exercises.filter((e) => e.done).length} / ${exercises.length}`, progress: exercises.length > 0 ? (exercises.filter((e) => e.done).length / exercises.length) * 100 : 0, color: "bg-violet-500", iconColor: "text-violet-500", bg: "bg-violet-50" },
    { icon: Moon, label: "Tarefas", value: `${done} / ${tasks.length}`, progress: tasks.length > 0 ? (done / tasks.length) * 100 : 0, color: "bg-indigo-500", iconColor: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-strong">Diário</h1>
          <p className="mt-0.5 text-sm text-content-muted">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowTaskModal(true)}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            {/* Tasks */}
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-content-strong">Tarefas</h2>
                    <p className="text-xs text-content-muted">{done} de {tasks.length} concluídas</p>
                  </div>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    + Adicionar
                  </button>
                </div>
                {tasks.length > 0 && (
                  <Progress
                    value={tasks.length > 0 ? (done / tasks.length) * 100 : 0}
                    className="mb-4"
                  />
                )}
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Check className="mb-2 h-8 w-8 text-slate-200" />
                    <p className="text-sm text-content-muted">Nenhuma tarefa para hoje</p>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Adicionar primeira tarefa
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-base"
                      >
                        <button
                          onClick={() => toggleTask(task)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            task.done ? "border-primary-600 bg-primary-600" : "border-edge-base bg-surface-card"
                          }`}
                        >
                          {task.done && <Check className="h-3 w-3 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${task.done ? "text-content-muted line-through" : "text-content-strong"}`}>
                            {task.text}
                          </span>
                        </div>
                        <span className="text-xs text-content-muted">{task.category}</span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="hidden text-slate-300 hover:text-red-500 group-hover:block"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exercises */}
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-content-strong">Treino de Hoje</h2>
                  <button
                    onClick={() => setShowExModal(true)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    + Adicionar
                  </button>
                </div>
                {exercises.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Dumbbell className="mb-2 h-8 w-8 text-slate-200" />
                    <p className="text-sm text-content-muted">Nenhum exercício registrado</p>
                    <button
                      onClick={openAddExercise}
                      className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      Adicionar exercício
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="group flex items-center justify-between rounded-xl border border-edge-base px-4 py-3 transition-colors hover:bg-surface-base"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExercise(ex)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              ex.done ? "bg-primary-600" : "bg-surface-subtle"
                            }`}
                          >
                            <Dumbbell className={`h-4 w-4 ${ex.done ? "text-white" : "text-content-muted"}`} />
                          </button>
                          <div className="cursor-pointer" onClick={() => openEditExercise(ex)}>
                            <p className="text-sm font-medium text-content-strong">{ex.name}</p>
                            <p className="text-xs text-content-muted">{ex.sets}{ex.weight_kg ? ` · ${ex.weight_kg} kg` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditExercise(ex)}
                            className="hidden text-content-muted hover:text-primary-600 group-hover:block"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteExercise(ex.id)}
                            className="hidden text-slate-300 hover:text-red-500 group-hover:block"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Avatar className="h-20 w-20">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={displayName} />
                  ) : (
                    <AvatarFallback className="bg-primary-50 text-2xl font-bold text-primary-700">
                      {initials(displayName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="mt-3 text-lg font-bold text-content-strong">{displayName}</h3>
                <p className="text-sm text-content-muted">{profile?.plan === "pro" ? "Plano Pro" : "Plano Free"}</p>
                <div className="mt-5 grid w-full grid-cols-3 gap-2 border-t border-edge-base pt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-content-strong">{weight ?? "–"}</span>
                    <span className="text-xs text-content-muted">kg</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-edge-base">
                    <span className="text-lg font-bold text-content-strong">{height ?? "–"}</span>
                    <span className="text-xs text-content-muted">cm</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-content-strong">{bmi ?? "–"}</span>
                    <span className="text-xs text-content-muted">IMC</span>
                  </div>
                </div>
                {profile?.health_goal && (
                  <div className="mt-4 w-full rounded-xl bg-primary-50 px-4 py-3 text-left">
                    <p className="text-xs font-medium text-primary-700">Objetivo Principal</p>
                    <p className="mt-0.5 text-sm font-semibold text-content-strong">{profile.health_goal}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 text-base font-semibold text-content-strong">Progresso do Dia</h3>
                <div className="flex flex-col gap-4">
                  {dailyStats.map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${stat.bg}`}>
                            <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                          </div>
                          <span className="text-sm text-content-body">{stat.label}</span>
                        </div>
                        <span className="text-xs font-medium text-content-body">{stat.value}</span>
                      </div>
                      <Progress value={stat.progress} indicatorClassName={stat.color} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-strong">Nova Tarefa</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-content-muted hover:text-content-body">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-content-body">Descrição *</label>
                <Input
                  className="mt-1"
                  placeholder="Ex: Beber 2.5L de água"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-content-body">Categoria</label>
                <select
                  className="mt-1 flex h-10 w-full rounded-lg border border-edge-base bg-surface-card px-3 py-2 text-sm text-content-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                >
                  {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowTaskModal(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={addTask} disabled={saving || !taskText.trim()}>
                {saving ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal */}
      {showExModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-strong">{editingEx ? "Editar Exercício" : "Adicionar Exercício"}</h2>
              <button onClick={() => { setShowExModal(false); setEditingEx(null); }} className="text-content-muted hover:text-content-body">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-content-body">Exercício *</label>
                <Input
                  className="mt-1"
                  placeholder="Ex: Supino Reto"
                  value={exForm.name}
                  onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-content-body">Séries x Reps</label>
                  <Input className="mt-1" placeholder="3x12" value={exForm.sets} onChange={(e) => setExForm({ ...exForm, sets: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-content-body">Carga (kg)</label>
                  <Input className="mt-1" type="number" placeholder="0" value={exForm.weight_kg} onChange={(e) => setExForm({ ...exForm, weight_kg: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-content-body">Tipo de treino</label>
                <select
                  className="mt-1 flex h-10 w-full rounded-lg border border-edge-base bg-surface-card px-3 py-2 text-sm text-content-strong focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  value={exForm.workout_type}
                  onChange={(e) => setExForm({ ...exForm, workout_type: e.target.value })}
                >
                  {workoutTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowExModal(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={saveExercise} disabled={saving || !exForm.name.trim()}>
                {saving ? "Salvando..." : editingEx ? "Salvar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
