import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { addLostFoundItem, subscribeAllLostFound } from "../../services/lostFoundService";
import { findAIMatches, saveAISuggestions } from "../../services/aiMatchingService";
import { Plus, Package, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SecurityLostFoundPage() {
    const { user, userData } = useAuth();
    const [form, setForm] = useState({ itemName: "", description: "", location: "" });
    const [submitting, setSubmitting] = useState(false);
    const [recentFound, setRecentFound] = useState([]);

    useEffect(() => {
        return subscribeAllLostFound((items) => {
            setRecentFound(items.filter((i) => i.type === "found").slice(0, 10));
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.itemName.trim()) { toast.error("Enter item name"); return; }
        setSubmitting(true);
        try {
            const allItems = recentFound;
            const docRef = await addLostFoundItem({
                type: "found",
                itemName: form.itemName.trim(),
                description: `${form.description.trim()}${form.location ? ` (Found at: ${form.location.trim()})` : ""}`,
                reportedBy: user.uid,
                reportedByName: userData?.name || "Security",
                apartmentNumber: "Security",
            });

            // AI matching
            const lostCandidates = allItems.filter((i) => i.type === "lost" && i.status === "open");
            if (lostCandidates.length > 0) {
                const aiMatches = await findAIMatches(
                    { type: "found", itemName: form.itemName, description: form.description },
                    lostCandidates
                );
                if (aiMatches.length > 0) {
                    await saveAISuggestions(docRef.id, aiMatches);
                    toast.success(`✨ Possible match found! Admin has been flagged for review.`);
                }
            }

            toast.success("Found item logged successfully");
            setForm({ itemName: "", description: "", location: "" });
        } catch {
            toast.error("Failed to log item");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Log Found Item</h1>
                <p className="text-sm text-slate-500 mt-1">Log items found on the premises — AI will attempt to match with lost reports</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="card p-6">
                    <h2 className="text-base font-semibold text-slate-700 mb-4">Report Found Item</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
                            <input
                                required
                                value={form.itemName}
                                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                                placeholder="e.g. Black wallet, Bunch of keys, Parcel..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the item: color, condition, contents, etc."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location Found</label>
                            <input
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                placeholder="e.g. Main gate, Lobby, Parking B2..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                        >
                            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Plus className="w-4 h-4" /> Log Found Item</>}
                        </button>
                    </form>
                </div>

                {/* Recent found items */}
                <div className="card p-6">
                    <h2 className="text-base font-semibold text-slate-700 mb-4">Recent Found Items</h2>
                    <div className="space-y-2">
                        {recentFound.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">No found items logged yet</p>
                            </div>
                        ) : recentFound.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">F</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{item.itemName}</p>
                                    <p className="text-xs text-slate-400">{item.createdAt?.toDate?.()?.toLocaleDateString() || "—"} · {item.reportedByName}</p>
                                </div>
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0
                                    ${item.status === "matched" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-50 text-yellow-700"}`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
