import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { Megaphone, Plus } from 'lucide-react';
import { subscribeAnnouncements, addAnnouncement } from "../../services/announcementService";

function Toast({ toast }) {
    if (!toast) return null;
    return (
        <div className="fixed right-4 bottom-6 bg-white p-3 rounded-lg shadow-md border" style={{ minWidth: 220 }}>
            <div className="text-sm font-medium">{toast.title}</div>
            <div className="text-xs text-slate-500 mt-1">{toast.message}</div>
        </div>
    );
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [toast, setToast] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const titleRef = useRef();
    const messageRef = useRef();

    useEffect(() => {
        const unsub = subscribeAnnouncements(setAnnouncements);
        return () => unsub();
    }, []);

    async function handlePost(e) {
        e.preventDefault();
        try {
            await addAnnouncement({
                title: titleRef.current.value,
                message: messageRef.current.value,
            });
            setToast({ title: 'Success', message: 'Announcement posted to all residents.' });
            setTimeout(() => setToast(null), 3000);
            setModalOpen(false);
            titleRef.current.value = '';
            messageRef.current.value = '';
        } catch (error) {
            setToast({ title: 'Error', message: error.message });
            setTimeout(() => setToast(null), 3000);
        }
    }

    return (
        <DashboardLayout>
            <Toast toast={toast} />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Community Announcements</h1>
                    <p className="text-sm text-slate-500 mt-2">Manage announcements for all residents</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
                    style={{ backgroundColor: '#E5B94B' }}
                >
                    <Plus className="w-4 h-4" />
                    Post New
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                <StatCard icon={<Megaphone className="w-6 h-6" />} label="Total Announcements" value={announcements.length} color="amber" />
            </div>

            {/* Announcements List */}
            <div className="card p-6">
                <h3 className="font-semibold text-slate-800 mb-4">All Announcements</h3>
                {announcements.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No announcements posted yet</div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann.id} className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800">{ann.title}</h3>
                                        <p className="text-sm text-slate-600 mt-2">{ann.message}</p>
                                        <div className="text-xs text-slate-400 mt-2">
                                            Posted: {new Date(ann.createdAt?.seconds * 1000).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="w-full max-w-md mx-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Post Announcement</h2>
                    <form onSubmit={handlePost} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                            <input ref={titleRef} type="text" placeholder="Announcement title" className="w-full px-3 py-2 rounded-lg border border-slate-200" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                            <textarea ref={messageRef} placeholder="Announcement details..." className="w-full px-3 py-2 rounded-lg border border-slate-200" rows="5" required />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#E5B94B' }}>
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
