import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const navItems = {
    admin: [
        { to: "/admin", label: "Dashboard", icon: "📊" },
        { to: "/complaints", label: "Complaints", icon: "🛠️" },
        { to: "/visitors", label: "Visitors", icon: "🚪" },
        { to: "/funds", label: "Funds", icon: "💰" },
        { to: "/emergency", label: "Emergency", icon: "🚨" },
        { to: "/announcements", label: "Announcements", icon: "📢" },
    ],
    resident: [
        { to: "/resident", label: "Dashboard", icon: "📊" },
        { to: "/complaints", label: "Complaints", icon: "🛠️" },
        { to: "/visitors", label: "Visitors", icon: "🚪" },
        { to: "/funds", label: "Funds", icon: "💰" },
        { to: "/emergency", label: "Emergency", icon: "🚨" },
        { to: "/announcements", label: "Announcements", icon: "📢" },
    ],
    security: [
        { to: "/security", label: "Dashboard", icon: "📊" },
        { to: "/visitors", label: "Visitors", icon: "🚪" },
        { to: "/emergency", label: "Emergency", icon: "🚨" },
        { to: "/announcements", label: "Announcements", icon: "📢" },
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
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
            >
                {/* Brand */}
                <div className="px-6 py-6 border-b border-slate-700/50">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Resi<span className="text-primary-400">Hub</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Residential Management</p>
                </div>

                {/* User info */}
                <div className="px-6 py-4 border-b border-slate-700/50">
                    <p className="text-sm font-medium text-slate-200 truncate">
                        {userData?.name || "User"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-slate-400 capitalize">{role}</span>
                        {userData?.apartmentNumber && (
                            <span className="text-xs text-slate-500">• {userData.apartmentNumber}</span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <ul className="space-y-1">
                        {items.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.to.split("/").length <= 2}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                                            ? "bg-primary-600/20 text-primary-300"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        }`
                                    }
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-700/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <span className="text-lg">🚪</span>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
