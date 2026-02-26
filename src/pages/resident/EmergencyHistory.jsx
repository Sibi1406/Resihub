import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { subscribeEmergencies } from "../../services/emergencyService";

export default function EmergencyHistory() {
    const { user } = useAuth();
    const [emergencies, setEmergencies] = useState([]);

    useEffect(() => {
        const unsub = subscribeEmergencies((list) => {
            // only keep resolved emergencies raised by this user
            const filtered = list.filter((e) => e.status === "resolved" && e.raisedBy === user?.uid);
            setEmergencies(filtered);
        });
        return unsub;
    }, [user]);

    const total = emergencies.length;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Emergency History</h1>
                <p className="text-sm text-slate-500 mt-1">Past emergencies you've raised</p>
            </div>

            <div className="mb-6">
                <div className="inline-flex items-center gap-4">
                    <div>Total resolved: <span className="font-semibold">{total}</span></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-left text-xs text-slate-500">
                            <th className="px-5 py-3 font-medium">Type</th>
                            <th className="px-5 py-3 font-medium">Description</th>
                            <th className="px-5 py-3 font-medium">Raised</th>
                            <th className="px-5 py-3 font-medium">Resolved</th>
                            <th className="px-5 py-3 font-medium">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emergencies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                                    No emergencies in history.
                                </td>
                            </tr>
                        ) : (
                            emergencies.map((e) => {
                                const created = e.createdAt?.toDate?.();
                                const resolved = e.resolvedAt?.toDate?.();
                                let duration = "—";
                                if (created && resolved) {
                                    const diff = resolved - created;
                                    const hrs = Math.floor(diff / (1000 * 60 * 60));
                                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    duration = `${hrs}h ${mins}m`;
                                }
                                return (
                                    <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3 capitalize text-slate-700">{e.type}</td>
                                        <td className="px-5 py-3 text-slate-500">{e.description}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{created?.toLocaleString() || "—"}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{resolved?.toLocaleString() || "—"}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{duration}</td>
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
