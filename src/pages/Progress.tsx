import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Progress as ProgressBar } from "../components/ui/progress";

const weekData = [
  { day: "Seg", kcal: 2100, weight: 75.8 },
  { day: "Ter", kcal: 2250, weight: 75.6 },
  { day: "Qua", kcal: 1980, weight: 75.5 },
  { day: "Qui", kcal: 2400, weight: 75.4 },
  { day: "Sex", kcal: 2150, weight: 75.3 },
  { day: "Sáb", kcal: 2300, weight: 75.2 },
  { day: "Dom", kcal: 1900, weight: 75.2 },
];

const maxKcal = Math.max(...weekData.map((d) => d.kcal));

const milestones = [
  { text: "Perdeu 2 kg desde o início", done: true },
  { text: "14 dias consecutivos de treino", done: true },
  { text: "Meta de proteína atingida 5x seguidas", done: true },
  { text: "Correu 5km sem parar", done: false },
  { text: "Atingiu 80 kg no supino", done: false },
];

export function Progress() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Progresso</h1>
        <p className="mt-0.5 text-sm text-slate-500">Acompanhe sua evolução ao longo do tempo</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Peso atual", value: "75.2 kg", diff: "-0.6 kg", up: false },
          { label: "IMC", value: "23.6", diff: "-0.2", up: false },
          { label: "Meta de Kcal", value: "87%", diff: "+5%", up: true },
          { label: "Treinos mês", value: "18", diff: "+3", up: true },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${s.up ? "text-green-600" : "text-blue-600"}`}>
                {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {s.diff} esta semana
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Calorie chart */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Calorias da Semana</h2>
            <div className="flex items-end gap-2 h-36">
              {weekData.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-lg bg-blue-500 transition-all"
                    style={{ height: `${(d.kcal / maxKcal) * 100}%` }}
                  />
                  <span className="text-xs text-slate-500">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weight progress */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Evolução do Peso</h2>
            <div className="flex flex-col gap-2">
              {weekData.map((d, i) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-slate-500">{d.day}</span>
                  <ProgressBar
                    value={((d.weight - 74) / (76.5 - 74)) * 100}
                    indicatorClassName="bg-blue-500"
                    className="flex-1"
                  />
                  <span className="w-14 text-right text-xs font-medium text-slate-700">{d.weight} kg</span>
                  {i > 0 && weekData[i].weight < weekData[i - 1].weight && (
                    <ArrowDown className="h-3 w-3 text-green-500" />
                  )}
                </div>
              ))}
            </div>
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
                className={`flex items-center gap-3 rounded-xl p-3 ${
                  m.done ? "bg-blue-50" : "bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    m.done ? "bg-blue-600" : "bg-slate-200"
                  }`}
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
    </div>
  );
}
