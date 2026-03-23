import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import {
    subscribeMyLostFound, subscribeOpenItems,
    addLostFoundItem, closeItem
} from "../../services/lostFoundService";
import { findAIMatches, saveAISuggestions } from "../../services/aiMatchingService";
import { Search, Plus, Package, CheckCircle2, Sparkles, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

const TABS = ["Report Lost", "Report Found", "My Items", "Matches"];
const STATUS_COLORS = {
    open: "bg-yellow-50 text-yellow-700 border-yellow-200",
    matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function ResidentLostFoundPage() {
    const { user, userData } = useAuth();
    const [tab, setTab] = useState(0);
    const [myItems, setMyItems] = useState([]);
    const [openItems, setOpenItems] = useState([]);
    const [form, setForm] = useState({ itemName: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [aiRunning, setAiRunning] = useState(false);
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        if (!user) return;
        const u1 = subscribeMyLostFound(user.uid, setMyItems);
        const u2 = subscribeOpenItems(setOpenItems);
        return () => { u1(); u2(); };
    }, [user]);

    const matchedItems = myItems.filter((i) => i.status === "matched");

    const handleSubmit = async (type) => {
        if (!form.itemName.trim()) { toast.error("Please enter the item name"); return; }
        setSubmitting(true);
        setAiRunning(true);
        try {
            const docRef = await addLostFoundItem({
                type,
                itemName: form.itemName.trim(),
                description: form.description.trim(),
                reportedBy: user.uid,
                reportedByName: userData?.name || "",
                apartmentNumber: userData?.apartmentNumber || "",
            });

            // Run AI matching against opposite type items
            const oppositeType = type === "lost" ? "found" : "lost";
            const candidates = openItems.filter((i) => i.type === oppositeType);
            if (candidates.length > 0) {
                const aiMatches = await findAIMatches(
                    { type, itemName: form.itemName, description: form.description },
                    candidates
                );
                if (aiMatches.length > 0) {
                    await saveAISuggestions(docRef.id, aiMatches);
                    toast.success(`✨ AI found ${aiMatches.length} possible match(es)! Check the Matches tab.`);
                }
            }

            toast.success(`${type === "lost" ? "Lost" : "Found"} item reported successfully`);
            setForm({ itemName: "", description: "" });
        } catch {
            toast.error("Failed to submit item");
        } finally {
            setSubmitting(false);
            setAiRunning(false);
        }
    };

    const handleClose = async (id) => {
        try {
            await closeItem(id);
            toast.success("Item marked as closed/recovered");
        } catch {
            toast.error("Failed to close item");
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Lost & Found</h1>
                <p className="text-sm text-slate-500 mt-1">Report lost or found items — AI will suggest matches automatically</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit flex-wrap">
                {TABS.map((t, i) => (
                    <button
                        key={t}
                        onClick={() => setTab(i)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                            ${tab === i ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
                        style={tab === i ? { background: "linear-gradient(135deg, #E5B94B, #C97B1A)" } : {}}
                    >
                        {t}
                        {t === "Matches" && matchedItems.length > 0 && (
                            <span className="ml-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                                {matchedItems.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Report Lost */}
            {tab === 0 && (
                <ReportForm
                    type="lost"
                    form={form}
                    setForm={setForm}
                    submitting={submitting}
                    aiRunning={aiRunning}
                    onSubmit={() => handleSubmit("lost")}
                    accentColor="bg-red-50 border-red-200"
                    emoji="😔"
                    hint="Describe the item as precisely as possible — AI will try to find a match from reported found items."
                />
            )}

            {/* Report Found */}
            {tab === 1 && (
                <ReportForm
                    type="found"
                    form={form}
                    setForm={setForm}
                    submitting={submitting}
                    aiRunning={aiRunning}
                    onSubmit={() => handleSubmit("found")}
                    accentColor="bg-emerald-50 border-emerald-200"
                    emoji="🎉"
                    hint="Describe where and what you found — AI will alert the owner if there's a matching lost report."
                />
            )}

            {/* My Items */}
            {tab === 2 && (
                <div className="space-y-3">
                    {myItems.length === 0 ? (
                        <EmptyState text="You haven't reported any items yet." />
                    ) : myItems.map((item) => (
                        <ItemCard key={item.id} item={item} onClose={() => handleClose(item.id)} showClose />
                    ))}
                </div>
            )}

            {/* Matches */}
            {tab === 3 && (
                <div className="space-y-3">
                    {matchedItems.length === 0 ? (
                        <EmptyState text="No matches found yet. AI checks automatically when new items are reported." icon={<Sparkles className="w-8 h-8 text-amber-300" />} />
                    ) : matchedItems.map((item) => (
                        <div key={item.id} className="card p-5 border border-emerald-200 bg-emerald-50/30">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800">{item.itemName}</p>
                                    <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                                    <p className="text-xs text-emerald-600 font-medium mt-2">
                                        ✅ Matched! Contact admin/security to claim your item.
                                    </p>
                                    {item.aiMatchReason && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            <Sparkles className="w-3 h-3 inline mr-1" />AI: "{item.aiMatchReason}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

function ReportForm({ type, form, setForm, submitting, aiRunning, onSubmit, accentColor, emoji, hint }) {
    return (
        <div className="max-w-lg">
            <div className={`p-4 rounded-xl border mb-5 text-sm text-slate-600 ${accentColor}`}>
                {emoji} {hint}
            </div>
            <div className="card p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
                    <input
                        value={form.itemName}
                        onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                        placeholder={type === "lost" ? "e.g. Black leather wallet" : "e.g. Set of keys with red keychain"}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Color, size, location, contents, any distinguishing marks…"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40 resize-none"
                    />
                </div>
                <button
                    onClick={onSubmit}
                    disabled={submitting || !form.itemName.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                >
                    {aiRunning ? <><Loader2 className="w-4 h-4 animate-spin" /> AI Matching…</> : <><Plus className="w-4 h-4" /> Report {type === "lost" ? "Lost" : "Found"} Item</>}
                </button>
            </div>
        </div>
    );
}

function ItemCard({ item, onClose, showClose }) {
    return (
        <div className="card p-5 border border-slate-200">
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
                        </div>
                        {item.description && <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>}
                        <p className="text-xs text-slate-400 mt-1">
                            Reported {item.createdAt?.toDate?.()?.toLocaleDateString() || "—"} · Apt {item.apartmentNumber || "—"}
                        </p>
                    </div>
                </div>
                {showClose && item.status !== "closed" && (
                    <button onClick={onClose} className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Close
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyState({ text, icon }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <div className="flex justify-center mb-3">{icon || <Package className="w-8 h-8 text-slate-300" />}</div>
            <p className="text-slate-400 text-sm">{text}</p>
        </div>
    );
}
