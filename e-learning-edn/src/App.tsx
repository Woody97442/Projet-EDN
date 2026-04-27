import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/template/layout";
import Sidebar from "./components/template/sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/Module";
import QuizzPage from "./pages/Quizz";
import BadgesPage from "./pages/Badges";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFormations from "./pages/admin/AdminFormations";
import AdminCreateFormation from "./pages/admin/AdminCreateFormation";
import AdminEditFormation from "./pages/admin/AdminEditFormation";

function AppRoutes() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin" && !!token;

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Protected routes (authenticated) */}
        <Route element={token ? <Sidebar /> : <Navigate to="/login" />}>
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/formation/:formationId/module/:moduleId"
            element={token ? <ModulePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/formation/:formationId/quizz/:quizzId"
            element={token ? <QuizzPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/mes-badges"
            element={token ? <BadgesPage /> : <Navigate to="/login" />}
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/formations"
            element={isAdmin ? <AdminFormations /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/formation/create"
            element={isAdmin ? <AdminCreateFormation /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/formation/:id/edit"
            element={isAdmin ? <AdminEditFormation /> : <Navigate to="/login" />}
          />
        </Route>

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
