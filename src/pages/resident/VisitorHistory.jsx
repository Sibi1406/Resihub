import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { subscribeVisitors } from "../../services/visitorService";

export default function VisitorHistory() {
    const { userData } = useAuth();
    const [visitors, setVisitors] = useState([]);
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        if (!userData) return;
        const filters = { apartmentNumber: userData.apartmentNumber };
        const unsub = subscribeVisitors(filters, setVisitors);
        return unsub;
    }, [userData]);

    const filtered = dateFilter
        ? visitors.filter((v) => {
              const d = v.entryTime?.toDate?.() || v.createdAt?.toDate?.();
              return d && d.toISOString().slice(0, 10) === dateFilter;
          })
        : visitors;

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Visitor History</h1>
                    <p className="text-sm text-slate-500 mt-1">Past entries and exits for your apartment</p>
                </div>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-left text-xs text-slate-500">
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium">Entry Time</th>
                            <th className="px-5 py-3 font-medium">Exit Time</th>
                            <th className="px-5 py-3 font-medium">Duration</th>
                            <th className="px-5 py-3 font-medium">Purpose</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                                    No visitors yet.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((v) => {
                                const entry = v.entryTime?.toDate?.();
                                const exit = v.exitTime?.toDate?.();
                                let duration = "—";
                                if (entry && exit) {
                                    const diff = exit - entry;
                                    const hrs = Math.floor(diff / (1000 * 60 * 60));
                                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    duration = `${hrs}h ${mins}m`;
                                }
                                return (
                                    <tr key={v.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-700">{v.name}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">
                                            {entry?.toLocaleString() || "—"}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">
                                            {exit?.toLocaleString() || "—"}
                                        </td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{duration}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{v.purpose || "—"}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
