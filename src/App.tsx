import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
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
import { Explore } from "./pages/Explore";
import { Syncs } from "./pages/Syncs";
import { Achievements } from "./pages/Achievements";
import { Reviews } from "./pages/Reviews";
import { UserProfile } from "./pages/UserProfile";
import { MyProfile } from "./pages/MyProfile";
import { Moderation } from "./pages/Moderation";
import { Onboarding } from "./pages/Onboarding";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { PageLoader, SplashScreen } from "./components/PageLoader";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [onboardingDue, setOnboardingDue] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("check_onboarding_due", { p_user: user.id }).then(({ data }) => {
      setOnboardingDue(!!data);
    });
  }, [user, profile?.onboarding_completed, profile?.onboarding_due_at]);

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.is_banned) return <Navigate to="/login" replace />;
  const isOnboarding = window.location.pathname === "/onboarding";
  if (!isOnboarding && onboardingDue === true) {
    return <Navigate to="/onboarding" replace />;
  }
  if (onboardingDue === null) return <PageLoader />;
  return <>{children}</>;
}

function ProfessionalRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.is_banned) return <Navigate to="/login" replace />;
  if (!profile?.is_professional) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

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
          <Route path="/syncs" element={<Syncs />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
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
