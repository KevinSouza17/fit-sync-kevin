import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { DashboardLayout } from "./components/layout/DashboardLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/team" element={<Team />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<EditProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
