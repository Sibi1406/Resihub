import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Home, FileText, User, AlertTriangle, Megaphone,
    Users, Settings, CreditCard, History,
    UserPlus, Package, CalendarDays, ShieldCheck,
    ChevronLeft, ChevronRight as ChevronR
} from "lucide-react";
import { useState } from "react";

const navItems = {
    admin: [
        { to: "/admin",                        label: "Dashboard",      icon: Home },
        { to: "/admin/complaints",             label: "Complaints",     icon: FileText },
        { to: "/admin/visitors",               label: "Visitors",       icon: Users },
        { to: "/admin/emergencies",            label: "Emergencies",    icon: AlertTriangle },
        { to: "/admin/payments",               label: "Payments",       icon: CreditCard },
        { to: "/admin/announcements",          label: "Announcements",  icon: Megaphone },
        { to: "/admin/lost-found",             label: "Lost & Found",   icon: Package },
        { to: "/admin/facility-management",    label: "Facility Mgmt",  icon: CalendarDays },
        { to: "/admin/residents",              label: "Residents",      icon: User },
        { to: "/admin/settings",              label: "Settings",       icon: Settings },
        { to: "/admin/profile",               label: "Profile",        icon: User },
    ],
    resident: [
        { to: "/resident",                    label: "Dashboard",       icon: Home },
        { to: "/resident/complaints",         label: "My Complaints",   icon: FileText },
        { to: "/resident/visitors",           label: "Visitors",        icon: User },
        { to: "/resident/payments",           label: "Payments",        icon: CreditCard },
        { to: "/resident/emergency",          label: "Emergency",       icon: AlertTriangle },
        { to: "/resident/announcements",      label: "Announcements",   icon: Megaphone },
        { to: "/resident/lost-found",         label: "Lost & Found",    icon: Package },
        { to: "/resident/facility-booking",   label: "Facility Booking",icon: CalendarDays },
        { to: "/resident/profile",            label: "Profile",         icon: User },
    ],
    security: [
        { to: "/security",              label: "Dashboard",        icon: Home },
        { to: "/security/preapproved",  label: "Informed Visitors",icon: FileText },
        { to: "/security/manual",       label: "Manual Entry",     icon: UserPlus },
        { to: "/security/active",       label: "Active Visitors",  icon: Users },
        { to: "/security/history",      label: "Visitor History",  icon: History },
        { to: "/security/emergencies",  label: "Emergencies",      icon: AlertTriangle },
        { to: "/security/lost-found",   label: "Lost & Found",     icon: Package },
        { to: "/security/announcements",label: "Announcements",    icon: Megaphone },
        { to: "/security/profile",      label: "Profile",          icon: User },
    ],
};

const roleConfig = {
    admin:    { label: "Administrator", badgeBg: "#FEF3C7", badgeColor: "#92400E", avatarBg: "linear-gradient(135deg,#7CAE8E,#5B9471)" },
    resident: { label: "Resident",      badgeBg: "#D1FAE5", badgeColor: "#065F46", avatarBg: "linear-gradient(135deg,#34D399,#059669)" },
    security: { label: "Security",      badgeBg: "#DBEAFE", badgeColor: "#1E40AF", avatarBg: "linear-gradient(135deg,#60A5FA,#2563EB)" },
};

