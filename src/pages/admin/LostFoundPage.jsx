import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { subscribeAllLostFound, confirmMatch, closeItem } from "../../services/lostFoundService";
import { CheckCircle2, X, Sparkles, Package, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS = {
    open: "bg-yellow-50 text-yellow-700 border-yellow-200",
    matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function AdminLostFoundPage() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState("all");
    const [confirming, setConfirming] = useState(null);

    useEffect(() => subscribeAllLostFound(setItems), []);

    const lostItems = items.filter((i) => i.type === "lost" && i.status === "open");
    const foundItems = items.filter((i) => i.type === "found" && i.status === "open");
    const matchedItems = items.filter((i) => i.status === "matched");

    // Group AI suggestions: for each lost item with aiMatchSuggestion, find the found item
    const aiSuggestions = lostItems
        .filter((l) => l.aiMatchSuggestion)
        .map((l) => ({ lost: l, found: items.find((f) => f.id === l.aiMatchSuggestion) }))
        .filter((s) => s.found);

    const filtered = filter === "all" ? items
        : filter === "open" ? items.filter((i) => i.status === "open")
        : filter === "matched" ? matchedItems
        : items.filter((i) => i.status === "closed");

    const handleConfirmMatch = async (lostId, foundId) => {
        setConfirming(`${lostId}-${foundId}`);
        try {
            await confirmMatch(lostId, foundId);
            toast.success("Match confirmed! Both residents will see the update.");
        } catch {
            toast.error("Failed to confirm match");
        } finally {
            setConfirming(null);
        }
    };

    const handleClose = async (id) => {
        try {
            await closeItem(id);
            toast.success("Item closed/archived");
        } catch {
            toast.error("Failed to close item");
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lost & Found Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {lostItems.length} lost · {foundItems.length} found · {matchedItems.length} matched
                    </p>
                </div>
            </div>

            {/* AI Suggestions Panel */}
            {aiSuggestions.length > 0 && (
                <div className="mb-6 card p-5 border border-amber-200 bg-amber-50/30">
                    <h2 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> AI Match Suggestions ({aiSuggestions.length})
                    </h2>
                    <div className="space-y-3">
                        {aiSuggestions.map(({ lost, found }) => (
                            <div key={lost.id} className="bg-white rounded-xl border border-amber-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-red-500 font-semibold uppercase mb-1">Lost</p>
                                        <p className="text-sm font-medium text-slate-800">{lost.itemName}</p>
                                        <p className="text-xs text-slate-400">{lost.reportedByName} · Apt {lost.apartmentNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Found</p>
                                        <p className="text-sm font-medium text-slate-800">{found.itemName}</p>
                                        <p className="text-xs text-slate-400">{found.reportedByName} · Apt {found.apartmentNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                                        {Math.round((lost.aiMatchScore || 0) * 100)}% match
                                    </span>
                                    <button
                                        onClick={() => handleConfirmMatch(lost.id, found.id)}
                                        disabled={confirming === `${lost.id}-${found.id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {confirming === `${lost.id}-${found.id}` ? "Confirming…" : "Confirm Match"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
                {["all", "open", "matched", "closed"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize cursor-pointer
                            ${filter === f ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
                        style={filter === f ? { background: "linear-gradient(135deg, #E5B94B, #C97B1A)" } : {}}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Items list */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">No items found</p>
                    </div>
                ) : filtered.map((item) => (
                    <div key={item.id} className="card p-4 border border-slate-200">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${item.type === "lost" ? "bg-red-500" : "bg-emerald-500"}`}>
                                    {item.type === "lost" ? "L" : "F"}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-slate-800">{item.itemName}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_COLORS[item.status] || ""}`}>
                                            {item.status}
                                        </span>
                                        {item.aiMatchSuggestion && item.status === "open" && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> AI Match Pending
                                            </span>
                                        )}
                                    </div>
                                    {item.description && <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>}
                                    <p className="text-xs text-slate-400 mt-1">
                                        {item.reportedByName} · Apt {item.apartmentNumber} · {item.createdAt?.toDate?.()?.toLocaleDateString() || "—"}
                                    </p>
                                </div>
                            </div>
                            {item.status === "open" && (
                                <button onClick={() => handleClose(item.id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                                    <X className="w-3.5 h-3.5" /> Archive
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
