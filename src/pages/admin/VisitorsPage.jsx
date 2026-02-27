import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { subscribeVisitors, subscribeActiveVisitors } from "../../services/visitorService";
import { Users, Search, RefreshCw } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

export default function AdminVisitorsPage() {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const unsub = subscribeVisitors(filter !== "all" ? { status: filter } : {}, (data) => {
            setVisitors(data);
            setLoading(false);
        });
        return unsub;
    }, [filter]);

    const filtered = visitors.filter((v) => {
        return !search ||
            v.visitorName?.toLowerCase().includes(search.toLowerCase()) ||
            v.apartmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
            v.residentName?.toLowerCase().includes(search.toLowerCase());
    });

    const formatTime = (ts) => {
        if (!ts) return "—";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Visitors</h1>
                <p className="text-slate-500 mt-1 text-sm">View all visitor logs and access records</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Inside", status: "inside", color: "border-emerald-400 text-emerald-600" },
                    { label: "Informed", status: "informed", color: "border-violet-400 text-violet-600" },
                    { label: "Exited", status: "exited", color: "border-slate-300 text-slate-600" },
                ].map(({ label, status, color }) => (
                    <div key={status} className={`card rounded-xl p-4 text-center border-l-4 cursor-pointer hover:shadow-md transition-all ${color}`}
                        onClick={() => setFilter(filter === status ? "all" : status)}>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>
                            {visitors.filter((v) => v.status === status).length}
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
                        placeholder="Search visitors..."
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
                    <option value="inside">Inside</option>
                    <option value="informed">Informed</option>
                    <option value="exited">Exited</option>
                </select>
            </div>

            {/* Table */}
            <div className="card rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading visitors...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No visitor records found.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Visitor</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Visiting</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Apt</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Entry</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Exit</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">{v.visitorName || "—"}</td>
                                    <td className="px-4 py-3 text-slate-600">{v.residentName || "—"}</td>
                                    <td className="px-4 py-3 text-slate-500">{v.apartmentNumber || "—"}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatTime(v.entryTime)}</td>
                                    <td className="px-4 py-3 text-slate-500">{formatTime(v.exitTime)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
}
