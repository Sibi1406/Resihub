import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
    subscribeEmergencies,
    raiseEmergency,
    resolveEmergency,
} from "../../services/emergencyService";
import toast from "react-hot-toast";

const TYPES = ["Fire", "Medical", "Security"];

export default function EmergencyPage() {
    const { user, role, userData } = useAuth();
    const [emergencies, setEmergencies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ type: "Fire", description: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const unsub = subscribeEmergencies(setEmergencies);
        return unsub;
    }, []);

    const active = emergencies.filter((e) => e.status === "active");
    const resolved = emergencies.filter((e) => e.status === "resolved");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await raiseEmergency({
                ...form,
                raisedBy: user.uid,
                raisedByName: userData?.name || "",
                raisedByRole: role,
            });
            toast.success("Emergency raised!");
            setShowModal(false);
            setForm({ type: "Fire", description: "" });
        } catch {
            toast.error("Failed to raise emergency");
        }
        setSubmitting(false);
    };

    const handleResolve = async (id) => {
        try {
            await resolveEmergency(id);
            toast.success("Emergency resolved");
        } catch {
            toast.error("Failed to resolve emergency");
        }
    };

    const typeIcon = { Fire: "🔥", Medical: "🏥", Security: "🔒" };

    return (
        <DashboardLayout>
            {active.length > 0 && (
                <div className="w-full bg-red-600 text-white px-6 py-3 flex items-center justify-between animate-pulse mb-4">
                    <span className="font-bold">🚨 Emergency Active</span>
                    <span className="text-sm opacity-90">
                        {active[0].raisedByName || ''} • {(() => {
                            const then = active[0].createdAt?.toDate?.().getTime();
                            const now = Date.now();
                            const diff = now - then;
                            const hrs = Math.floor(diff / (1000 * 60 * 60));
                            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            if (hrs > 0) return `${hrs}h ${mins}m ago`;
                            if (mins > 0) return `${mins}m ago`;
                            return 'just now';
                        })()}
                    </span>
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Emergency Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {active.length} active emergency{active.length !== 1 ? "ies" : ""}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                >
                    🚨 Raise Emergency
                </button>
            </div>

            {/* Active emergencies */}
            {active.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-base font-semibold text-red-700 mb-3">Active Emergencies</h2>
                    <div className="space-y-3">
                        {active.map((em) => (
                            <div key={em.id} className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{typeIcon[em.type] || "🚨"}</span>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-red-800">{em.type} Emergency</h3>
                                            <StatusBadge status="active" />
                                        </div>
                                        <p className="text-sm text-red-600">{em.description}</p>
                                        <p className="text-xs text-red-400 mt-1">
                                            Raised by {em.raisedByName || "Unknown"} • {em.createdAt?.toDate?.()?.toLocaleString() || "—"}
                                        </p>
                                    </div>
                                </div>
                                {(role === "admin" || role === "security") && (
                                    <button
                                        onClick={() => handleResolve(em.id)}
                                        className="px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                                    >
                                        ✅ Resolve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-700 mb-4">Emergency History</h2>
                {resolved.length === 0 ? (
                    <p className="text-sm text-slate-400">No resolved emergencies yet</p>
                ) : (
                    <div className="space-y-3">
                        {resolved.map((em) => (
                            <div key={em.id} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                                <span className="text-xl">{typeIcon[em.type] || "🚨"}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-sm font-semibold text-slate-700">{em.type} Emergency</h3>
                                        <StatusBadge status="resolved" />
                                    </div>
                                    <p className="text-sm text-slate-500">{em.description}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Raised: {em.createdAt?.toDate?.()?.toLocaleString() || "—"} • Resolved: {em.resolvedAt?.toDate?.()?.toLocaleString() || "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Raise modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Raise Emergency">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {TYPES.map((t) => (
                                <option key={t}>{t}</option>
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
                            placeholder="Describe the emergency situation"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {submitting ? "Raising..." : "🚨 Raise Emergency"}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
