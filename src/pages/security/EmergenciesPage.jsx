import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { subscribeActiveEmergencies, resolveEmergency, raiseEmergency } from '../../services/emergencyService';
import ActionButton from '../../components/security/ActionButton';
import { AlertTriangle, Megaphone, Send, X, Siren } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Emergency type options ────────────────────────────────────
const EMERGENCY_TYPES = [
    { value: "fire", label: "🔥 Fire Alert", color: "#EF4444" },
    { value: "medical", label: "🚑 Medical Emergency", color: "#F97316" },
    { value: "security_breach", label: "🚨 Security Breach", color: "#7C3AED" },
    { value: "flood", label: "💧 Flood / Water Damage", color: "#3B82F6" },
    { value: "gas_leak", label: "⚠️ Gas Leak", color: "#F59E0B" },
    { value: "power_outage", label: "⚡ Power Outage", color: "#6366F1" },
    { value: "general", label: "📢 General Alert", color: "#64748B" },
];

function BroadcastModal({ open, onClose }) {
    const [form, setForm] = useState({ type: "general", description: "", urgency: "high" });
    const [sending, setSending] = useState(false);

    if (!open) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.description.trim()) return;
        setSending(true);
        try {
            await raiseEmergency({
                type: form.type,
                description: form.description.trim(),
                urgency: form.urgency,
                broadcastedBy: "Security",
                source: "security_broadcast",
            });
            toast.success("🚨 Emergency notification broadcasted to all residents!");
            setForm({ type: "general", description: "", urgency: "high" });
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to broadcast notification");
        } finally {
            setSending(false);
        }
    };

    const selectedType = EMERGENCY_TYPES.find(t => t.value === form.type);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ background: "linear-gradient(135deg, #EF4444, #B91C1C)" }}>
                    <div className="flex items-center gap-3">
                        <Siren className="w-5 h-5 text-white" />
                        <h2 className="text-white font-bold text-base">Broadcast Emergency Alert</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Warning banner */}
                <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-xs text-red-700 font-medium">⚠️ This alert will be visible to ALL residents immediately. Use only for genuine emergencies.</p>
                </div>

                <form onSubmit={handleSend} className="p-6 space-y-4">
                    {/* Type */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Emergency Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {EMERGENCY_TYPES.map(t => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, type: t.value }))}
                                    className="text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all"
                                    style={{
                                        borderColor: form.type === t.value ? t.color : "#E2E8F0",
                                        background: form.type === t.value ? `${t.color}15` : "white",
                                        color: form.type === t.value ? t.color : "#64748B",
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Urgency */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Urgency Level</label>
                        <div className="flex gap-2">
                            {[
                                { v: "critical", l: "🔴 Critical", bg: "#EF4444" },
                                { v: "high", l: "🟠 High", bg: "#F97316" },
                                { v: "medium", l: "🟡 Medium", bg: "#EAB308" },
                            ].map(u => (
                                <button
                                    key={u.v}
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, urgency: u.v }))}
                                    className="flex-1 px-3 py-2 rounded-xl border text-xs font-semibold transition-all"
                                    style={{
                                        borderColor: form.urgency === u.v ? u.bg : "#E2E8F0",
                                        background: form.urgency === u.v ? `${u.bg}15` : "white",
                                        color: form.urgency === u.v ? u.bg : "#94A3B8",
                                    }}
                                >
                                    {u.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Alert Message *</label>
                        <textarea
                            required
                            rows={3}
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Describe the emergency clearly. e.g. Fire reported on 3rd floor. Please evacuate immediately via staircase."
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">{form.description.length}/300 characters</p>
                    </div>

                    {/* Preview */}
                    {form.description && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                            <p className="text-xs font-semibold text-red-600 mb-1">Preview — What residents will see:</p>
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-red-700 capitalize">{selectedType?.label} — {form.urgency.toUpperCase()}</p>
                                    <p className="text-xs text-red-600 mt-0.5">{form.description}</p>
                                    <p className="text-xs text-red-400 mt-1">📍 Broadcasted by: Security Team</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={sending || !form.description.trim()}
                        className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #EF4444, #B91C1C)" }}
                    >
                        <Send className="w-4 h-4" />
                        {sending ? "Broadcasting…" : "🚨 Broadcast to All Residents"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function EmergenciesPage() {
    const [emergencies, setEmergencies] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const unsub = subscribeActiveEmergencies(setEmergencies);
        return () => unsub();
    }, []);

    const handleResolve = async (id) => {
        try {
            await resolveEmergency(id);
            toast.success("Emergency marked as resolved");
        } catch {
            toast.error("Failed to resolve emergency");
        }
    };

    const urgencyColor = { critical: "#EF4444", high: "#F97316", medium: "#EAB308" };

    return (
        <DashboardLayout>
            <BroadcastModal open={modalOpen} onClose={() => setModalOpen(false)} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Emergencies</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {emergencies.length} active alert{emergencies.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {/* Broadcast Button */}
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    style={{ background: "linear-gradient(135deg, #EF4444, #B91C1C)" }}
                >
                    <Megaphone className="w-4 h-4" />
                    Broadcast Alert to Residents
                </button>
            </div>

            {emergencies.length === 0 ? (
                <div className="card p-10 text-center">
                    <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No active emergencies</p>
                    <p className="text-xs text-slate-400 mt-1">Use the broadcast button above to alert all residents</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {emergencies.map(e => (
                        <div
                            key={e.id}
                            className="p-5 rounded-2xl border flex items-start gap-4"
                            style={{
                                background: `${urgencyColor[e.urgency] || "#EF4444"}08`,
                                borderColor: `${urgencyColor[e.urgency] || "#EF4444"}30`,
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${urgencyColor[e.urgency] || "#EF4444"}20` }}
                            >
                                <AlertTriangle className="w-5 h-5" style={{ color: urgencyColor[e.urgency] || "#EF4444" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-800 capitalize">{e.type?.replace(/_/g, " ")}</span>
                                    {e.urgency && (
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                                            style={{ background: urgencyColor[e.urgency] || "#EF4444" }}
                                        >
                                            {e.urgency.toUpperCase()}
                                        </span>
                                    )}
                                    {e.source === "security_broadcast" && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                            Security Broadcast
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{e.description}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                    📍 Reported by: {e.broadcastedBy || e.reportedByName || "Resident"} &nbsp;•&nbsp;
                                    {e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000).toLocaleString("en-IN") : ""}
                                </p>
                            </div>
                            <ActionButton
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors flex-shrink-0"
                                onClick={() => handleResolve(e.id)}
                            >
                                ✓ Resolve
                            </ActionButton>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
