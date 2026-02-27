import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    collection, query, orderBy, getDocs, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { Download, Trash2, User, LogOut, FileText } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────
function formatDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function toCSV(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const lines = [
        headers.join(","),
        ...rows.map((r) =>
            headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
        ),
    ];
    return lines.join("\n");
}

function downloadCSV(filename, csv) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Log sources: fetch from all major collections ─────────────
const LOG_COLLECTIONS = [
    { id: "complaints", label: "Complaints" },
    { id: "visitors", label: "Visitors" },
    { id: "emergencies", label: "Emergencies" },
    { id: "payments", label: "Payments" },
];

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type }) {
    if (!msg) return null;
    return (
        <div className={`fixed bottom-6 right-4 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
            {msg}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────
export default function AdminProfilePage() {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [logMeta, setLogMeta] = useState([]); // store {id, collection} for deletion
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [toast, setToast] = useState(null);

    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }

    // ── Fetch all logs ────────────────────────────────────────
    useEffect(() => {
        fetchLogs();
    }, []);

    async function fetchLogs() {
        setLoading(true);
        try {
            const allLogs = [];
            const allMeta = [];

            for (const col of LOG_COLLECTIONS) {
                const snap = await getDocs(
                    query(collection(db, col.id), orderBy("createdAt", "desc"))
                        .catch(() => query(collection(db, col.id)))
                );
                snap.forEach((d) => {
                    const data = d.data();
                    allLogs.push({
                        Type: col.label,
                        ID: d.id,
                        Description: data.description || data.type || data.reason || data.name || "—",
                        Status: data.status || "—",
                        User: data.residentName || data.userName || data.reportedBy || "—",
                        Date: formatDate(data.createdAt || data.sentAt || data.date),
                    });
                    allMeta.push({ id: d.id, collection: col.id });
                });
            }

            setLogs(allLogs);
            setLogMeta(allMeta);
        } catch (err) {
            console.error("Log fetch error:", err);
            showToast("Failed to load logs", "error");
        } finally {
            setLoading(false);
        }
    }

    // ── Download Excel (CSV) ──────────────────────────────────
    function handleDownload() {
        if (!logs.length) { showToast("No logs to download", "error"); return; }
        const csv = toCSV(logs);
        const date = new Date().toISOString().slice(0, 10);
        downloadCSV(`resihub_logs_${date}.csv`, csv);
        showToast(`Downloaded ${logs.length} log entries as CSV`);
    }

    // ── Clear all logs ────────────────────────────────────────
    async function handleClearLogs() {
        if (!window.confirm(`Are you sure you want to permanently delete all ${logs.length} log entries? This cannot be undone.`)) return;
        setClearing(true);
        try {
            await Promise.all(
                logMeta.map(({ id, collection: col }) => deleteDoc(doc(db, col, id)))
            );
            setLogs([]);
            setLogMeta([]);
            showToast("All logs cleared successfully");
        } catch (err) {
            console.error("Clear logs error:", err);
            showToast("Failed to clear some logs", "error");
        } finally {
            setClearing(false);
        }
    }

    // ── Logout ────────────────────────────────────────────────
    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    const initials = userData?.name
        ? userData.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
        : "AD";

    return (
        <DashboardLayout>
            <Toast msg={toast?.msg} type={toast?.type} />

            {/* ── Page header ─────────────────────────────── */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Admin Profile</h1>
                <p className="text-sm text-slate-500 mt-2">Manage your account and system activity logs</p>
            </div>

            {/* ── Profile Card ─────────────────────────────── */}
            <div className="card p-6 max-w-2xl mb-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#E5B94B]/20 flex items-center justify-center text-xl font-bold text-[#7A4E0A] flex-shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-slate-800">{userData?.name || "Administrator"}</h2>
                        <p className="text-sm text-slate-500 mt-0.5">{userData?.email || "—"}</p>
                        <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E5B94B]/20 text-[#7A4E0A]">
                            Administrator
                        </span>
                    </div>
                    {/* Sign Out on profile page only */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* ── Log Management Card ──────────────────────── */}
            <div className="card p-6 max-w-2xl mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#C97B1A]" />
                        <h3 className="text-lg font-semibold text-slate-800">Activity Logs</h3>
                        {!loading && (
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                {logs.length} entries
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {/* Download Excel */}
                        <button
                            onClick={handleDownload}
                            disabled={loading || !logs.length}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
                            style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                        >
                            <Download className="w-4 h-4" />
                            Download Excel
                        </button>
                        {/* Clear Log */}
                        <button
                            onClick={handleClearLogs}
                            disabled={loading || clearing || !logs.length}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-40"
                        >
                            <Trash2 className="w-4 h-4" />
                            {clearing ? "Clearing…" : "Clear Log"}
                        </button>
                    </div>
                </div>

                {/* Log Table */}
                {loading ? (
                    <div className="text-center py-10 text-slate-400 text-sm">Loading logs…</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">No activity logs found.</div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.slice(0, 100).map((row, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E5B94B]/15 text-[#7A4E0A]">
                                                {row.Type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{row.Description}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.User}</td>
                                        <td className="px-4 py-3 text-slate-500">{row.Status}</td>
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{row.Date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length > 100 && (
                            <p className="text-xs text-center text-slate-400 py-2">Showing 100 of {logs.length} entries. Download for full log.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Info box */}
            <div className="card p-4 max-w-2xl bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-700">
                    💡 <strong>Download Excel</strong> exports all logs (complaints, visitors, emergencies, payments) as a CSV file.
                    <strong> Clear Log</strong> permanently removes these records from the database.
                </p>
            </div>
        </DashboardLayout>
    );
}
