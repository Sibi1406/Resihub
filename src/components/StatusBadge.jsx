// Status configuration: color, label, optional dot color
const STATUS_CONFIG = {
    // Complaints
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", label: "Pending" },
    "in-progress": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400", label: "In Progress" },
    resolved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", label: "Resolved" },
    // Emergency
    active: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Active" },
    // Visitors
    inside: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", label: "Inside" },
    preapproved: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400", label: "Informed" },
    informed: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400", label: "Informed" },
    exited: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", label: "Exited" },
    // Payments
    paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", label: "Paid" },
    unpaid: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-400", label: "Payment Due" },
    due: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-400", label: "Payment Due" },
    overdue: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Overdue" },
    // Generic
    open: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400", label: "Open" },
    closed: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", label: "Closed" },
};

const DEFAULT = { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", label: null };

/**
 * StatusBadge – displays a colored pill with optional animated pulse dot.
 * @param {string} status - status key
 * @param {boolean} pulse - if true, the dot animates (for "active" emergencies)
 * @param {string} size - "sm" | "md" (default md)
 */
export default function StatusBadge({ status, pulse = false, size = "md" }) {
    const cfg = STATUS_CONFIG[status] || DEFAULT;
    const label = cfg.label || status?.replace(/-/g, " ") || "Unknown";
    const shouldPulse = pulse || status === "active";

    const px = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${px} capitalize whitespace-nowrap`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${shouldPulse ? "animate-pulse" : ""}`}
            />
            {label}
        </span>
    );
}
