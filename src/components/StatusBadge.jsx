const statusStyles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-red-50 text-red-700 border-red-200",
    exited: "bg-slate-50 text-slate-600 border-slate-200",
    inside: "bg-emerald-50 text-emerald-700 border-emerald-200",
    preapproved: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function StatusBadge({ status }) {
    const style = statusStyles[status] || "bg-slate-50 text-slate-600 border-slate-200";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${style}`}>
            {status}
        </span>
    );
}
