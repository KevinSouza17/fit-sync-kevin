import { useEffect, useState } from "react";
import { TrendingUp, ArrowUp, ArrowDown, Scale } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { WeightLog } from "../lib/types";

export function Progress() {
  const { profile } = useAuth();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .order("logged_date", { ascending: false })
      .limit(30);
    if (data) setWeightLogs(data.reverse());
    setLoading(false);
  }

  const latest = weightLogs[weightLogs.length - 1];
  const prev = weightLogs[weightLogs.length - 2];
  const weightDiff = latest && prev ? (Number(latest.weight_kg) - Number(prev.weight_kg)).toFixed(1) : null;
  const height = profile?.height_cm;
  const bmi = latest && height ? (Number(latest.weight_kg) / ((height / 100) ** 2)).toFixed(1) : null;
  const goalWeight = profile?.goal_weight_kg;
  const weightToGoal = latest && goalWeight ? (Number(latest.weight_kg) - goalWeight).toFixed(1) : null;

  const maxWeight = weightLogs.length > 0 ? Math.max(...weightLogs.map((w) => Number(w.weight_kg))) : 80;
  const minWeight = weightLogs.length > 0 ? Math.min(...weightLogs.map((w) => Number(w.weight_kg))) : 60;
  const range = maxWeight - minWeight || 1;

  const milestones = [
    { text: "Primeiro peso registrado", done: weightLogs.length >= 1 },
    { text: "5 registros de peso", done: weightLogs.length >= 5 },
    { text: "10 registros de peso", done: weightLogs.length >= 10 },
    { text: "30 registros de peso", done: weightLogs.length >= 30 },
    ...(goalWeight && latest
      ? [{ text: `Atingir peso meta de ${goalWeight} kg`, done: Number(latest.weight_kg) <= goalWeight }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Progresso</h1>
        <p className="mt-0.5 text-sm text-slate-500">Acompanhe sua evolução ao longo do tempo</p>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Peso atual",
                value: latest ? `${latest.weight_kg} kg` : "–",
                diff: weightDiff ? `${Number(weightDiff) > 0 ? "+" : ""}${weightDiff} kg` : null,
                up: weightDiff ? Number(weightDiff) > 0 : false,
              },
              {
                label: "IMC",
                value: bmi ?? "–",
                diff: null,
                up: false,
              },
              {
                label: "Para o objetivo",
                value: weightToGoal ? `${weightToGoal} kg` : "–",
                diff: goalWeight ? `Meta: ${goalWeight} kg` : null,
                up: false,
              },
              {
                label: "Registros",
                value: String(weightLogs.length),
                diff: "total de pesagens",
                up: true,
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
                  {s.diff && (
                    <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${s.up ? "text-green-600" : "text-blue-600"}`}>
                      {typeof s.up === "boolean" && s.diff.startsWith("+") && <ArrowUp className="h-3 w-3" />}
                      {typeof s.up === "boolean" && s.diff.startsWith("-") && <ArrowDown className="h-3 w-3" />}
                      {s.diff}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Weight chart */}
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Histórico de Peso</h2>
                {weightLogs.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Scale className="mb-2 h-10 w-10 text-slate-200" />
                    <p className="text-sm text-slate-400">Nenhum peso registrado ainda</p>
                    <p className="mt-1 text-xs text-slate-400">Registre seu peso no Dashboard para ver o gráfico</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-end gap-1 h-40">
                      {weightLogs.slice(-14).map((log, i) => {
                        const h = Math.max(8, ((Number(log.weight_kg) - minWeight) / range) * 100 + 10);
                        return (
                          <div key={log.id} className="group relative flex flex-1 flex-col items-center gap-1">
                            <div
                              className={`w-full rounded-t-md transition-all ${i === weightLogs.slice(-14).length - 1 ? "bg-blue-600" : "bg-blue-200"}`}
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-[10px] text-slate-400 rotate-45 origin-left truncate">
                              {new Date(log.logged_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                            </span>
                            <div className="absolute bottom-full mb-1 hidden rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap">
                              {log.weight_kg} kg
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weight history list */}
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Registros Recentes</h2>
                {weightLogs.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">Nenhum registro encontrado</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {[...weightLogs].reverse().map((log, i) => {
                      const prev = [...weightLogs].reverse()[i + 1];
                      const diff = prev ? (Number(log.weight_kg) - Number(prev.weight_kg)).toFixed(1) : null;
                      return (
                        <div key={log.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-slate-50">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{log.weight_kg} kg</p>
                            <p className="text-xs text-slate-500">
                              {new Date(log.logged_date).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                          </div>
                          {diff !== null && (
                            <span className={`flex items-center gap-1 text-xs font-medium ${Number(diff) > 0 ? "text-red-500" : Number(diff) < 0 ? "text-green-600" : "text-slate-400"}`}>
                              {Number(diff) > 0 ? <ArrowUp className="h-3 w-3" /> : Number(diff) < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                              {Number(diff) !== 0 ? `${Number(diff) > 0 ? "+" : ""}${diff} kg` : "Igual"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Milestones */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Conquistas</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {milestones.map((m) => (
                  <div
                    key={m.text}
                    className={`flex items-center gap-3 rounded-xl p-3 ${m.done ? "bg-blue-50" : "bg-slate-50"}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.done ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <TrendingUp className={`h-3.5 w-3.5 ${m.done ? "text-white" : "text-slate-400"}`} />
                    </div>
                    <p className={`text-sm ${m.done ? "font-medium text-slate-900" : "text-slate-400"}`}>
                      {m.text}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
