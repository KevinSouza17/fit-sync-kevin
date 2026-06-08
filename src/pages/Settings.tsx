import { useState } from "react";
import { Bell, Shield, Smartphone, Moon, Globe } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const settingSections = [
  {
    icon: Bell,
    title: "Notificações",
    description: "Gerencie suas preferências de notificação",
    items: [
      { label: "Lembretes de refeição", key: "mealReminders" },
      { label: "Alertas de hidratação", key: "waterAlerts" },
      { label: "Resumo diário", key: "dailySummary" },
      { label: "Dicas de saúde semanais", key: "weeklyTips" },
    ],
  },
  {
    icon: Smartphone,
    title: "Dispositivos",
    description: "Sincronização com wearables e apps",
    items: [
      { label: "Apple Health", key: "appleHealth" },
      { label: "Google Fit", key: "googleFit" },
      { label: "Garmin Connect", key: "garmin" },
    ],
  },
  {
    icon: Moon,
    title: "Aparência",
    description: "Personalize a interface",
    items: [
      { label: "Modo escuro", key: "darkMode" },
      { label: "Animações reduzidas", key: "reducedMotion" },
    ],
  },
];

export function Settings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    mealReminders: true,
    waterAlerts: true,
    dailySummary: true,
    weeklyTips: false,
    appleHealth: false,
    googleFit: true,
    garmin: false,
    darkMode: false,
    reducedMotion: false,
  });

  function toggle(key: string) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="mt-0.5 text-sm text-slate-500">Personalize sua experiência no FitSync</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {settingSections.map((section) => (
          <Card key={section.title}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <section.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <Toggle enabled={toggles[item.key]} onChange={() => toggle(item.key)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Account security */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Segurança</h2>
                <p className="text-xs text-slate-500">Proteja sua conta</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start">
                Alterar senha
              </Button>
              <Button variant="outline" className="justify-start">
                Autenticação de dois fatores
              </Button>
              <Button variant="outline" className="justify-start">
                Dispositivos conectados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Idioma e Região</h2>
                <p className="text-xs text-slate-500">Preferências regionais</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Idioma</label>
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option>Português (Brasil)</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Unidade de peso</label>
                <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option>Quilogramas (kg)</option>
                  <option>Libras (lb)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar Configurações</Button>
      </div>
    </div>
  );
}
