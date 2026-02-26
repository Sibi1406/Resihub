import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
    subscribeVisitors,
    addVisitor,
    markEntry,
    markExit,
} from "../../services/visitorService";
import toast from "react-hot-toast";

export default function VisitorsPage() {
    const { user, role, userData } = useAuth();
    const [visitors, setVisitors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [dateFilter, setDateFilter] = useState("");
    const [aptFilter, setAptFilter] = useState("");
    const [form, setForm] = useState({
        name: "",
        phone: "",
        apartmentNumber: "",
        type: role === "security" ? "manual" : "preapproved",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;
        const filters = {};
        if (role === "resident") {
            filters.apartmentNumber = userData?.apartmentNumber;
        }
        if (aptFilter) filters.apartmentNumber = aptFilter;
        const unsub = subscribeVisitors(filters, setVisitors);
        return unsub;
    }, [user, role, userData, aptFilter]);

    const filteredByDate = dateFilter
        ? visitors.filter((v) => {
            const d = v.entryTime?.toDate?.() || v.createdAt?.toDate?.();
            return d && d.toISOString().slice(0, 10) === dateFilter;
        })
        : visitors;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addVisitor({
                ...form,
                apartmentNumber: form.apartmentNumber || userData?.apartmentNumber || "",
                createdBy: user.uid,
                createdByName: userData?.name || "",
            });
            toast.success(form.type === "preapproved" ? "Visitor pre-approved" : "Visitor added");
            setShowModal(false);
            setForm({ name: "", phone: "", apartmentNumber: "", type: role === "security" ? "manual" : "preapproved" });
        } catch {
            toast.error("Failed to add visitor");
        }
        setSubmitting(false);
    };

    const handleEntry = async (id) => {
        try {
            await markEntry(id);
            toast.success("Visitor marked as entered");
        } catch {
            toast.error("Failed to mark entry");
        }
    };

    const handleExit = async (id) => {
        try {
            await markExit(id);
            toast.success("Visitor marked as exited");
        } catch {
            toast.error("Failed to mark exit");
        }
    };

    const activeCount = visitors.filter((v) => v.status === "inside").length;

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Visitors</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {activeCount} visitor{activeCount !== 1 ? "s" : ""} currently inside
                    </p>
                </div>
                {(role === "resident" || role === "security") && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
                    >
                        {role === "resident" ? "+ Pre-approve Visitor" : "+ Add Visitor"}
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {role !== "resident" && (
                    <input
                        type="text"
                        value={aptFilter}
                        onChange={(e) => setAptFilter(e.target.value)}
                        placeholder="Filter by apartment"
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                )}
                {(dateFilter || aptFilter) && (
                    <button
                        onClick={() => { setDateFilter(""); setAptFilter(""); }}
                        className="px-3 py-2 text-sm text-slate-500 hover:text-primary-600 cursor-pointer"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Visitors table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-left text-xs text-slate-500">
                                <th className="px-5 py-3 font-medium">Name</th>
                                <th className="px-5 py-3 font-medium">Phone</th>
                                <th className="px-5 py-3 font-medium">Apartment</th>
                                <th className="px-5 py-3 font-medium">Type</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Entry</th>
                                <th className="px-5 py-3 font-medium">Exit</th>
                                {role === "security" && <th className="px-5 py-3 font-medium">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredByDate.length === 0 ? (
                                <tr>
                                    <td colSpan={role === "security" ? 8 : 7} className="px-5 py-10 text-center text-slate-400">
                                        No visitors found
                                    </td>
                                </tr>
                            ) : (
                                filteredByDate.map((v) => (
                                    <tr key={v.id} className="border-t border-slate-50 hover:bg-slate-25">
                                        <td className="px-5 py-3 font-medium text-slate-700">{v.name}</td>
                                        <td className="px-5 py-3 text-slate-500">{v.phone}</td>
                                        <td className="px-5 py-3 text-slate-500">{v.apartmentNumber}</td>
                                        <td className="px-5 py-3 capitalize text-slate-500">{v.type}</td>
                                        <td className="px-5 py-3"><StatusBadge status={v.status} /></td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">
                                            {v.entryTime?.toDate?.()?.toLocaleString() || "—"}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">
                                            {v.exitTime?.toDate?.()?.toLocaleString() || "—"}
                                        </td>
                                        {role === "security" && (
                                            <td className="px-5 py-3">
                                                <div className="flex gap-1.5">
                                                    {v.status === "preapproved" && (
                                                        <button
                                                            onClick={() => handleEntry(v.id)}
                                                            className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                                                        >
                                                            Mark Entry
                                                        </button>
                                                    )}
                                                    {v.status === "inside" && (
                                                        <button
                                                            onClick={() => handleExit(v.id)}
                                                            className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                                                        >
                                                            Mark Exit
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add visitor modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title={role === "resident" ? "Pre-approve Visitor" : "Add Visitor"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Visitor Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Phone number"
                        />
                    </div>
                    {role === "security" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Apartment Number</label>
                            <input
                                required
                                value={form.apartmentNumber}
                                onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. A-102"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {submitting ? "Adding..." : role === "resident" ? "Pre-approve" : "Add Visitor"}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
