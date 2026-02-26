import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { subscribeAllPayments, markPaymentPaid, getCurrentMonth } from "../../services/paymentService";
import { CreditCard, CheckCircle, AlertTriangle, Filter, RefreshCw } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        setLoading(true);
        const unsub = subscribeAllPayments(selectedMonth, (data) => {
            setPayments(data);
            setLoading(false);
        });
        return unsub;
    }, [selectedMonth]);

    const handleMarkPaid = async (payment) => {
        if (processing) return;
        setProcessing(payment.userId + payment.month);
        try {
            await markPaymentPaid(payment.userId, payment.month, payment.amount, payment.residentName, payment.apartmentNumber);
            toast.success(`Marked ${payment.residentName || "resident"} as paid`);
        } catch (e) {
            toast.error("Failed to update payment");
        } finally {
            setProcessing(null);
        }
    };

    const monthLabel = (m) => {
        const [y, mo] = m.split("-");
        return new Date(y, mo - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    };

    const paidCount = payments.filter((p) => p.status === "paid").length;
    const dueCount = payments.length - paidCount;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Maintenance Payments</h1>
                <p className="text-slate-500 mt-1 text-sm">Manage and track resident payment status</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-800">{payments.length}</p>
                </div>
                <div className="card rounded-xl p-4 text-center border-l-4 border-emerald-400">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Paid</p>
                    <p className="text-2xl font-bold text-emerald-600">{paidCount}</p>
                </div>
                <div className="card rounded-xl p-4 text-center border-l-4 border-yellow-400">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Due</p>
                    <p className="text-2xl font-bold text-yellow-600">{dueCount}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                >
                    {Array.from({ length: 6 }, (_, i) => {
                        const d = new Date();
                        d.setMonth(d.getMonth() - i);
                        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                        return <option key={val} value={val}>{monthLabel(val)}</option>;
                    })}
                </select>
                <span className="text-sm text-slate-500">Showing: {monthLabel(selectedMonth)}</span>
            </div>

            {/* Table */}
            <div className="card rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading payments...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No payment records for this month.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Resident</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Apartment</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-700">
                                        {payment.residentName || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {payment.apartmentNumber || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 font-semibold">
                                        ₹{(payment.amount || 2500).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={payment.status || "due"} />
                                    </td>
                                    <td className="px-4 py-3">
                                        {payment.status !== "paid" ? (
                                            <button
                                                onClick={() => handleMarkPaid(payment)}
                                                disabled={processing === payment.userId + payment.month}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Mark Paid
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                                {payment.paidAt?.toDate
                                                    ? payment.paidAt.toDate().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                                                    : "Paid"}
                                            </span>
                                        )}
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
