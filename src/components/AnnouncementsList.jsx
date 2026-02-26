
export default function AnnouncementsList({ announcements }) {
    return (
        <div className="space-y-4">
            {announcements.map(a => (
                <div key={a.id} className="p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="font-medium text-slate-800">{a.title}</div>
                    <div className="text-sm text-slate-600 mt-1 line-clamp-2">{a.body || a.message}</div>
                    <div className="text-xs text-slate-400 mt-2">{a.createdAt?.seconds ? new Date(a.createdAt.seconds*1000).toLocaleString() : ''}</div>
                </div>
            ))}
            {announcements.length === 0 && <div className="text-center text-slate-500 py-6">No announcements</div>}
        </div>
    );
}
