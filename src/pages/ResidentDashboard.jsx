import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { subscribeComplaints } from "../services/complaintService";
import { subscribeVisitors } from "../services/visitorService";
import { subscribeActiveEmergencies } from "../services/emergencyService";
import { subscribeFunds, calculateSummary } from "../services/fundService";
import { subscribeAnnouncements } from "../services/announcementService";

export default function ResidentDashboard() {
    const { user, userData } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [emergencies, setEmergencies] = useState([]);
    const [fundSummary, setFundSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        if (!user) return;
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const unsubs = [
            subscribeComplaints({ raisedBy: user.uid }, setComplaints),
            subscribeVisitors({ apartmentNumber: userData?.apartmentNumber }, setVisitors),
            subscribeActiveEmergencies(setEmergencies),
            subscribeFunds(month, (entries) => setFundSummary(calculateSummary(entries))),
            subscribeAnnouncements(setAnnouncements),
        ];
        return () => unsubs.forEach((u) => u());
    }, [user, userData]);

    const activeComplaints = complaints.filter((c) => c.status !== "resolved").length;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Welcome, {userData?.name || "Resident"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {userData?.apartmentNumber && `Apartment ${userData.apartmentNumber} • `}Your community at a glance
                </p>
            </div>

            {emergencies.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                        <p className="font-semibold text-red-700">{emergencies.length} Active Emergency{emergencies.length > 1 ? "ies" : ""}</p>
                        <p className="text-sm text-red-600">{emergencies[0]?.type}: {emergencies[0]?.description}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon="🛠️" label="My Active Complaints" value={activeComplaints} color="amber" />
                <StatCard icon="🚪" label="My Visitors" value={visitors.filter(v => v.status === "inside").length} color="blue" />
                <StatCard
                    icon="💰"
                    label="Month Balance"
                    value={`₹${fundSummary.balance.toLocaleString()}`}
                    color={fundSummary.balance >= 0 ? "emerald" : "red"}
                />
                <StatCard icon="🚨" label="Active Emergencies" value={emergencies.length} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-base font-semibold text-slate-700 mb-4">My Complaints</h2>
                    {complaints.length === 0 ? (
                        <p className="text-sm text-slate-400">No complaints raised yet</p>
                    ) : (
                        <div className="space-y-3">
                            {complaints.slice(0, 5).map((c) => (
                                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{c.title}</p>
                                        <p className="text-xs text-slate-400">{c.category}</p>
                                    </div>
                                    <StatusBadge status={c.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-base font-semibold text-slate-700 mb-4">Latest Announcements</h2>
                    {announcements.length === 0 ? (
                        <p className="text-sm text-slate-400">No announcements yet</p>
                    ) : (
                        <div className="space-y-3">
                            {announcements.slice(0, 5).map((a) => (
                                <div key={a.id} className="py-2 border-b border-slate-50 last:border-0">
                                    <p className="text-sm font-medium text-slate-700">{a.title}</p>
                                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{a.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
