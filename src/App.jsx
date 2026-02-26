import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

// Auth
import Login from "./pages/Login";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnnouncementsPage from "./pages/admin/AnnouncementsPage";
import AdminResidentsPage from "./pages/admin/ResidentsPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AdminComplaintsPage from "./pages/admin/ComplaintsPage";
import AdminVisitorsPage from "./pages/admin/VisitorsPage";
import AdminEmergenciesPage from "./pages/admin/EmergenciesPage";
import AdminPaymentsPage from "./pages/admin/PaymentsPage";
import AdminChatPage from "./pages/admin/ChatPage";

// Resident pages
import ResidentDashboard from "./pages/ResidentDashboard";
import ResidentComplaintsPage from "./modules/complaints/ComplaintsPage";
import ResidentVisitorsPage from "./modules/visitors/VisitorsPage";
import ResidentVisitorHistory from "./pages/resident/VisitorHistory";
import ResidentEmergencyPage from "./modules/emergency/EmergencyPage";
import ResidentEmergencyHistory from "./pages/resident/EmergencyHistory";
import ResidentAnnouncementsPage from "./modules/announcements/AnnouncementsPage";
import ResidentProfilePage from "./pages/resident/ProfilePage";
import ResidentChatPage from "./pages/resident/ChatPage";
import PaymentStatusPage from "./pages/resident/PaymentStatusPage";

// Security pages
import SecurityDashboard from "./pages/SecurityDashboard";
import PreapprovedPage from "./pages/security/PreapprovedPage";
import ManualEntryPage from "./pages/security/ManualEntryPage";
import ActiveVisitorsPage from "./pages/security/ActiveVisitorsPage";
import VisitorHistoryPage from "./pages/security/VisitorHistoryPage";
import EmergenciesPage from "./pages/security/EmergenciesPage";
import AnnouncementsPageSecurity from "./pages/security/AnnouncementsPage";
import SecurityProfilePage from "./pages/security/ProfilePage";

function Protected({ roles, children }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={roles}>
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ── Admin Routes ── */}
      <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />
      <Route path="/admin/complaints" element={<Protected roles={["admin"]}><AdminComplaintsPage /></Protected>} />
      <Route path="/admin/visitors" element={<Protected roles={["admin"]}><AdminVisitorsPage /></Protected>} />
      <Route path="/admin/emergencies" element={<Protected roles={["admin"]}><AdminEmergenciesPage /></Protected>} />
      <Route path="/admin/payments" element={<Protected roles={["admin"]}><AdminPaymentsPage /></Protected>} />
      <Route path="/admin/announcements" element={<Protected roles={["admin"]}><AdminAnnouncementsPage /></Protected>} />
      <Route path="/admin/chat" element={<Protected roles={["admin"]}><AdminChatPage /></Protected>} />
      <Route path="/admin/residents" element={<Protected roles={["admin"]}><AdminResidentsPage /></Protected>} />
      <Route path="/admin/settings" element={<Protected roles={["admin"]}><AdminSettingsPage /></Protected>} />

      {/* ── Resident Routes ── */}
      <Route path="/resident" element={<Protected roles={["resident"]}><ResidentDashboard /></Protected>} />
      <Route path="/resident/complaints" element={<Protected roles={["resident"]}><ResidentComplaintsPage /></Protected>} />
      <Route path="/resident/visitors" element={<Protected roles={["resident"]}><ResidentVisitorsPage /></Protected>} />
      <Route path="/resident/visitor-history" element={<Protected roles={["resident"]}><ResidentVisitorHistory /></Protected>} />
      <Route path="/resident/payments" element={<Protected roles={["resident"]}><PaymentStatusPage /></Protected>} />
      <Route path="/resident/emergency" element={<Protected roles={["resident"]}><ResidentEmergencyPage /></Protected>} />
      <Route path="/resident/emergency-history" element={<Protected roles={["resident"]}><ResidentEmergencyHistory /></Protected>} />
      <Route path="/resident/announcements" element={<Protected roles={["resident"]}><ResidentAnnouncementsPage /></Protected>} />
      <Route path="/resident/chat" element={<Protected roles={["resident"]}><ResidentChatPage /></Protected>} />
      <Route path="/resident/profile" element={<Protected roles={["resident"]}><ResidentProfilePage /></Protected>} />

      {/* ── Security Routes ── */}
      <Route path="/security" element={<Protected roles={["security"]}><SecurityDashboard /></Protected>} />
      <Route path="/security/preapproved" element={<Protected roles={["security"]}><PreapprovedPage /></Protected>} />
      <Route path="/security/manual" element={<Protected roles={["security"]}><ManualEntryPage /></Protected>} />
      <Route path="/security/active" element={<Protected roles={["security"]}><ActiveVisitorsPage /></Protected>} />
      <Route path="/security/history" element={<Protected roles={["security"]}><VisitorHistoryPage /></Protected>} />
      <Route path="/security/emergencies" element={<Protected roles={["security"]}><EmergenciesPage /></Protected>} />
      <Route path="/security/announcements" element={<Protected roles={["security"]}><AnnouncementsPageSecurity /></Protected>} />
      <Route path="/security/profile" element={<Protected roles={["security"]}><SecurityProfilePage /></Protected>} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}