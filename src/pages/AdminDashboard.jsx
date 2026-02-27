import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import PageTransition from "../components/PageTransition";
import { staggerContainer, cardVariants, fadeInUp, listItemVariants, buttonHover } from "../lib/motionVariants";
import { subscribeAllComplaints, updateComplaintStatus as svcUpdateComplaintStatus } from "../services/complaintService";
import { subscribeActiveVisitors } from "../services/visitorService";
import { subscribeActiveEmergencies } from "../services/emergencyService";
import { resolveEmergency as svcResolveEmergency } from "../services/emergencyService";
import { subscribeAnnouncements, addAnnouncement } from "../services/announcementService";
import { subscribeAllPayments, getCurrentMonth } from "../services/paymentService";
import { Users, FileText, AlertTriangle, Megaphone, CreditCard, CheckCircle, ShieldAlert, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

function safeDate(ts) {
    if (!ts) return null;
    try {
        if (ts?.toDate) return ts.toDate();
        if (ts?.seconds) return new Date(ts.seconds * 1000);
        return new Date(ts);
    } catch { return null; }
}

function formatTs(ts, opts) {
    const d = safeDate(ts);
    if (!d) return "—";
    return d.toLocaleString("en-IN", opts || { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [activeVisitors, setActiveVisitors] = useState([]);
    const [emergencies, setEmergencies] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
    const [selectedEmergency, setSelectedEmergency] = useState(null);
    const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementMessage, setAnnouncementMessage] = useState("");

    // Loading states
    const [complaintUpdating, setComplaintUpdating] = useState(false);
    const [resolvingEmergency, setResolvingEmergency] = useState(false);
    const [announcementLoading, setAnnouncementLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [newStatus, setNewStatus] = useState("pending");

    const currentMonth = getCurrentMonth();

    useEffect(() => {
        const unsubs = [
            subscribeAllComplaints((data) => { setComplaints(data); setLoading(false); }),
            subscribeActiveVisitors(setActiveVisitors),
            subscribeActiveEmergencies(setEmergencies),
            subscribeAnnouncements(setAnnouncements),
            subscribeAllPayments(currentMonth, setPayments),
        ];
        return () => unsubs.forEach((u) => u());
    }, [currentMonth]);

    const activeComplaints = complaints.filter((c) => c.status !== "resolved").length;
    const unpaidPayments = payments.filter((p) => p.status !== "paid").length;

    const filteredComplaints = complaints.filter((c) =>
        filter === "all" ? true : c.status === filter
    );

    async function updateComplaintStatus() {
        if (!selectedComplaint) return;
        setComplaintUpdating(true);
        try {
            await svcUpdateComplaintStatus(selectedComplaint.id, newStatus);
            toast.success("Status updated successfully");
            setStatusModalOpen(false);
        } catch {
            toast.error("Failed to update status");
        } finally {
            setComplaintUpdating(false);
        }
    }

    async function resolveSelectedEmergency() {
        if (!selectedEmergency?.id) return;
        setResolvingEmergency(true);
        try {
            await svcResolveEmergency(selectedEmergency.id);
            toast.success("Emergency resolved");
            setEmergencyModalOpen(false);
        } catch {
            toast.error("Failed to resolve emergency");
        } finally {
            setResolvingEmergency(false);
        }
    }

    async function handlePostAnnouncement() {
        if (!announcementTitle.trim() || !announcementMessage.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        setAnnouncementLoading(true);
        try {
            await addAnnouncement({ title: announcementTitle.trim(), message: announcementMessage.trim(), author: "Admin" });
            toast.success("Announcement posted!");
            setAnnouncementTitle("");
            setAnnouncementMessage("");
            setAnnouncementModalOpen(false);
        } catch {
            toast.error("Failed to post announcement");
        } finally {
            setAnnouncementLoading(false);
        }
    }

    return (
        <DashboardLayout>
            <PageTransition>
                {/* Emergency Banner */}
                <AnimatePresence>
                    {emergencies.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 rounded-2xl border-l-4 border-red-500 bg-red-50/90 backdrop-blur-sm overflow-hidden"
                            style={{ boxShadow: "0 8px 24px rgba(220,38,38,0.12)" }}
                        >
                            <div className="p-4 flex items-center gap-3">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-red-800 text-sm">
                                        🚨 Active Emergency — {emergencies.length} alert{emergencies.length > 1 ? "s" : ""}
                                    </p>
                                    <p className="text-xs text-red-600 truncate mt-0.5">
                                        {emergencies[0]?.type?.toUpperCase()} · {emergencies[0]?.description}
                                    </p>
                                </div>
                                <motion.button
                                    {...buttonHover}
                                    onClick={() => { setSelectedEmergency(emergencies[0]); setEmergencyModalOpen(true); }}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex-shrink-0"
                                >
                                    Resolve
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page Header */}
                <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => window.location.hash = '#/admin/residents'}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#E5B94B] hover:bg-amber-50 transition-all shadow-sm"
                        >
                            <UserPlus className="w-3.5 h-3.5 text-[#E5B94B]" />
                            Add Resident
                        </button>
                        <button
                            onClick={() => setAnnouncementModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#E5B94B] hover:bg-amber-50 transition-all shadow-sm"
                        >
                            <Megaphone className="w-3.5 h-3.5 text-[#E5B94B]" />
                            Post Announcement
                        </button>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
                >
                    {[
                        { icon: <FileText className="w-5 h-5" />, label: "Active Complaints", value: activeComplaints, color: "primary" },
                        { icon: <Users className="w-5 h-5" />, label: "Visitors Inside", value: activeVisitors.length, color: "blue" },
                        { icon: <CreditCard className="w-5 h-5" />, label: "Unpaid Dues", value: unpaidPayments, color: "warning" },
                        { icon: <AlertTriangle className="w-5 h-5" />, label: "Active Emergencies", value: emergencies.length, color: "red" },
                    ].map((card) => (
                        <motion.div key={card.label} variants={cardVariants}>
                            <StatCard {...card} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Complaints Panel */}
                    <motion.div
                        variants={fadeInUp} initial="initial" animate="animate"
                        className="lg:col-span-2 card rounded-xl p-5"
                    >
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="section-heading">Complaint Management</h2>
                                <p className="text-[var(--text-caption)] text-slate-400 mt-0.5">{filteredComplaints.length} {filter === "all" ? "total" : filter}</p>
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No complaints found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-slate-400 border-b border-slate-50">
                                            <th className="pb-2 font-medium">Title</th>
                                            <th className="pb-2 font-medium">Apt</th>
                                            <th className="pb-2 font-medium">Status</th>
                                            <th className="pb-2 font-medium">Date</th>
                                            <th className="pb-2" />
                                        </tr>
                                    </thead>
                                    <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                                        {filteredComplaints.slice(0, 8).map((c) => (
                                            <motion.tr
                                                key={c.id}
                                                variants={listItemVariants}
                                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="py-2.5 pr-2">
                                                    <p className="font-medium text-slate-700 text-xs truncate max-w-[160px]">{c.title || "—"}</p>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{c.residentName}</p>
                                                </td>
                                                <td className="py-2.5 text-slate-500 text-xs">{c.apartmentNumber || "—"}</td>
                                                <td className="py-2.5"><StatusBadge status={c.status} /></td>
                                                <td className="py-2.5 text-[10px] text-slate-400">{formatTs(c.createdAt, { day: "2-digit", month: "short" })}</td>
                                                <td className="py-2.5 text-right">
                                                    <motion.button
                                                        {...buttonHover}
                                                        onClick={() => { setSelectedComplaint(c); setNewStatus(c.status); setStatusModalOpen(true); }}
                                                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#E5B94B] hover:bg-amber-50 text-xs font-medium text-slate-600 hover:text-[#7A4E0A] transition-all"
                                                    >
                                                        Update
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </motion.tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column */}
                    <div className="space-y-5">
                        {/* Live Visitors */}
                        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="card rounded-xl p-5">
                            <h3 className="section-heading text-base mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" aria-hidden />
                                Live Visitors
                                <span className="ml-auto text-[var(--text-caption)] font-normal text-slate-400">{activeVisitors.length} inside</span>
                            </h3>
                            {activeVisitors.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">No visitors currently inside</p>
                            ) : (
                                <div className="space-y-2">
                                    {activeVisitors.slice(0, 5).map((v) => (
                                        <div key={v.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                                                {(v.visitorName || v.name || "V")[0]?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-slate-700 truncate">{v.visitorName || v.name || "—"}</p>
                                                <p className="text-[10px] text-slate-400">Apt {v.apartmentNumber || "—"}</p>
                                            </div>
                                            <div className="ml-auto text-[10px] text-slate-400">{formatTs(v.entryTime, { hour: "2-digit", minute: "2-digit" })}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Payment Summary */}
                        <motion.div variants={fadeInUp} initial="initial" animate="animate"
                            className="card rounded-xl p-5 border-l-4 border-[#E5B94B]"
                        >
                            <h3 className="section-heading text-base mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#E5B94B] flex-shrink-0" />
                                Payments — {currentMonth}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                                    <p className="text-2xl font-bold text-emerald-600">{payments.filter(p => p.status === "paid").length}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Paid</p>
                                </div>
                                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{unpaidPayments}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Due</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Announcements */}
                <motion.div variants={fadeInUp} initial="initial" animate="animate" className="card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <h2 className="section-heading flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-[#E5B94B] flex-shrink-0" />
                            Announcements
                        </h2>
                        <motion.button
                            {...buttonHover}
                            onClick={() => setAnnouncementModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-[#E5B94B] text-white text-xs font-bold hover:bg-[#d4a63a] transition-colors"
                        >
                            + Post
                        </motion.button>
                    </div>
                    {announcements.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No announcements yet</p>
                    ) : (
                        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
                            {announcements.slice(0, 4).map((a) => (
                                <motion.div
                                    key={a.id}
                                    variants={listItemVariants}
                                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#E5B94B]/30 hover:bg-amber-50/20 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-[#E5B94B]/10 flex items-center justify-center flex-shrink-0">
                                        <Megaphone className="w-4 h-4 text-[#7A4E0A]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{(a.message || a.body || "").slice(0, 80)}{(a.message || a.body || "").length > 80 ? "…" : ""}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-400 flex-shrink-0">{formatTs(a.createdAt, { day: "2-digit", month: "short" })}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>

                {/* Modals */}
                <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Complaint Status">
                    {selectedComplaint && (
                        <div>
                            <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="font-semibold text-slate-800 text-sm">{selectedComplaint.title}</p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{selectedComplaint.description}</p>
                                <div className="flex gap-3 mt-2 text-xs text-slate-400">
                                    <span>Apt: {selectedComplaint.apartmentNumber}</span>
                                    <span>•</span>
                                    <span>{selectedComplaint.category}</span>
                                </div>
                            </div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Update Status To:</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                            >
                                <option value="pending">🟡 Pending</option>
                                <option value="in-progress">🔵 In Progress</option>
                                <option value="resolved">✅ Resolved</option>
                            </select>
                            <div className="flex justify-end gap-2 mt-5">
                                <button onClick={() => setStatusModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <motion.button
                                    {...buttonHover}
                                    onClick={updateComplaintStatus}
                                    disabled={complaintUpdating}
                                    className="px-4 py-2 rounded-xl bg-[#E5B94B] text-white text-sm font-bold hover:bg-[#d4a63a] transition-colors disabled:opacity-60"
                                >
                                    {complaintUpdating ? "Saving…" : "Save Changes"}
                                </motion.button>
                            </div>
                        </div>
                    )}
                </Modal>

                <Modal open={emergencyModalOpen} onClose={() => setEmergencyModalOpen(false)} title="Resolve Emergency">
                    {selectedEmergency && (
                        <div>
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 mb-4">
                                <p className="font-bold text-red-800 text-sm">⚠️ {selectedEmergency.type?.toUpperCase()}</p>
                                <p className="text-sm text-red-700 mt-1">{selectedEmergency.description}</p>
                                <p className="text-xs text-red-500 mt-2">By: {selectedEmergency.raisedByName} · Apt {selectedEmergency.apartmentNumber}</p>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">Mark this emergency as resolved? This will notify all parties.</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEmergencyModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Keep Active</button>
                                <motion.button
                                    {...buttonHover}
                                    onClick={resolveSelectedEmergency}
                                    disabled={resolvingEmergency}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                                >
                                    {resolvingEmergency ? "Resolving…" : "✓ Resolve"}
                                </motion.button>
                            </div>
                        </div>
                    )}
                </Modal>

                <Modal open={announcementModalOpen} onClose={() => setAnnouncementModalOpen(false)} title="Post Announcement">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title</label>
                            <input
                                type="text"
                                value={announcementTitle}
                                onChange={(e) => setAnnouncementTitle(e.target.value)}
                                placeholder="Announcement title…"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Message</label>
                            <textarea
                                value={announcementMessage}
                                onChange={(e) => setAnnouncementMessage(e.target.value)}
                                placeholder="Write your announcement…"
                                rows={4}
                                maxLength={1000}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40 resize-none"
                            />
                            <p className="text-[10px] text-slate-400 text-right mt-1">{announcementMessage.length}/1000</p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setAnnouncementModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                            <motion.button
                                {...buttonHover}
                                onClick={handlePostAnnouncement}
                                disabled={!announcementTitle.trim() || !announcementMessage.trim() || announcementLoading}
                                className="px-4 py-2 rounded-xl bg-[#E5B94B] text-white text-sm font-bold hover:bg-[#d4a63a] disabled:opacity-60"
                            >
                                {announcementLoading ? "Posting…" : "Post"}
                            </motion.button>
                        </div>
                    </div>
                </Modal>
            </PageTransition>
        </DashboardLayout>
    );
}
