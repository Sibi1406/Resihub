import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import PaymentStatusCard from "../components/PaymentStatusCard";
import PageTransition from "../components/PageTransition";
import { staggerContainer, cardVariants, fadeInUp } from "../lib/motionVariants";
import { FileText, UserCheck, AlertTriangle, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeUserComplaints } from "../services/complaintService";
import { subscribeVisitors } from "../services/visitorService";
import { subscribeActiveEmergencies } from "../services/emergencyService";
import { subscribePaymentStatus, getCurrentMonth } from "../services/paymentService";

export default function ResidentDashboard() {
    const { user, userData } = useAuth();
    const navigate = useNavigate();

    const [activeComplaints, setActiveComplaints] = useState(0);
    const [scheduledVisitors, setScheduledVisitors] = useState(0);
    const [activeEmergencies, setActiveEmergencies] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState(null);
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
            subscribeVisitors({ apartmentNumber: userData?.apartmentNumber, status: "preapproved" }, (list) => {
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {[
                        { icon: <FileText className="w-5 h-5" />, label: "Active Complaints", value: activeComplaints, color: "blue", path: "/resident/complaints", sub: "tap to view" },
                        { icon: <UserCheck className="w-5 h-5" />, label: "Visitors Scheduled", value: scheduledVisitors, color: "primary", path: "/resident/visitors", sub: "tap to manage" },
                        { icon: <AlertTriangle className="w-5 h-5" />, label: "Active Emergencies", value: activeEmergencies, color: "red", path: "/resident/emergency", sub: "tap to report" },
                        { icon: <MessageCircle className="w-5 h-5" />, label: "Community Chat", value: "Live", color: "violet", path: "/resident/chat", sub: "tap to join" },
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

                {/* Quick Actions */}
                <div className="animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
                    <h2 className="section-label mb-3">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                                className="card p-4 rounded-xl text-center cursor-pointer border border-transparent hover:border-[#E5B94B]/30 transition-colors"
                            >
                                <div className="text-2xl mb-1">{action.emoji}</div>
                                <div className="text-xs font-medium text-slate-700">{action.label}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </PageTransition>
        </DashboardLayout>
    );
}
