import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Diary } from "./pages/Diary";
import { Goals } from "./pages/Goals";
import { Team } from "./pages/Team";
import { Progress } from "./pages/Progress";
import { Recipes } from "./pages/Recipes";
import { Settings } from "./pages/Settings";
import { EditProfile } from "./pages/EditProfile";
import { ProfessionalProfile } from "./pages/ProfessionalProfile";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import { Workout } from "./pages/Workout";
import { WorkoutProgression } from "./pages/WorkoutProgression";
import { Appointments } from "./pages/Appointments";
import { MyClients } from "./pages/MyClients";
import { Feed } from "./pages/Feed";
import { Reviews } from "./pages/Reviews";
import { UserProfile } from "./pages/UserProfile";
import { MyProfile } from "./pages/MyProfile";
import { Moderation } from "./pages/Moderation";
import { DashboardLayout } from "./components/layout/DashboardLayout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <p className="text-sm text-content-muted">Carregando...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.is_banned) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProfessionalRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-base">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.is_banned) return <Navigate to="/login" replace />;
  if (!profile?.is_professional) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-base">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.is_banned) return <Navigate to="/login" replace />;
  if (profile?.role !== "owner") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/team" element={<Team />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/professional-profile" element={<ProfessionalRoute><ProfessionalProfile /></ProfessionalRoute>} />
          <Route path="/professional/:id" element={<ProtectedRoute><ProfessionalProfile /></ProtectedRoute>} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/moderation" element={<OwnerRoute><Moderation /></OwnerRoute>} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/workout/progression" element={<WorkoutProgression />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/my-clients" element={<ProfessionalRoute><MyClients /></ProfessionalRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
