/**
 * Skeleton loading components for ResiHub
 */

export function SkeletonCard() {
    return (
        <div className="card rounded-xl p-5 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
                    <div className="h-8 bg-slate-100 rounded w-1/3 mb-2" />
                    <div className="h-2 bg-slate-100 rounded w-2/3" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100" />
            </div>
        </div>
    );
}

export function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 p-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0" />
            <div className="flex-1">
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-2 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="h-5 bg-slate-100 rounded-full w-16" />
        </div>
    );
}

export function SkeletonTable({ rows = 4 }) {
    return (
        <div className="card rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                <div className="flex gap-4">
                    {[40, 20, 15, 15, 10].map((w, i) => (
                        <div key={i} className={`h-3 bg-slate-200 rounded`} style={{ width: `${w}%` }} />
                    ))}
                </div>
            </div>
            <div className="divide-y divide-slate-50">
                {Array.from({ length: rows }).map((_, i) => (
                    <SkeletonRow key={i} />
                ))}
            </div>
        </div>
    );
}

export function SkeletonText({ lines = 3, className = "" }) {
    return (
        <div className={`space-y-2 animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-3 bg-slate-100 rounded"
                    style={{ width: i === lines - 1 ? "60%" : "100%" }}
                />
            ))}
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="animate-pulse">
            <div className="mb-8">
                <div className="h-8 bg-slate-100 rounded w-64 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-48" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
            <SkeletonTable rows={5} />
        </div>
    );
}
