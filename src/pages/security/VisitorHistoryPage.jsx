import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { subscribeVisitors } from '../../services/visitorService';
import { Download, Trash2, History, AlertTriangle } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function VisitorHistoryPage() {
    const [history, setHistory] = useState([]);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        const unsub = subscribeVisitors({ status: 'exited' }, setHistory);
        return () => unsub();
    }, []);

    const handleDownload = () => {
        if (history.length === 0) return;

        const headers = ["Visitor Name", "Apartment", "Phone", "Entry Time", "Exit Time", "Purpose"];
        const rows = history.map(h => [
            h.visitorName || h.name || "—",
            h.apartmentNumber || "—",
            h.phone || "—",
            h.entryTime?.seconds ? new Date(h.entryTime.seconds * 1000).toLocaleString() : "—",
            h.exitTime?.seconds ? new Date(h.exitTime.seconds * 1000).toLocaleString() : "—",
            h.purpose || "—"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Visitor_History_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearLog = async () => {
        if (!window.confirm("Are you sure you want to PERMANENTLY clear all visitor history logs? This action cannot be undone.")) return;

        setClearing(true);
        try {
            const q = query(collection(db, "visitors"), where("status", "==", "exited"));
            const snap = await getDocs(q);

            if (snap.empty) {
                toast.error("No logs to clear");
                return;
            }

            const batch = writeBatch(db);
            snap.docs.forEach((d) => {
                batch.delete(d.ref);
            });
            await batch.commit();

            toast.success(`Successfully cleared ${snap.size} history records`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to clear logs");
        } finally {
            setClearing(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Visitor History</h1>
                    <p className="text-sm text-slate-500 mt-1">Log of past visitor entries and exits</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={history.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" /> Download CSV
                    </button>
                    <button
                        onClick={handleClearLog}
                        disabled={history.length === 0 || clearing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" /> {clearing ? "Clearing..." : "Clear Logs"}
                    </button>
                </div>
            </div>

            <div className="card p-5">
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No visitor history available</p>
                        <p className="text-xs text-slate-400 mt-1">Logs will appear here after visitors exit the premises</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b">
                                    <th className="py-3 px-2 font-semibold uppercase tracking-wider">Visitor Name</th>
                                    <th className="py-3 px-2 font-semibold uppercase tracking-wider">Apartment</th>
                                    <th className="py-3 px-2 font-semibold uppercase tracking-wider">Entry Time</th>
                                    <th className="py-3 px-2 font-semibold uppercase tracking-wider">Exit Time</th>
                                    <th className="py-3 px-2 font-semibold uppercase tracking-wider">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {history.map(h => (
                                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-2 font-medium text-slate-800">{h.visitorName || h.name || "—"}</td>
                                        <td className="py-3 px-2 text-slate-600">{h.apartmentNumber}</td>
                                        <td className="py-3 px-2 text-xs text-slate-500 font-mono">
                                            {h.entryTime?.seconds ? new Date(h.entryTime.seconds * 1000).toLocaleString("en-IN") : '—'}
                                        </td>
                                        <td className="py-3 px-2 text-xs text-slate-500 font-mono">
                                            {h.exitTime?.seconds ? new Date(h.exitTime.seconds * 1000).toLocaleString("en-IN") : '—'}
                                        </td>
                                        <td className="py-3 px-2">
                                            {h.entryTime?.seconds && h.exitTime?.seconds ? (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                                                    {Math.max(0, Math.floor((h.exitTime.seconds * 1000 - h.entryTime.seconds * 1000) / 60000))} min
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Warning Note */}
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800">
                    <strong>Notice:</strong> Clearing logs is a permanent action. It is recommended to download the CSV report before clearing logs for archival purposes.
                </p>
            </div>
        </DashboardLayout>
    );
}
