import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { subscribeEmergencies, resolveEmergency } from "../../services/emergencyService";
import { AlertTriangle, RefreshCw, CheckCircle, Clock } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";

export default function AdminEmergenciesPage() {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const unsub = subscribeEmergencies((data) => {
            setEmergencies(data);
            setLoading(false);
        });
        return unsub;
    }, []);

    const handleResolve = async (id) => {
        setResolving(id);
        try {
            await resolveEmergency(id);
            toast.success("Emergency marked as resolved");
        } catch {
            toast.error("Failed to resolve emergency");
        } finally {
            setResolving(null);
        }
    };

    const filtered = filter === "all" ? emergencies : emergencies.filter((e) => e.status === filter);

    const formatDate = (ts) => {
        if (!ts) return "—";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    };

    const typeColors = {
        fire: "bg-red-50 text-red-700 border-red-200",
        medical: "bg-rose-50 text-rose-700 border-rose-200",
        security: "bg-orange-50 text-orange-700 border-orange-200",
        other: "bg-slate-50 text-slate-700 border-slate-200",
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Emergency Management</h1>
                <p className="text-slate-500 mt-1 text-sm">Monitor and resolve emergency situations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="card rounded-xl p-4 text-center border-l-4 border-red-400">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Active</p>
                    <p className="text-2xl font-bold text-red-600">{emergencies.filter((e) => e.status === "active").length}</p>
                </div>
                <div className="card rounded-xl p-4 text-center border-l-4 border-emerald-400">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-emerald-600">{emergencies.filter((e) => e.status === "resolved").length}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {loading ? (
                    <div className="card rounded-xl p-8 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading emergencies...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card rounded-xl p-8 text-center text-slate-400">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No emergencies found.</p>
                    </div>
                ) : (
                    filtered.map((e) => (
                        <div key={e.id} className={`card rounded-xl p-4 border-l-4 ${e.status === "active" ? "border-red-400" : "border-slate-200"} entry-up`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border capitalize ${typeColors[e.type] || typeColors.other}`}>
                                            {e.type || "Emergency"}
                                        </span>
                                        <StatusBadge status={e.status} />
                                    </div>
                                    <p className="font-semibold text-slate-800 text-sm">{e.description || "Emergency reported"}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                        <span>By: {e.raisedByName || "—"}</span>
                                        <span>•</span>
                                        <span>Apt {e.apartmentNumber || "—"}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(e.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                {e.status === "active" && (
                                    <button
                                        onClick={() => handleResolve(e.id)}
                                        disabled={resolving === e.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50 ml-3 flex-shrink-0"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Resolve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
