import { useState } from "react";
import { Bell, Shield, Smartphone, Moon, Globe, Key, Check, Loader2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-primary-600" : "bg-slate-200"
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

const notifItems = [
  { label: "Lembretes de refeição", key: "mealReminders" },
  { label: "Alertas de hidratação", key: "waterAlerts" },
  { label: "Resumo diário", key: "dailySummary" },
  { label: "Dicas de saúde semanais", key: "weeklyTips" },
];

const deviceItems = [
  { label: "Apple Health", key: "appleHealth" },
  { label: "Google Fit", key: "googleFit" },
  { label: "Garmin Connect", key: "garmin" },
];

export function Settings() {
  const { darkMode, reducedMotion, toggleDarkMode, toggleReducedMotion } = useTheme();
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    mealReminders: true,
    waterAlerts: true,
    dailySummary: true,
    weeklyTips: false,
  });
  const [deviceToggles, setDeviceToggles] = useState<Record<string, boolean>>({
    appleHealth: false,
    googleFit: true,
    garmin: false,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  function toggleNotif(key: string) {
    setNotifToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleDevice(key: string) {
    setDeviceToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold text-content-strong">Configurações</h1>
        <p className="mt-0.5 text-sm text-content-muted">Personalize sua experiência no FitSync</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Bell className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content-strong">Notificações</h2>
                <p className="text-xs text-content-muted">Gerencie suas preferências de notificação</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {notifItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-content-body">{item.label}</span>
                  <Toggle enabled={notifToggles[item.key]} onChange={() => toggleNotif(item.key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Moon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content-strong">Aparência</h2>
                <p className="text-xs text-content-muted">Personalize a interface</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-content-body">Modo escuro</span>
                  <p className="text-xs text-content-muted">Reduz o brilho da tela em ambientes escuros</p>
                </div>
                <Toggle enabled={darkMode} onChange={toggleDarkMode} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-content-body">Animações reduzidas</span>
                  <p className="text-xs text-content-muted">Diminui movimentos e transições</p>
                </div>
                <Toggle enabled={reducedMotion} onChange={toggleReducedMotion} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Smartphone className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content-strong">Dispositivos</h2>
                <p className="text-xs text-content-muted">Sincronização com wearables e apps</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {deviceItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-content-body">{item.label}</span>
                  <Toggle enabled={deviceToggles[item.key]} onChange={() => toggleDevice(item.key)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Shield className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content-strong">Segurança</h2>
                <p className="text-xs text-content-muted">Proteja sua conta</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start gap-2" onClick={() => setShowPasswordModal(true)}>
                <Key className="h-4 w-4" />
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <Globe className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-content-strong">Idioma e Região</h2>
                <p className="text-xs text-content-muted">Preferências regionais</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-content-body">Idioma</label>
                <select className="mt-1 w-full rounded-lg border border-edge-base bg-surface-card px-3 py-2 text-sm text-content-body focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100">
                  <option>Português (Brasil)</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-content-body">Unidade de peso</label>
                <select className="mt-1 w-full rounded-lg border border-edge-base bg-surface-card px-3 py-2 text-sm text-content-body focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100">
                  <option>Quilogramas (kg)</option>
                  <option>Libras (lb)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleChangePassword() {
    setError("");

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (newPassword === currentPassword) {
      setError("A nova senha deve ser diferente da atual");
      return;
    }

    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (err) {
      setError(err.message === "Invalid credentials" ? "Senha atual incorreta" : "Erro ao alterar senha. Tente novamente.");
      return;
    }

    setSuccess(true);
    setTimeout(() => onClose(), 1800);
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-surface-card p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-content-strong">Senha alterada!</h2>
          <p className="mt-1 text-sm text-content-muted">Sua senha foi atualizada com sucesso</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-content-strong">Alterar Senha</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="text-xl">x</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-content-body">Nova senha</label>
            <div className="relative">
              <Input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-content-body">Confirmar nova senha</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleChangePassword}
            disabled={saving || !newPassword || !confirmPassword}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            {saving ? "Alterando..." : "Alterar Senha"}
          </Button>
        </div>
      </div>
    </div>
  );
}
