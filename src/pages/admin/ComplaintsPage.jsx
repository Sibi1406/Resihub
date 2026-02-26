import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { subscribeAllComplaints, updateComplaintStatus } from "../../services/complaintService";
import { FileText, RefreshCw, Search } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const unsub = subscribeAllComplaints((data) => {
            setComplaints(data);
            setLoading(false);
        });
        return unsub;
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        setUpdating(id);
        try {
            await updateComplaintStatus(id, newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const filtered = complaints.filter((c) => {
        const matchStatus = filter === "all" || c.status === filter;
        const matchSearch = !search ||
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.residentName?.toLowerCase().includes(search.toLowerCase()) ||
            c.apartmentNumber?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Complaints</h1>
                <p className="text-slate-500 mt-1 text-sm">Manage and resolve resident complaints</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Pending", status: "pending", color: "text-amber-600 border-amber-300" },
                    { label: "In Progress", status: "in-progress", color: "text-blue-600 border-blue-300" },
                    { label: "Resolved", status: "resolved", color: "text-emerald-600 border-emerald-300" },
                ].map(({ label, status, color }) => (
                    <div key={status} className={`card rounded-xl p-4 text-center border-l-4 cursor-pointer hover:shadow-md transition-all ${color}`}
                        onClick={() => setFilter(filter === status ? "all" : status)}>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color.split(" ")[0]}`}>
                            {complaints.filter((c) => c.status === status).length}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Table */}
            <div className="card rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading complaints...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No complaints found.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Resident</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Apt</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700 max-w-[200px] truncate">{c.title || "—"}</td>
                                    <td className="px-4 py-3 text-slate-600">{c.residentName || "—"}</td>
                                    <td className="px-4 py-3 text-slate-500">{c.apartmentNumber || "—"}</td>
                                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">
                                        {c.createdAt?.toDate
                                            ? c.createdAt.toDate().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={c.status}
                                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                            disabled={updating === c.id}
                                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40 disabled:opacity-50"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
}
