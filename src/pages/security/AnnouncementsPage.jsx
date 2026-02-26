import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { subscribeAnnouncements } from '../../services/announcementService';
import { Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const unsub = subscribeAnnouncements(setAnnouncements);
        return () => unsub();
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
                <p className="text-sm text-slate-500 mt-1">Community notices and updates</p>
            </div>

            <div className="card p-5">
                {announcements.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No announcements yet</div>
                ) : (
                    <div className="space-y-3">
                        {announcements.map(a => (
                            <div key={a.id} className="p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                                <div className="font-semibold text-slate-800">{a.title}</div>
                                <div className="text-xs text-slate-400 mt-1">{a.createdAt?.seconds ? new Date(a.createdAt.seconds*1000).toLocaleString() : ''}</div>
                                <div className="text-sm text-slate-600 mt-2">{a.message || a.body}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
