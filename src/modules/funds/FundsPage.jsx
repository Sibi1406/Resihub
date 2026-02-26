import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { subscribeFunds, addFundEntry, calculateSummary } from "../../services/fundService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import toast from "react-hot-toast";

export default function FundsPage() {
    const { user, role, userData } = useAuth();
    const [entries, setEntries] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ type: "income", amount: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [allEntries, setAllEntries] = useState([]);

    useEffect(() => {
        const unsub = subscribeFunds(selectedMonth, setEntries);
        return unsub;
    }, [selectedMonth]);

    // Subscribe to all entries for chart
    useEffect(() => {
        const unsub = subscribeFunds(null, setAllEntries);
        return unsub;
    }, []);

    const summary = calculateSummary(entries);

    // Build chart data from all entries grouped by month
    const chartData = (() => {
        const monthMap = {};
        allEntries.forEach((e) => {
            const m = e.month || "Unknown";
            if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0 };
            if (e.type === "income") monthMap[m].income += Number(e.amount) || 0;
            else monthMap[m].expense += Number(e.amount) || 0;
        });
        return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addFundEntry({
                ...form,
                amount: Number(form.amount),
                month: selectedMonth,
                createdBy: user.uid,
                createdByName: userData?.name || "",
            });
            toast.success(`${form.type === "income" ? "Income" : "Expense"} added`);
            setShowModal(false);
            setForm({ type: "income", amount: "", description: "" });
        } catch {
            toast.error("Failed to add entry");
        }
        setSubmitting(false);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Fund Transparency</h1>
                    <p className="text-sm text-slate-500 mt-1">Community financial overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {role === "admin" && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
                        >
                            + Add Entry
                        </button>
                    )}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                    <p className="text-sm font-medium text-emerald-600">This Month Income</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">₹{summary.income.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <p className="text-sm font-medium text-red-600">This Month Expense</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">₹{summary.expense.toLocaleString()}</p>
                </div>
                <div className={`${summary.balance >= 0 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"} border rounded-xl p-5`}>
                    <p className={`text-sm font-medium ${summary.balance >= 0 ? "text-blue-600" : "text-amber-600"}`}>Remaining Balance</p>
                    <p className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? "text-blue-700" : "text-amber-700"}`}>
                        ₹{summary.balance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
                    <h2 className="text-base font-semibold text-slate-700 mb-4">Monthly Overview</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
                            <YAxis fontSize={12} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                            />
                            <Legend />
                            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Entries list */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-700">Entries for {selectedMonth}</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-left text-xs text-slate-500">
                                <th className="px-5 py-3 font-medium">Type</th>
                                <th className="px-5 py-3 font-medium">Description</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Added By</th>
                                <th className="px-5 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-slate-400">No entries for this month</td>
                                </tr>
                            ) : (
                                entries.map((e) => (
                                    <tr key={e.id} className="border-t border-slate-50">
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${e.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                                {e.type === "income" ? "↑ Income" : "↓ Expense"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">{e.description}</td>
                                        <td className="px-5 py-3 font-semibold text-slate-800">₹{Number(e.amount).toLocaleString()}</td>
                                        <td className="px-5 py-3 text-slate-500">{e.createdByName || "Admin"}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{e.createdAt?.toDate?.()?.toLocaleDateString() || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add entry modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Fund Entry">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                        <input
                            required
                            type="number"
                            min="1"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g. 50000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <input
                            required
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g. Maintenance collection, Plumbing repair"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {submitting ? "Adding..." : "Add Entry"}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
