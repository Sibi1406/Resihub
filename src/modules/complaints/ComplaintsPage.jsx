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
import toast from "react-hot-toast";

// only the main categories for residents as per design
const CATEGORIES = ["Plumbing", "Electrical", "Security", "Other"];

export default function ComplaintsPage() {
    const { user, role, userData } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [filter, setFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", category: "Plumbing" });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        let unsub;
        if (role === "admin") {
            unsub = subscribeAllComplaints(setComplaints);
        } else {
            unsub = subscribeComplaints({ raisedBy: user.uid }, setComplaints);
        }
        return unsub;
    }, [user, role]);

    const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addComplaint(
                {
                    ...form,
                    raisedBy: user.uid,
                    raisedByName: userData?.name || "",
                    apartmentNumber: userData?.apartmentNumber || "",
                },
                imageFile
            );
            toast.success("Complaint raised successfully");
            setShowModal(false);
            setForm({ title: "", description: "", category: "Plumbing" });
            setImageFile(null);
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
        catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    });

    return (
        <DashboardLayout>
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
            {role === "admin" && Object.keys(catCounts).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(catCounts).map(([cat, count]) => (
                        <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                            {cat} <span className="bg-slate-100 px-1.5 py-0.5 rounded-md font-bold">{count}</span>
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
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-slate-800">{c.title}</h3>
                                        <StatusBadge status={c.status} />
                                    </div>
                                    <p className="text-sm text-slate-500 mb-2">{c.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                        <span className="bg-slate-50 px-2 py-1 rounded">{c.category}</span>
                                        {c.apartmentNumber && <span>🏠 {c.apartmentNumber}</span>}
                                        <span>📅 {c.createdAt?.toDate?.()?.toLocaleDateString() || "—"}</span>
                                        {c.status === "resolved" && c.resolvedAt && (
                                            <>
                                                <span className="text-emerald-500">
                                                    ✅ Resolved {c.resolvedAt?.toDate?.()?.toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-slate-400 ml-2">
                                                    ({(() => {
                                                        const start = c.createdAt?.toDate?.();
                                                        const end = c.resolvedAt?.toDate?.();
                                                        if (!start || !end) return "";
                                                        const diff = end - start;
                                                        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                        const parts = [];
                                                        if (d) parts.push(`${d}d`);
                                                        if (h) parts.push(`${h}h`);
                                                        if (m) parts.push(`${m}m`);
                                                        return parts.join(" ") || "0m";
                                                    })()})
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                    <span>Raised</span>
                                                    <span>→</span>
                                                    <span>In Progress</span>
                                                    <span>→</span>
                                                    <span>Resolved</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {c.imageUrl && (
                                        <a href={c.imageUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">
                                            📷 Image
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

            {/* Create modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Raise a Complaint">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Brief title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            placeholder="Describe the issue"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Attach Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-600 file:font-medium file:cursor-pointer"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 text-white font-semibold rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-md hover:shadow-lg"
                        style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                    >
                        {submitting ? "Submitting..." : "Submit Complaint"}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
