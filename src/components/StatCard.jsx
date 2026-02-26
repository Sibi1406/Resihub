export default function StatCard({ icon, label, value, color = "primary", subtext }) {
    const colors = {
        primary: "bg-primary-50 text-primary-600 border-primary-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        red: "bg-red-50 text-red-600 border-red-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100",
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${colors[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
