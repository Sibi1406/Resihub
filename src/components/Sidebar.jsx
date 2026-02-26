import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Home, FileText, User, AlertTriangle, Megaphone,
    Users, Settings, LogOut, CreditCard, Clock, History,
    MessageCircle, UserPlus, Shield
} from "lucide-react";

const navItems = {
    admin: [
        { to: "/admin", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
        { to: "/admin/complaints", label: "Complaints", icon: <FileText className="w-5 h-5" /> },
        { to: "/admin/visitors", label: "Visitors", icon: <Users className="w-5 h-5" /> },
        { to: "/admin/emergencies", label: "Emergencies", icon: <AlertTriangle className="w-5 h-5" /> },
        { to: "/admin/payments", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
        { to: "/admin/announcements", label: "Announcements", icon: <Megaphone className="w-5 h-5" /> },
        { to: "/admin/chat", label: "Community Chat", icon: <MessageCircle className="w-5 h-5" /> },
        { to: "/admin/residents", label: "Residents", icon: <User className="w-5 h-5" /> },
        { to: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
    ],
    resident: [
        { to: "/resident", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
        { to: "/resident/complaints", label: "My Complaints", icon: <FileText className="w-5 h-5" /> },
        { to: "/resident/visitors", label: "Visitors", icon: <User className="w-5 h-5" /> },
        { to: "/resident/visitor-history", label: "Visitor History", icon: <Clock className="w-5 h-5" /> },
        { to: "/resident/payments", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
        { to: "/resident/emergency", label: "Emergency", icon: <AlertTriangle className="w-5 h-5" /> },
        { to: "/resident/announcements", label: "Announcements", icon: <Megaphone className="w-5 h-5" /> },
        { to: "/resident/chat", label: "Community Chat", icon: <MessageCircle className="w-5 h-5" /> },
        { to: "/resident/profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    ],
    security: [
        { to: "/security", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
        { to: "/security/preapproved", label: "Pre-Approved Visitors", icon: <FileText className="w-5 h-5" /> },
        { to: "/security/manual", label: "Manual Entry", icon: <UserPlus className="w-5 h-5" /> },
        { to: "/security/active", label: "Active Visitors", icon: <Users className="w-5 h-5" /> },
        { to: "/security/history", label: "Visitor History", icon: <History className="w-5 h-5" /> },
        { to: "/security/emergencies", label: "Emergencies", icon: <AlertTriangle className="w-5 h-5" /> },
        { to: "/security/announcements", label: "Announcements", icon: <Megaphone className="w-5 h-5" /> },
        { to: "/security/profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    ],
};

export default function Sidebar({ open, onClose }) {
    const { role, userData, logout } = useAuth();
    const navigate = useNavigate();
    const items = navItems[role] || [];

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const roleLabel = {
        admin: "Administrator",
        resident: "Resident",
        security: "Security",
    };

    const roleBadgeColor = {
        admin: "bg-[#E5B94B]/20 text-[#7A4E0A]",
        resident: "bg-emerald-50 text-emerald-700",
        security: "bg-blue-50 text-blue-700",
    };

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-full w-[17rem] sidebar sidebar-bg text-slate-800 flex flex-col transition-transform duration-300 ease-in-out rounded-tr-2xl rounded-br-2xl
                    ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
                aria-label="Main navigation"
            >
                {/* Brand */}
                <div className="border-b border-slate-200/60 px-5 py-5">
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">
                        Resi<span className="accent-mustard">Hub</span>
                    </h1>
                    <p className="text-[var(--text-caption)] text-slate-500 mt-1">Smart Residential Management</p>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E5B94B]/20 flex items-center justify-center text-sm font-bold text-[#7A4E0A] flex-shrink-0">
                            {userData?.name ? userData.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : (role ? role[0].toUpperCase() : "U")}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[var(--text-small)] font-semibold text-slate-700 truncate">
                                {userData?.name || roleLabel[role] || "User"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className={`text-[var(--text-caption)] px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[role] || "bg-slate-100 text-slate-600"}`}>
                                    {roleLabel[role] || role}
                                </span>
                                {userData?.apartmentNumber && (
                                    <span className="text-[var(--text-caption)] text-slate-400">• {userData.apartmentNumber}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Primary">
                    <ul className="space-y-0.5">
                        {items.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.to.split("/").length <= 2}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `navlink ${isActive ? "navlink-active" : ""}`
                                    }
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    <span className="text-sm">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Status + Logout */}
                <div className="px-4 py-4 border-t border-slate-200/60">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden />
                        <span className="text-[var(--text-caption)] text-slate-500">All services operational</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 min-h-[var(--touch-min)] px-4 py-3 rounded-xl text-[var(--text-small)] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
