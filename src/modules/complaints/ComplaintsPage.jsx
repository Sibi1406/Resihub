import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
    subscribeAllComplaints,
    subscribeComplaints,
    addComplaint,
    updateComplaintStatus,
} from "../../services/complaintService";
import { classifyComplaint, COMPLAINT_CATEGORIES } from "../../services/aiCategorizationService";
import { Sparkles, Loader2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORY_COLORS = {
    Plumbing: "bg-blue-100 text-blue-700",
    Electrical: "bg-yellow-100 text-yellow-700",
    Security: "bg-red-100 text-red-700",
    Maintenance: "bg-orange-100 text-orange-700",
    Housekeeping: "bg-green-100 text-green-700",
    Noise: "bg-purple-100 text-purple-700",
    Parking: "bg-slate-100 text-slate-700",
    Internet: "bg-cyan-100 text-cyan-700",
    Other: "bg-gray-100 text-gray-600",
};

export default function ComplaintsPage() {
    const { user, role, userData } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [filter, setFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", category: "" });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggested, setAiSuggested] = useState("");
    const [manualOverride, setManualOverride] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (role === "admin") return subscribeAllComplaints(setComplaints);
        return subscribeComplaints({ raisedBy: user.uid }, setComplaints);
    }, [user, role]);

    const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

    // ── AI auto-classify after user types title + description ──────────────
    const handleAutoClassify = async () => {
        if (!form.title.trim() && !form.description.trim()) return;
        setAiLoading(true);
        try {
            const suggested = await classifyComplaint(form.title, form.description);
            setAiSuggested(suggested);
            if (!manualOverride) setForm((f) => ({ ...f, category: suggested }));
            toast.success(`AI suggested: ${suggested}`);
        } catch {
            toast.error("AI classification failed");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.category) {
            toast.error("Please select or AI-classify a category");
            return;
        }
        setSubmitting(true);
        try {
            await addComplaint(
                {
                    ...form,
                    raisedBy: user.uid,
                    residentName: userData?.name || "",
                    apartmentNumber: userData?.apartmentNumber || "",
                    aiCategorized: !manualOverride && !!aiSuggested,
                },
                imageFile
            );
            toast.success("Complaint raised successfully");
            setShowModal(false);
            setForm({ title: "", description: "", category: "" });
            setImageFile(null);
            setAiSuggested("");
            setManualOverride(false);
        } catch {
            toast.error("Failed to raise complaint");
        }
        setSubmitting(false);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateComplaintStatus(id, newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    // Category analytics
    const catCounts = {};
    complaints.forEach((c) => {
        catCounts[c.category || "Other"] = (catCounts[c.category || "Other"] || 0) + 1;
    });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Complaints</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {role === "admin" ? "Manage all complaints" : "Track your complaints"}
                    </p>
                </div>
                {role !== "security" && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                    >
                        <span className="text-lg leading-none">+</span> Raise Complaint
                    </button>
                )}
            </div>

            {/* Category analytics bar */}
            {Object.keys(catCounts).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                        <span
                            key={cat}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-600"}`}
                        >
                            {cat}
                            <span className="bg-white/60 px-1.5 py-0.5 rounded-md font-bold">{count}</span>
                        </span>
                    ))}
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
                {["all", "pending", "in-progress", "resolved"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize cursor-pointer
              ${filter === f ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
                        style={filter === f ? { background: "linear-gradient(135deg, #E5B94B, #C97B1A)" } : {}}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Complaints list */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                        <p className="text-slate-400">No complaints found</p>
                    </div>
                ) : (
                    filtered.map((c) => (
                        <div key={c.id} className="card card-hover p-5 border border-slate-200">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-slate-800">{c.title}</h3>
                                        <StatusBadge status={c.status} />
                                        {c.category && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${CATEGORY_COLORS[c.category] || "bg-gray-100 text-gray-600"}`}>
                                                {c.aiCategorized && <Sparkles className="w-3 h-3" />}
                                                {c.category}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mb-2">{c.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                        {c.apartmentNumber && <span>🏠 {c.apartmentNumber}</span>}
                                        {c.residentName && role === "admin" && <span>👤 {c.residentName}</span>}
                                        <span>📅 {c.createdAt?.toDate?.()?.toLocaleDateString() || "—"}</span>
                                        {c.status === "resolved" && c.resolvedAt && (
                                            <span className="text-emerald-500">
                                                ✅ Resolved {c.resolvedAt?.toDate?.()?.toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {c.imageUrl && (
                                        <a href={c.imageUrl} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                            <ImageIcon className="w-3.5 h-3.5" /> Image
                                        </a>
                                    )}
                                    {role === "admin" && c.status !== "resolved" && (
                                        <select
                                            value={c.status}
                                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Complaint Modal */}
            <Modal open={showModal} onClose={() => { setShowModal(false); setAiSuggested(""); setManualOverride(false); }} title="Raise a Complaint">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                            placeholder="Brief title of your issue"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40 resize-none"
                            placeholder="Describe the issue in detail…"
                        />
                    </div>

                    {/* AI Classify button */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleAutoClassify}
                            disabled={aiLoading || (!form.title.trim() && !form.description.trim())}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5B94B] bg-amber-50 text-xs font-semibold text-[#7A4E0A] hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            {aiLoading ? "Classifying…" : "AI Auto-Classify"}
                        </button>
                        {aiSuggested && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[aiSuggested] || ""}`}>
                                ✨ Suggested: {aiSuggested}
                            </span>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
                            <span>Category</span>
                            {aiSuggested && !manualOverride && (
                                <button type="button" onClick={() => setManualOverride(true)}
                                    className="text-xs text-slate-400 hover:text-slate-600 underline">
                                    Override manually
                                </button>
                            )}
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => { setForm({ ...form, category: e.target.value }); setManualOverride(true); }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                        >
                            <option value="">— Select a category —</option>
                            {COMPLAINT_CATEGORIES.map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Attach Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-[#7A4E0A] file:font-medium file:cursor-pointer"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !form.category}
                        className="w-full py-2.5 text-white font-semibold rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-md hover:shadow-lg"
                        style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                    >
                        {submitting ? "Submitting…" : "Submit Complaint"}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
