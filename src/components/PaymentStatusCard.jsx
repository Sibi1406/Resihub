import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Clock, ChevronRight, Banknote } from "lucide-react";

export default function PaymentStatusCard({ payment, loading, month, onClick }) {
    const isPaid = payment?.status === "paid";

    // Format month display
    const formatMonth = (m) => {
        if (!m) return "Current Month";
        const [y, mo] = m.split("-");
        return new Date(+y, +mo - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    };

    const dueDate = payment?.dueDate || (month ? `${month}-05` : "5th");
    const amount = payment?.amount ?? 2500;

    if (loading) {
        return (
            <div className="card rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-2/5" />
                        <div className="h-6 bg-slate-100 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -3, boxShadow: isPaid ? "0 12px 32px rgba(4,120,87,0.12)" : "0 12px 32px rgba(161,98,7,0.12)" }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className={`card rounded-2xl p-5 cursor-pointer border-l-4 ${isPaid ? "border-emerald-400" : "border-yellow-400"
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Icon pill */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isPaid ? "bg-emerald-50" : "bg-yellow-50"
                    }`}>
                    {isPaid
                        ? <CheckCircle className="w-7 h-7 text-emerald-500" />
                        : <AlertTriangle className="w-7 h-7 text-yellow-500" />
                    }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                        Maintenance Payment · {formatMonth(month)}
                    </p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-2xl font-bold ${isPaid ? "text-emerald-600" : "text-yellow-600"}`}>
                            {isPaid ? "✓ Paid" : "Payment Due"}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">₹{amount.toLocaleString()}</span>
                    </div>
                    <p className={`text-xs mt-1 flex items-center gap-1 ${isPaid ? "text-slate-400" : "text-yellow-700 font-medium"}`}>
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {isPaid
                            ? `Paid on ${payment.paidAt?.toDate
                                ? payment.paidAt.toDate().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                : "this month"}`
                            : `Due by ${dueDate} · Contact admin to pay`
                        }
                    </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </div>

            {/* Progress bar (for due state) */}
            {!isPaid && (
                <div className="mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                        <span>Payment status</span>
                        <span className="font-semibold text-yellow-600">OVERDUE</span>
                    </div>
                    <div className="h-1.5 bg-yellow-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-yellow-400 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
