import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { NotificationsProvider } from "../../context/NotificationsContext";

export function DashboardLayout() {
  const { profile } = useAuth();
  const themeClass = profile?.is_professional ? "theme-pro" : "";

  return (
    <NotificationsProvider>
      <div className={`flex h-screen overflow-hidden bg-surface-base ${themeClass}`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </NotificationsProvider>
  );
}