/* Sidebar is always expanded on desktop, collapsible on mobile via the open prop */
export default function Sidebar({ open, onClose }) {
    const { role, userData } = useAuth();
    const items   = navItems[role] || [];
    const cfg     = roleConfig[role] || roleConfig.admin;
    const [collapsed, setCollapsed] = useState(false);

    const initials = userData?.name
        ? userData.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : role?.[0]?.toUpperCase() ?? "U";

    const W = collapsed ? "4.5rem" : "16rem";

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(4px)" }}
                    onClick={onClose}
                />
            )}

            <aside
                aria-label="Main navigation"
                className={`fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-in-out
                    ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
                style={{
                    width: W,
                    background: "rgba(255,255,255,0.80)",
                    borderRight: "1px solid rgba(255,255,255,0.75)",
                    boxShadow: "2px 0 24px rgba(0,0,0,0.07)",
                    backdropFilter: "blur(24px) saturate(160%)",
                    WebkitBackdropFilter: "blur(24px) saturate(160%)",
                    overflow: "hidden",
                }}
            >
                {/* Brand */}
                <div
                    className="flex items-center gap-3 flex-shrink-0"
                    style={{ padding: collapsed ? "20px 14px" : "20px 20px", borderBottom: "1px solid rgba(255,255,255,0.5)", height: 64, background: "transparent" }}
                >
                    <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "linear-gradient(135deg,#E5B94B,#C97B1A)",
                            boxShadow: "0 4px 12px rgba(229,185,75,0.35)",
                        }}
                    >
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <h1 className="text-base font-bold tracking-tight leading-none" style={{ color: "#1A1D23" }}>
                                Resi<span style={{ color: "#7CAE8E" }}>Hub</span>
                            </h1>
                            <p className="text-[10px] mt-0.5" style={{ color: "#A89F8C", lineHeight: 1 }}>Residential Mgmt</p>
                        </div>
                    )}
                    {/* Collapse toggle — desktop only */}
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="hidden lg:flex ml-auto w-6 h-6 items-center justify-center rounded-lg transition-colors flex-shrink-0"
                        style={{ color: "#6B7280" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F5F5F0"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronR className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    </button>
                </div>

                {/* User info — hidden when collapsed */}
                {!collapsed && (
                    <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                        <div
                            className="flex items-center gap-2.5 p-2.5 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)" }}
                        >
                            <div
                                className="flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ width: 32, height: 32, borderRadius: 10, background: cfg.avatarBg }}
                            >
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-base font-semibold truncate" style={{ color: "#1A1D23" }}>
                                    {userData?.name || cfg.label}
                                </p>
                                <span
                                    className="text-[13px] px-2 py-0.5 rounded-full font-semibold"
                                    style={{ background: cfg.badgeBg, color: cfg.badgeColor }}
                                >
                                    {cfg.label}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapsed — avatar only */}
                {collapsed && (
                    <div className="flex-shrink-0 flex justify-center py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
                        <div
                            className="flex items-center justify-center text-xs font-bold text-white"
                            style={{ width: 36, height: 36, borderRadius: 10, background: cfg.avatarBg }}
                            title={userData?.name || cfg.label}
                        >
                            {initials}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav
                    className="flex-1 overflow-y-auto"
                    style={{ padding: collapsed ? "12px 8px" : "12px 10px" }}
                    aria-label="Primary"
                >
                    {!collapsed && (
                        <p
                            className="text-xs font-bold uppercase tracking-widest px-2 mb-2"
                            style={{ color: "#9CA3AF" }}
                        >
                            Menu
                        </p>
                    )}
                    <ul className="space-y-0.5">
                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.to.split("/").length <= 2}
                                        onClick={onClose}
                                        title={collapsed ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `navlink flex items-center gap-2.5 rounded-xl transition-all duration-200 ${isActive ? "navlink-active" : ""} ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}`
                                        }
                                        style={({ isActive }) =>
                                            isActive ? {} : { color: "#6B7280" }
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon className={`flex-shrink-0 ${collapsed ? "w-6 h-6" : "w-[18px] h-[18px]"}`} />
                                                {!collapsed && (
                                                    <span className="text-[15px] font-medium">{item.label}</span>
                                                )}
                                                {!collapsed && isActive && (
                                                    <span
                                                        className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                        style={{ background: "#fff", opacity: 0.7 }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Status footer */}
                <div
                    className="flex-shrink-0"
                    style={{ padding: collapsed ? "12px 8px" : "12px 14px", borderTop: "1px solid #EDE8DC" }}
                >
                    {collapsed ? (
                        <div className="flex justify-center">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: "#10B981" }}
                                title="All services operational"
                            />
                        </div>
                    ) : (
                        <div
                            className="flex items-center gap-2 px-2 py-2 rounded-xl"
                            style={{ background: "#ECFDF5", border: "1px solid #D1FAE5" }}
                        >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#10B981" }} />
                            <span className="text-sm font-medium" style={{ color: "#047857" }}>All systems operational</span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
