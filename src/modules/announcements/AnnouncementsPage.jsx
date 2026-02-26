import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { subscribeAnnouncements, addAnnouncement } from "../../services/announcementService";
import toast from "react-hot-toast";

export default function AnnouncementsPage() {
    const { user, role, userData } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const unsub = subscribeAnnouncements(setAnnouncements);
        return unsub;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addAnnouncement({
                ...form,
                createdBy: user.uid,
                createdByName: userData?.name || "Admin",
            });
            toast.success("Announcement posted");
            setShowModal(false);
            setForm({ title: "", message: "" });
        } catch {
            toast.error("Failed to post announcement");
        }
        setSubmitting(false);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
                    <p className="text-sm text-slate-500 mt-1">Community notices and updates</p>
                </div>
                {role === "admin" && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
                    >
                        + Post Announcement
                    </button>
                )}
            </div>

            {/* Announcements list */}
            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                        <p className="text-slate-400">No announcements yet</p>
                    </div>
                ) : (
                    announcements.map((a) => (
                        <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl mt-0.5">📢</span>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 text-base">{a.title}</h3>
                                    <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">{a.message}</p>
                                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                                        <span>By {a.createdByName || "Admin"}</span>
                                        <span>•</span>
                                        <span>{a.createdAt?.toDate?.()?.toLocaleString() || "—"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Post modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Post Announcement">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Announcement title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                        <textarea
                            required
                            rows={4}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            placeholder="Announcement details"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {submitting ? "Posting..." : "Post Announcement"}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
