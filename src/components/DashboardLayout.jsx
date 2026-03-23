import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Menu, ChevronRight, X, AlertTriangle } from "lucide-react";
import { subscribeAllComplaints } from "../services/complaintService";
import { subscribeActiveEmergencies } from "../services/emergencyService";
import { subscribeAnnouncements } from "../services/announcementService";
import { subscribeVisitors } from "../services/visitorService";

// Route → human-readable breadcrumb label
const routeLabels = {
    "/admin": "Dashboard",
    "/admin/complaints": "Complaints",
    "/admin/visitors": "Visitors",
    "/admin/emergencies": "Emergencies",
    "/admin/payments": "Payments",
    "/admin/announcements": "Announcements",
    "/admin/chat": "Community Chat",
    "/admin/residents": "Residents",
    "/admin/settings": "Settings",
    "/admin/lost-found": "Lost & Found",
    "/admin/facility-management": "Facility Management",
    "/resident": "Dashboard",
    "/resident/complaints": "My Complaints",
    "/resident/visitors": "Visitors",
    "/resident/visitor-history": "Visitor History",
    "/resident/payments": "Payments",
    "/resident/emergency": "Emergency",
    "/resident/announcements": "Announcements",
    "/resident/chat": "Community Chat",
    "/resident/profile": "Profile",
    "/resident/lost-found": "Lost & Found",
    "/resident/facility-booking": "Facility Booking",
    "/security": "Dashboard",
    "/security/preapproved": "Informed Visitors",
    "/security/manual": "Manual Entry",
    "/security/active": "Active Visitors",
    "/security/history": "History",
    "/security/emergencies": "Emergencies",
    "/security/announcements": "Announcements",
    "/security/lost-found": "Lost & Found",
};

const roleSections = {
    admin: "Admin",
    resident: "Resident",
    security: "Security",
};

function LiveClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="font-mono tabular-nums">
            {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
        </span>
    );
}

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { role, userData, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const [notifCount, setNotifCount] = useState(0);
    const [notifPulse, setNotifPulse] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [emergencyBanner, setEmergencyBanner] = useState(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Per-source notification counts — avoids the additive bump() inflation bug
    const notifSources = useRef({});
    const updateNotifCount = (key, value) => {
        notifSources.current[key] = value;
        const total = Object.values(notifSources.current).reduce((s, n) => s + n, 0);
        setNotifCount(total);
        if (value > 0) { setNotifPulse(true); setTimeout(() => setNotifPulse(false), 1200); }
    };

    useEffect(() => {
        const unsubs = [];

        if (role === "admin") {
            unsubs.push(subscribeAllComplaints((c) => {
                updateNotifCount("complaints", c.filter(x => x.status !== "resolved").length);
            }));
            unsubs.push(subscribeActiveEmergencies((e) => {
                updateNotifCount("emergencies", e.length);
                setEmergencyBanner(e.length > 0 ? e[0] : null);
            }));
        } else if (role === "security") {
            unsubs.push(subscribeActiveEmergencies((e) => updateNotifCount("emergencies", e.length)));
            unsubs.push(subscribeVisitors({ status: "informed" }, (v) => updateNotifCount("visitors", v.length)));
        } else if (role === "resident") {
            unsubs.push(subscribeActiveEmergencies((e) => {
                const mine = e.filter(x => x.raisedBy === userData?.uid);
                updateNotifCount("emergencies", mine.length);
                setEmergencyBanner(mine.length > 0 ? mine[0] : null);
            }));
            unsubs.push(subscribeAnnouncements((a) => {
                const now = Date.now();
                const recent = a.filter(x => {
                    const t = x.createdAt?.toMillis?.() ?? new Date(x.createdAt).getTime();
                    return now - t < 24 * 60 * 60 * 1000;
                }).length;
                updateNotifCount("announcements", Math.min(recent, 5));
            }));
        }

        return () => {
            unsubs.forEach(u => u());
            notifSources.current = {};
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role, userData?.uid]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // Build breadcrumb
    const path = location.pathname;
    const pageLabel = routeLabels[path] || "Page";
    const roleSection = roleSections[role] || "";
    const initials = userData?.name
        ? userData.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
        : (role?.[0]?.toUpperCase() ?? "U");

    return (
        /* dashboard-root handles: watermark via ::before, mesh via ::after */
        <div className="dashboard-root">

            {/* ── Floating Particles Layer (lightweight, CSS-animated) ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
                {/* Blobs */}
                <motion.div
                    animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    className="blob blob-mustard -top-24 -left-24 opacity-[0.06]"
                />
                <motion.div
                    animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.12, 1] }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                    className="blob blob-amber top-1/2 -right-20 opacity-[0.04]"
                />

                {/* Floating particles */}
                <div className="particle particle-sm animate-floatA top-[18%] left-[12%]" />
                <div className="particle particle-md animate-floatB top-[55%] left-[70%]" style={{ animationDelay: '1.5s' }} />
                <div className="particle particle-sm animate-floatC bottom-[22%] left-[40%]" style={{ animationDelay: '3s' }} />
                <div className="particle particle-lg animate-floatA top-[30%] right-[15%]" style={{ animationDelay: '2s' }} />
                <div className="particle particle-sm animate-floatB bottom-[40%] right-[35%]" style={{ animationDelay: '0.8s' }} />
                <div className="particle particle-md animate-floatC top-[70%] left-[8%]" style={{ animationDelay: '4s' }} />
                <div className="particle particle-sm animate-floatA top-[12%] right-[40%]" style={{ animationDelay: '5s' }} />

                {/* Subtle light beams */}
                <div className="light-beam animate-beam top-0 left-1/4" />
                <div className="light-beam animate-beam top-1/2 left-3/4" style={{ animationDelay: '7s' }} />
            </div>

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
                {/* ── Top bar ── */}
                <header className="sticky top-0 z-40 h-14 md:h-16 flex items-center justify-between px-4 sm:px-5 lg:px-6 topbar flex-shrink-0">
                    {/* Left: hamburger (mobile) + breadcrumb */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden min-w-[var(--touch-min)] min-h-[var(--touch-min)] w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors text-gray-400 flex-shrink-0"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        {/* Mobile brand */}
                        <span className="lg:hidden text-lg font-bold text-white tracking-tight">
                            Resi<span className="accent-mustard">Hub</span>
                        </span>
                        {/* Desktop breadcrumb */}
                        <nav className="hidden lg:flex items-center gap-2 text-[var(--text-small)]" aria-label="Breadcrumb">
                            <span className="text-gray-400 font-medium">{roleSection}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" aria-hidden />
                            <span className="font-semibold text-white">{pageLabel}</span>
                        </nav>
                    </div>

                    {/* Right: clock (security), bell, avatar */}
                    <div className="flex items-center gap-2">
                        {role === "security" && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-white/5 rounded-lg px-3 py-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <LiveClock />
                            </div>
                        )}

                        {/* Notification bell */}
                        <motion.button
                            type="button"
                            aria-label={notifCount > 0 ? `${notifCount} notifications` : "Notifications"}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative min-w-[var(--touch-min)] min-h-[var(--touch-min)] w-11 h-11 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center"
                        >
                            <Bell className={`w-4.5 h-4.5 ${notifPulse ? "text-[#E5B94B]" : "text-gray-400"} transition-colors`} />
                            <AnimatePresence>
                                {notifCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
                                    >
                                        {notifCount > 9 ? "9+" : notifCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-white/10 mx-1" />

                        {/* Avatar + dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setProfileOpen(p => !p)}
                                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E5B94B] to-[#C97B1A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {initials}
                                </div>
                                <div className="hidden md:block text-left leading-tight">
                                    <p className="text-xs font-semibold text-white truncate max-w-[120px]">{userData?.name || roleSection}</p>
                                    <p className="text-[10px] text-gray-500 capitalize">{role}</p>
                                </div>
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-52 bg-[#1C1C1E] rounded-xl shadow-2xl border border-white/5 z-50 overflow-hidden"
                                    >
                                        {/* User info header */}
                                        <div className="px-4 py-3 border-b border-white/5">
                                            <p className="text-sm font-semibold text-white truncate">{userData?.name || roleSection}</p>
                                            <p className="text-xs text-gray-500 truncate">{userData?.email || role}</p>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={() => { setProfileOpen(false); navigate(`/${role}/profile`); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                                            >
                                                My Profile
                                            </button>
                                        </div>
                                        <div className="border-t border-white/5 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* ── Emergency Banner ── */}
                <AnimatePresence>
                    {emergencyBanner && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-red-600 text-white px-4 lg:px-6 py-2.5 flex items-center justify-between text-sm flex-shrink-0 overflow-hidden"
                        >
                            <div className="flex items-center gap-2.5">
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.2 }}
                                    className="w-2 h-2 rounded-full bg-white"
                                />
                                <span className="font-bold text-xs uppercase tracking-wide">Emergency Active</span>
                                <span className="opacity-80 text-xs hidden sm:inline">
                                    · {emergencyBanner.type} — {emergencyBanner.description?.slice(0, 50)}
                                </span>
                            </div>
                            <button
                                onClick={() => setEmergencyBanner(null)}
                                className="opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main Content ── */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full px-4 py-5 sm:px-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
                        {children}
                    </div>
                </main>
            </div>


        </div>
    );
}
