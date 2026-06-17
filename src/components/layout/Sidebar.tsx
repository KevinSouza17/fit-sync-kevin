import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  UtensilsCrossed,
  Settings,
  Activity,
  Users,
  Target,
  LogOut,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/diary", label: "Diário", icon: BookOpen },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/team", label: "Equipe", icon: Users },
  { to: "/progress", label: "Progresso", icon: TrendingUp },
  { to: "/recipes", label: "Alimentos", icon: UtensilsCrossed },
  { to: "/settings", label: "Configurações", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Sidebar() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Usuário";
  const plan = profile?.plan === "pro" ? "Plano Pro" : "Plano Free";

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-4">
      <header className="flex items-center gap-2.5 px-2 pb-6 pt-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">FitSync</span>
      </header>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <footer className="border-t border-slate-200 pt-4">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-50 text-xs font-bold text-blue-700">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-slate-900">{displayName}</span>
            <span className="text-xs text-slate-500">{plan}</span>
          </div>
        </NavLink>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </footer>
    </aside>
  );
}
