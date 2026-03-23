import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import PaymentStatusCard from "../components/PaymentStatusCard";
import PageTransition from "../components/PageTransition";
import { staggerContainer, cardVariants, fadeInUp } from "../lib/motionVariants";
import { FileText, UserCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeUserComplaints } from "../services/complaintService";
import { subscribeVisitors } from "../services/visitorService";
import { subscribeActiveEmergencies } from "../services/emergencyService";
import { subscribePaymentStatus, getCurrentMonth } from "../services/paymentService";
import { subscribeAnnouncements } from "../services/announcementService";

export default function ResidentDashboard() {
    const { user, userData } = useAuth();
    const navigate = useNavigate();

    const [activeComplaints, setActiveComplaints] = useState(0);
    const [scheduledVisitors, setScheduledVisitors] = useState(0);
    const [activeEmergencies, setActiveEmergencies] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [latestAnnouncement, setLatestAnnouncement] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(true);
    const currentMonth = getCurrentMonth();

    // pulse flags for animation
    const [pulseComplaints, setPulseComplaints] = useState(false);
    const [pulseVisitors, setPulseVisitors] = useState(false);
    const [pulseEmergencies, setPulseEmergencies] = useState(false);

    const prevCounts = useRef({ complaints: 0, visitors: 0, emergencies: 0 });

    useEffect(() => {
        if (!user) return;
        const unsubs = [];

        // complaints
        unsubs.push(
            subscribeUserComplaints(user.uid, (list) => {
                const cnt = list.filter((c) => c.status !== "resolved").length;
                setActiveComplaints(cnt);
                if (prevCounts.current.complaints !== cnt) {
                    setPulseComplaints(true);
                    setTimeout(() => setPulseComplaints(false), 800);
                }
                prevCounts.current.complaints = cnt;
            })
        );

        // visitors scheduled (preapproved) for my apartment
        unsubs.push(
            subscribeVisitors({ apartmentNumber: userData?.apartmentNumber, status: "informed" }, (list) => {
                const cnt = list.length;
                setScheduledVisitors(cnt);
                if (prevCounts.current.visitors !== cnt) {
                    setPulseVisitors(true);
                    setTimeout(() => setPulseVisitors(false), 800);
                }
                prevCounts.current.visitors = cnt;
            })
        );

        // active emergencies raised by user
        unsubs.push(
            subscribeActiveEmergencies((list) => {
                const userList = list.filter((e) => e.raisedBy === user.uid);
                const cnt = userList.length;
                setActiveEmergencies(cnt);
                if (prevCounts.current.emergencies !== cnt) {
                    setPulseEmergencies(true);
                    setTimeout(() => setPulseEmergencies(false), 800);
                }
                prevCounts.current.emergencies = cnt;
            })
        );

        // announcements
        unsubs.push(
            subscribeAnnouncements((list) => {
                const relevant = list.filter(a => a.category === "maintenance" || a.category === "event");
                if (relevant.length > 0) {
                    setLatestAnnouncement(relevant[0]);
                }
            })
        );

        // Maintenance payment status for current month
        const unsub = subscribePaymentStatus(user.uid, currentMonth, (payment) => {
            setPaymentStatus(payment);
            setPaymentLoading(false);
        });
        unsubs.push(unsub);

        return () => unsubs.forEach((u) => u());
    }, [user, userData, currentMonth]);

    return (
        <DashboardLayout>
            <PageTransition>
                <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
                    <h1 className="page-title">
                        Welcome back{userData?.name ? `, ${userData.name.split(" ")[0]}` : ""}! 👋
                    </h1>
                    <p className="page-subtitle">
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        {userData?.apartmentNumber && ` • Apartment ${userData.apartmentNumber}`}
                    </p>
                </motion.div>

                {/* Summary Cards — staggered entrance */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                >
                    {[
                        { icon: <FileText className="w-5 h-5" />, label: "Active Complaints", value: activeComplaints, color: "blue", path: "/resident/complaints", sub: "tap to view" },
                        { icon: <UserCheck className="w-5 h-5" />, label: "Visitors Informed", value: scheduledVisitors, color: "primary", path: "/resident/visitors", sub: "tap to manage" },
                        { icon: <AlertTriangle className="w-5 h-5" />, label: "Active Emergencies", value: activeEmergencies, color: "red", path: "/resident/emergency", sub: "tap to report" },
                    ].map((card) => (
                        <motion.div key={card.label} variants={cardVariants}>
                            <StatCard {...card} subtext={card.sub} onClick={() => navigate(card.path)} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Maintenance Payment Status — Full Width Card */}
                <div className="mb-8 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
                    <h2 className="section-label mb-3">
                        Maintenance Status
                    </h2>
                    <PaymentStatusCard
                        payment={paymentStatus}
                        loading={paymentLoading}
                        month={currentMonth}
                        onClick={() => navigate("/resident/payments")}
                    />
                </div>

                {/* Two Column Layout: Calendar & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
                    {/* Calendar Widget (As requested from image) */}
                    <div>
                        <h2 className="section-label mb-3">Schedule</h2>
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-800">Schedule</h3>
                                </div>
                                <button className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg transition-colors">
                                    {new Date().toLocaleDateString("en-IN", { month: "long" })}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                            </div>

                            {/* Calendar Days Strip */}
                            <div className="flex justify-between items-center mb-6 px-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 cursor-pointer"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                {[9, 10, 11, 12, 13, 14, 15].map((d, i) => (
                                    <div key={d} className={`flex flex-col items-center p-2 rounded-xl min-w-[2.5rem] ${d === 12 ? 'bg-[#E5924B] text-white shadow-lg shadow-[#E5924B]/30' : 'text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors'}`}>
                                        <span className="text-[10px] uppercase font-bold mb-1 opacity-80">
                                            {['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'][i]}
                                        </span>
                                        <span className="text-sm font-bold">{d}</span>
                                    </div>
                                ))}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 cursor-pointer"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>

                            {/* Dynamic Announcement Card */}
                            {latestAnnouncement ? (
                                <div className="relative overflow-hidden group cursor-pointer transition-all border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:border-amber-200/50">
                                    {/* Accent Line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl" />

                                    <div className="flex justify-between items-start pl-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-slate-800 font-bold text-sm mb-1.5 truncate">{latestAnnouncement.title}</h4>
                                            <p className="text-slate-500 text-xs font-medium mb-3 line-clamp-2">{latestAnnouncement.message}</p>
                                            <div className="inline-flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <span className="text-amber-800 text-[10px] font-bold uppercase">{latestAnnouncement.category}</span>
                                            </div>
                                        </div>

                                        <div className="ml-3 flex flex-col items-center flex-shrink-0">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">{latestAnnouncement.createdAt?.toDate ? latestAnnouncement.createdAt.toDate().toLocaleDateString("en-IN", { month: "short" }) : ""}</div>
                                            <div className="text-lg font-extrabold text-slate-700">{latestAnnouncement.createdAt?.toDate ? latestAnnouncement.createdAt.toDate().getDate() : ""}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm italic">
                                    No upcoming announcements
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="section-label mb-3">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)]">
                            {[
                                { label: "File Complaint", path: "/resident/complaints", emoji: "📝" },
                                { label: "Register Visitor", path: "/resident/visitors", emoji: "🧑‍🤝‍🧑" },
                                { label: "Announcements", path: "/resident/announcements", emoji: "📢" },
                                { label: "Emergency", path: "/resident/emergency", emoji: "🚨" },
                            ].map((action) => (
                                <motion.button
                                    key={action.path}
                                    whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(229,185,75,0.15)" }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(action.path)}
                                    className="card p-4 rounded-xl text-center cursor-pointer border border-transparent hover:border-[#E5B94B]/30 transition-colors flex flex-col items-center justify-center h-full"
                                >
                                    <div className="text-2xl mb-2">{action.emoji}</div>
                                    <div className="text-xs font-semibold text-slate-800">{action.label}</div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </PageTransition>
        </DashboardLayout>
    );
}
