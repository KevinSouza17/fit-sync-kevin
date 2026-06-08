import { useState } from "react";
import { Camera, Save } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const healthGoals = [
  "Perda de Peso",
  "Hipertrofia Muscular",
  "Manutenção",
  "Ganho de Força",
  "Resistência Cardiovascular",
  "Melhora da Saúde Geral",
];

export function EditProfile() {
  const [selectedGoal, setSelectedGoal] = useState("Hipertrofia Muscular");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Perfil</h1>
          <p className="mt-0.5 text-sm text-slate-500">Atualize suas informações pessoais e de saúde</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Salvo!" : "Salvar Alterações"}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Avatar column */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-50 text-3xl font-bold text-blue-700">
                    LS
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Lucas Silva</h3>
              <p className="text-sm text-slate-500">Plano Pro</p>
              <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
                Alterar foto
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Hábitos e Rotina</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Nível de Atividade</label>
                  <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option>Sedentário</option>
                    <option>Levemente ativo</option>
                    <option selected>Moderadamente ativo</option>
                    <option>Muito ativo</option>
                    <option>Extremamente ativo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Dias de Treino / Semana</label>
                  <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option>1-2 dias</option>
                    <option>3-4 dias</option>
                    <option selected>5-6 dias</option>
                    <option>Todos os dias</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Hora de Dormir</label>
                  <Input type="time" defaultValue="23:00" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Hora de Acordar</label>
                  <Input type="time" defaultValue="06:30" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main form */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Personal info */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Informações Pessoais</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nome</label>
                  <Input type="text" defaultValue="Lucas" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Sobrenome</label>
                  <Input type="text" defaultValue="Silva" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">E-mail</label>
                  <Input type="email" defaultValue="lucas.silva@email.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Telefone</label>
                  <Input type="tel" defaultValue="+55 (11) 99999-9999" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Data de Nascimento</label>
                  <Input type="date" defaultValue="1995-03-15" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Gênero</label>
                  <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                    <option>Prefiro não informar</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health metrics */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Medidas e Saúde</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Altura (cm)</label>
                  <Input type="number" defaultValue="178" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Peso (kg)</label>
                  <Input type="number" defaultValue="75.2" step="0.1" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Peso Meta (kg)</label>
                  <Input type="number" defaultValue="78" step="0.1" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Meta Calórica Diária</label>
                  <Input type="number" defaultValue="2400" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Meta de Água (L)</label>
                  <Input type="number" defaultValue="2.5" step="0.1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health goal */}
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Objetivo de Saúde</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {healthGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setSelectedGoal(goal)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      selectedGoal === goal
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
