import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import ComplaintsPage from "./modules/complaints/ComplaintsPage";
import VisitorsPage from "./modules/visitors/VisitorsPage";
import FundsPage from "./modules/funds/FundsPage";
import EmergencyPage from "./modules/emergency/EmergencyPage";
import AnnouncementsPage from "./modules/announcements/AnnouncementsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin dashboard */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Resident dashboard */}
      <Route path="/resident" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["resident"]}>
            <ResidentDashboard />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Security dashboard */}
      <Route path="/security" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["security"]}>
            <SecurityDashboard />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Complaints — admin + resident */}
      <Route path="/complaints" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["admin", "resident"]}>
            <ComplaintsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Visitors — all roles */}
      <Route path="/visitors" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["admin", "resident", "security"]}>
            <VisitorsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Funds — admin + resident (read-only for resident) */}
      <Route path="/funds" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["admin", "resident"]}>
            <FundsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Emergency — all roles */}
      <Route path="/emergency" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["admin", "resident", "security"]}>
            <EmergencyPage />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Announcements — all roles */}
      <Route path="/announcements" element={
        <ProtectedRoute>
          <RoleGuard allowedRoles={["admin", "resident", "security"]}>
            <AnnouncementsPage />
          </RoleGuard>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}