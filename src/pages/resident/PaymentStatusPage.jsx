import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { subscribePaymentStatus, subscribeUserPayments, getCurrentMonth, getDueDate } from "../../services/paymentService";
import { CheckCircle, AlertTriangle, Clock, CreditCard, ChevronRight } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

export default function PaymentStatusPage() {
    const { user, userData } = useAuth();
    const [currentPayment, setCurrentPayment] = useState(null);
    const [allPayments, setAllPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentMonth = getCurrentMonth();

    useEffect(() => {
        if (!user) return;
        const unsubs = [];

        unsubs.push(
            subscribePaymentStatus(user.uid, currentMonth, (payment) => {
                setCurrentPayment(payment);
                setLoading(false);
            })
        );

        unsubs.push(
            subscribeUserPayments(user.uid, (payments) => {
                setAllPayments(payments);
            })
        );

        return () => unsubs.forEach((u) => u());
    }, [user, currentMonth]);

    const isPaid = currentPayment?.status === "paid";
    const dueDate = getDueDate(currentMonth);

    const monthLabel = (m) => {
        const [y, mo] = m.split("-");
        return new Date(y, mo - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Maintenance Payments</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Track your monthly maintenance dues and payment history
                    </p>
                </div>

                {/* Current Month Status */}
                <div className={`card rounded-2xl p-6 mb-6 border-l-4 ${isPaid ? "border-emerald-400" : "border-yellow-400"} animate-fadeInUp`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Current Month — {monthLabel(currentMonth)}
                            </p>
                            {loading ? (
                                <div className="h-8 bg-slate-100 rounded w-32 animate-pulse" />
                            ) : isPaid ? (
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    <div>
                                        <p className="text-2xl font-bold text-emerald-600">Paid ✓</p>
                                        <p className="text-sm text-slate-500 mt-0.5">
                                            Paid on{" "}
                                            {currentPayment.paidAt?.toDate
                                                ? currentPayment.paidAt.toDate().toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "this month"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                                    <div>
                                        <p className="text-2xl font-bold text-yellow-600">Payment Due ⚠️</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Due by {dueDate}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={`text-right ${loading ? "animate-pulse" : ""}`}>
                            <p className="text-xs text-slate-400 mb-1">Amount</p>
                            <p className="text-2xl font-bold text-slate-800">
                                ₹{(currentPayment?.amount || 2500).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {!isPaid && !loading && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                            <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Please contact the management office or pay at the reception to clear your dues.
                            </p>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-sm text-slate-500">
                        <CreditCard className="w-4 h-4" />
                        <span>Apartment {userData?.apartmentNumber || "—"}</span>
                        <span>•</span>
                        <span>{userData?.name || "Resident"}</span>
                    </div>
                </div>

                {/* Payment History */}
                <div className="animate-fadeInUp delay-200">
                    <h2 className="text-base font-semibold text-slate-700 mb-3">Payment History</h2>
                    {allPayments.length === 0 ? (
                        <div className="card rounded-xl p-8 text-center text-slate-400">
                            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No payment records found.</p>
                        </div>
                    ) : (
                        <div className="card rounded-xl divide-y divide-slate-50">
                            {allPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{monthLabel(payment.month)}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {payment.status === "paid" && payment.paidAt?.toDate
                                                ? `Paid on ${payment.paidAt.toDate().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
                                                : `Due: ${getDueDate(payment.month)}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-slate-700">
                                            ₹{(payment.amount || 2500).toLocaleString()}
                                        </span>
                                        <StatusBadge status={payment.status || "due"} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
