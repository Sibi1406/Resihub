import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { subscribeActiveVisitors } from "../services/visitorService";
import { subscribeActiveEmergencies } from "../services/emergencyService";
import { subscribeAnnouncements } from "../services/announcementService";

export default function SecurityDashboard() {
    const [activeVisitors, setActiveVisitors] = useState([]);
    const [emergencies, setEmergencies] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const unsubs = [
            subscribeActiveVisitors(setActiveVisitors),
            subscribeActiveEmergencies(setEmergencies),
            subscribeAnnouncements(setAnnouncements),
        ];
        return () => unsubs.forEach((u) => u());
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Security Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Gate & security overview</p>
            </div>

            {emergencies.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                    <span className="text-2xl">🚨</span>
                    <div>
                        <p className="font-semibold text-red-700">{emergencies.length} Active Emergency{emergencies.length > 1 ? "ies" : ""}</p>
                        <p className="text-sm text-red-600">{emergencies[0]?.type}: {emergencies[0]?.description}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard icon="🚪" label="Visitors Inside" value={activeVisitors.length} color="blue" />
                <StatCard icon="🚨" label="Active Emergencies" value={emergencies.length} color="red" />
                <StatCard icon="📢" label="Announcements" value={announcements.length} color="violet" />
            </div>

            {/* Active visitors list */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-700 mb-4">Currently Inside</h2>
                {activeVisitors.length === 0 ? (
                    <p className="text-sm text-slate-400">No visitors currently inside</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                                    <th className="pb-2 font-medium">Name</th>
                                    <th className="pb-2 font-medium">Phone</th>
                                    <th className="pb-2 font-medium">Apartment</th>
                                    <th className="pb-2 font-medium">Entry Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeVisitors.map((v) => (
                                    <tr key={v.id} className="border-b border-slate-50 last:border-0">
                                        <td className="py-2.5 font-medium text-slate-700">{v.name}</td>
                                        <td className="py-2.5 text-slate-500">{v.phone}</td>
                                        <td className="py-2.5 text-slate-500">{v.apartmentNumber}</td>
                                        <td className="py-2.5 text-slate-500">
                                            {v.entryTime?.toDate?.()?.toLocaleTimeString() || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
