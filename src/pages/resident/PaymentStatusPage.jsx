import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
    subscribePaymentStatus, subscribeUserPayments,
    getCurrentMonth, getDueDate, markPaymentPaid
} from "../../services/paymentService";
import { CheckCircle, AlertTriangle, Clock, CreditCard, X, Smartphone, Building2, Wallet } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";

// ── Payment Method Modal ──────────────────────────────────────
const METHODS = [
    { id: "upi", label: "UPI", icon: <Smartphone className="w-5 h-5" />, desc: "GPay, PhonePe, Paytm" },
    { id: "netbanking", label: "Net Banking", icon: <Building2 className="w-5 h-5" />, desc: "All major banks" },
    { id: "wallet", label: "Wallet", icon: <Wallet className="w-5 h-5" />, desc: "Paytm, Mobikwik" },
    { id: "card", label: "Debit / Credit Card", icon: <CreditCard className="w-5 h-5" />, desc: "Visa, Mastercard, Rupay" },
];

function PayModal({ open, onClose, amount, onSuccess }) {
    const [method, setMethod] = useState("upi");
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState("select"); // select | processing | success

    if (!open) return null;

    const handlePay = async () => {
        setStep("processing");
        setProcessing(true);
        // Simulate payment processing (2s)
        await new Promise(r => setTimeout(r, 2000));
        try {
            await onSuccess(method);
            setStep("success");
        } catch {
            toast.error("Payment failed. Please try again.");
            setStep("select");
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setStep("select");
        setMethod("upi");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

                {/* Success Screen */}
                {step === "success" && (
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4 animate-bounce">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-1">Payment Successful!</h2>
                        <p className="text-slate-500 text-sm mb-1">₹{amount?.toLocaleString()} paid via {METHODS.find(m => m.id === method)?.label}</p>
                        <p className="text-xs text-slate-400 mb-6">Your maintenance is cleared for this month ✓</p>
                        <div className="w-full p-4 rounded-xl bg-emerald-50 border border-emerald-100 mb-6 text-left">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Amount Paid</span>
                                <span className="font-bold text-emerald-700">₹{amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Payment Method</span>
                                <span className="font-semibold text-slate-700">{METHODS.find(m => m.id === method)?.label}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Status</span>
                                <span className="font-bold text-emerald-600">✓ Confirmed</span>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full py-3 text-white font-bold rounded-xl"
                            style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* Processing Screen */}
                {step === "processing" && (
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mb-2">Processing Payment…</h2>
                        <p className="text-sm text-slate-500">Please do not close this window</p>
                    </div>
                )}

                {/* Select Method Screen */}
                {step === "select" && (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4" style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}>
                            <div>
                                <p className="text-white font-bold text-base">Pay Maintenance</p>
                                <p className="text-white/80 text-xs mt-0.5">₹{amount?.toLocaleString()} due</p>
                            </div>
                            <button onClick={handleClose} className="text-white/80 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Select Payment Method</p>
                            <div className="space-y-2">
                                {METHODS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMethod(m.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                                        style={{
                                            borderColor: method === m.id ? "#E5B94B" : "#E2E8F0",
                                            background: method === m.id ? "#FFFBEB" : "white",
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: method === m.id ? "#FEF3C7" : "#F8FAFC", color: method === m.id ? "#C97B1A" : "#94A3B8" }}>
                                            {m.icon}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-slate-800">{m.label}</div>
                                            <div className="text-xs text-slate-400">{m.desc}</div>
                                        </div>
                                        {method === m.id && (
                                            <CheckCircle className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: "#E5B94B" }} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Maintenance Fee</span>
                                    <span className="font-bold text-slate-800">₹{amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Processing fee</span>
                                    <span className="text-emerald-600 font-medium">FREE</span>
                                </div>
                                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-sm font-bold">
                                    <span className="text-slate-700">Total</span>
                                    <span style={{ color: "#C97B1A" }}>₹{amount?.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePay}
                                className="w-full py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                                style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                            >
                                Pay ₹{amount?.toLocaleString()} Now →
                            </button>
                            <p className="text-center text-xs text-slate-400">🔒 Secured by ResiHub Payment Gateway</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function PaymentStatusPage() {
    const { user, userData } = useAuth();
    const [currentPayment, setCurrentPayment] = useState(null);
    const [allPayments, setAllPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payModal, setPayModal] = useState(false);
    const currentMonth = getCurrentMonth();

    useEffect(() => {
        if (!user) return;
        const unsubs = [];
        unsubs.push(subscribePaymentStatus(user.uid, currentMonth, (payment) => {
            setCurrentPayment(payment);
            setLoading(false);
        }));
        unsubs.push(subscribeUserPayments(user.uid, (payments) => {
            setAllPayments(payments);
        }));
        return () => unsubs.forEach((u) => u());
    }, [user, currentMonth]);

    const isPaid = currentPayment?.status === "paid";
    const dueDate = getDueDate(currentMonth);
    const amount = currentPayment?.amount || 2500;

    const monthLabel = (m) => {
        const [y, mo] = m.split("-");
        return new Date(y, mo - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    };

    const handlePaymentSuccess = async (method) => {
        await markPaymentPaid(
            user.uid,
            currentMonth,
            amount,
            userData?.name || "",
            userData?.apartmentNumber || ""
        );
        toast.success("🎉 Payment successful! Receipt saved.");
    };

    return (
        <DashboardLayout>
            <PayModal
                open={payModal}
                onClose={() => setPayModal(false)}
                amount={amount}
                onSuccess={handlePaymentSuccess}
            />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Maintenance Payments</h1>
                    <p className="text-slate-500 mt-1 text-sm">Track your monthly maintenance dues and payment history</p>
                </div>

                {/* Current Month Card */}
                <div className={`card rounded-2xl p-6 mb-6 border-l-4 ${isPaid ? "border-emerald-400" : "border-yellow-400"}`}>
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
                                                ? currentPayment.paidAt.toDate().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                : "this month"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                                    <div>
                                        <p className="text-2xl font-bold text-yellow-600">Payment Due ⚠️</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Due by {dueDate} · Contact admin to pay</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">Amount</p>
                            <p className="text-2xl font-bold text-slate-800">₹{amount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Pay Now button — only when unpaid */}
                    {!isPaid && !loading && (
                        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-yellow-700 flex-1">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>Clear your dues for this month before <strong>{dueDate}</strong></span>
                            </div>
                            <button
                                onClick={() => setPayModal(true)}
                                className="flex items-center gap-2 px-6 py-2.5 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm whitespace-nowrap"
                                style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                            >
                                <CreditCard className="w-4 h-4" />
                                Pay Now
                            </button>
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
                <div>
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
