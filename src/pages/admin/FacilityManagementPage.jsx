import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import {
    subscribeAllFacilities, subscribeAllBookings,
    addFacility, updateFacility, issueDisciplineStrike, markCompleted, cancelBooking
} from "../../services/facilityService";
import { Plus, AlertTriangle, CheckCircle, X, Settings, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLE = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-gray-50 text-gray-500 border-gray-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function FacilityManagementPage() {
    const [facilities, setFacilities] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [tab, setTab] = useState("bookings");
    const [strikeModal, setStrikeModal] = useState(null);
    const [strikeNote, setStrikeNote] = useState("");
    const [addFacModal, setAddFacModal] = useState(false);
    const [facForm, setFacForm] = useState({ name: "", emoji: "🏛️", description: "", capacity: 20, openTime: "06:00", closeTime: "22:00" });
    const [saving, setSaving] = useState(false);
    const [bookingFilter, setBookingFilter] = useState("all");

    useEffect(() => {
        const u1 = subscribeAllFacilities(setFacilities);
        const u2 = subscribeAllBookings(setBookings);
        return () => { u1(); u2(); };
    }, []);

    const filteredBookings = bookingFilter === "all" ? bookings
        : bookingFilter === "strikes" ? bookings.filter((b) => b.disciplineStrike)
        : bookings.filter((b) => b.status === bookingFilter);

    const handleIssueStrike = async () => {
        if (!strikeNote.trim()) { toast.error("Please enter a reason for the strike"); return; }
        setSaving(true);
        try {
            await issueDisciplineStrike(strikeModal.id, strikeNote);
            toast.success("Discipline strike issued");
            setStrikeModal(null);
            setStrikeNote("");
        } catch {
            toast.error("Failed to issue strike");
        } finally {
            setSaving(false);
        }
    };

    const handleMarkComplete = async (id) => {
        try { await markCompleted(id); toast.success("Marked as completed"); }
        catch { toast.error("Failed"); }
    };

    const handleCancelBooking = async (id) => {
        try { await cancelBooking(id); toast.success("Booking cancelled"); }
        catch { toast.error("Failed to cancel"); }
    };

    const handleAddFacility = async () => {
        if (!facForm.name.trim()) { toast.error("Enter facility name"); return; }
        setSaving(true);
        try {
            await addFacility({ ...facForm, capacity: Number(facForm.capacity) });
            toast.success("Facility added");
            setAddFacModal(false);
            setFacForm({ name: "", emoji: "🏛️", description: "", capacity: 20, openTime: "06:00", closeTime: "22:00" });
        } catch {
            toast.error("Failed to add facility");
        } finally {
            setSaving(false);
        }
    };

    const toggleFacility = async (fac) => {
        try {
            await updateFacility(fac.id, { active: !fac.active });
            toast.success(`${fac.name} ${fac.active ? "disabled" : "enabled"}`);
        } catch {
            toast.error("Failed to update facility");
        }
    };

    const strikeCount = bookings.filter((b) => b.disciplineStrike).length;
    const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Facility Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {confirmedCount} active bookings · {strikeCount} discipline strikes issued
                    </p>
                </div>
                <button
                    onClick={() => setAddFacModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                >
                    <Plus className="w-4 h-4" /> Add Facility
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit flex-wrap">
                {[["bookings","All Bookings"], ["facilities","Facilities"], ["strikes","Discipline"]].map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                            ${tab === id ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
                        style={tab === id ? { background: "linear-gradient(135deg, #E5B94B, #C97B1A)" } : {}}>
                        {label}
                        {id === "strikes" && strikeCount > 0 && (
                            <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{strikeCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* All Bookings */}
            {tab === "bookings" && (
                <>
                    <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-4 w-fit flex-wrap">
                        {["all","confirmed","completed","cancelled"].map((f) => (
                            <button key={f} onClick={() => setBookingFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer
                                    ${bookingFilter === f ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {filteredBookings.length === 0 ? (
                            <div className="bg-white rounded-xl border p-10 text-center">
                                <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">No bookings found</p>
                            </div>
                        ) : filteredBookings.map((b) => (
                            <div key={b.id} className={`card p-4 border ${b.disciplineStrike ? "border-red-200 bg-red-50/20" : "border-slate-200"}`}>
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <p className="font-semibold text-slate-800">{b.facilityName}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLE[b.status] || ""}`}>
                                                {b.status}
                                            </span>
                                            {b.disciplineStrike && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Strike
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500">📅 {b.date} · ⏰ {b.startTime}–{b.endTime}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">👤 {b.bookedByName} · Apt {b.apartmentNumber}</p>
                                        {b.adminNote && <p className="text-xs text-red-600 mt-1">Strike reason: {b.adminNote}</p>}
                                    </div>
                                    {b.status === "confirmed" && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleMarkComplete(b.id)}
                                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors">
                                                <CheckCircle className="w-3.5 h-3.5" /> Complete
                                            </button>
                                            <button onClick={() => { setStrikeModal(b); setStrikeNote(""); }}
                                                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Strike
                                            </button>
                                            <button onClick={() => handleCancelBooking(b.id)}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                                                <X className="w-3.5 h-3.5" /> Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Facilities */}
            {tab === "facilities" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facilities.map((fac) => (
                        <div key={fac.id} className={`card p-5 border ${fac.active === false ? "border-gray-200 opacity-60" : "border-slate-200"}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-2xl">{fac.emoji || "🏛️"}</span>
                                    <h3 className="font-semibold text-slate-800 mt-1">{fac.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{fac.description}</p>
                                    <p className="text-xs text-slate-400 mt-1">⏰ {fac.openTime}–{fac.closeTime} · 👥 {fac.capacity}</p>
                                </div>
                                <button onClick={() => toggleFacility(fac)}
                                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors
                                        ${fac.active === false ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}>
                                    {fac.active === false ? "Enable" : "Disable"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Discipline strikes only */}
            {tab === "strikes" && (
                <div className="space-y-3">
                    {bookings.filter((b) => b.disciplineStrike).length === 0 ? (
                        <div className="bg-white rounded-xl border p-10 text-center">
                            <CheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">No discipline strikes issued</p>
                        </div>
                    ) : bookings.filter((b) => b.disciplineStrike).map((b) => (
                        <div key={b.id} className="card p-4 border border-red-200 bg-red-50/20">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800">{b.bookedByName} — {b.facilityName}</p>
                                    <p className="text-sm text-slate-500">📅 {b.date} · Apt {b.apartmentNumber}</p>
                                    <p className="text-xs text-red-600 mt-1">Reason: {b.adminNote}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Strike Modal */}
            <Modal open={!!strikeModal} onClose={() => setStrikeModal(null)} title="Issue Discipline Strike">
                {strikeModal && (
                    <div className="space-y-4">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
                            ⚠️ Issuing a strike to <strong>{strikeModal.bookedByName}</strong> for <strong>{strikeModal.facilityName}</strong> booking on {strikeModal.date}.
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                            <textarea
                                rows={3}
                                value={strikeNote}
                                onChange={(e) => setStrikeNote(e.target.value)}
                                placeholder="e.g. Facility not cleaned after use, no-show, noise complaint..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setStrikeModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleIssueStrike} disabled={saving}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60">
                                {saving ? "Issuing…" : "Issue Strike"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Facility Modal */}
            <Modal open={addFacModal} onClose={() => setAddFacModal(false)} title="Add New Facility">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Emoji</label>
                            <input value={facForm.emoji} onChange={(e) => setFacForm({ ...facForm, emoji: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                            <input value={facForm.name} onChange={(e) => setFacForm({ ...facForm, name: e.target.value })}
                                placeholder="e.g. Tennis Court"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <input value={facForm.description} onChange={(e) => setFacForm({ ...facForm, description: e.target.value })}
                            placeholder="Brief description..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                            <input type="number" value={facForm.capacity} onChange={(e) => setFacForm({ ...facForm, capacity: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Opens</label>
                            <input type="time" value={facForm.openTime} onChange={(e) => setFacForm({ ...facForm, openTime: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Closes</label>
                            <input type="time" value={facForm.closeTime} onChange={(e) => setFacForm({ ...facForm, closeTime: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setAddFacModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button onClick={handleAddFacility} disabled={saving}
                            className="px-4 py-2 rounded-xl text-white text-sm font-bold disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}>
                            {saving ? "Adding…" : "Add Facility"}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
