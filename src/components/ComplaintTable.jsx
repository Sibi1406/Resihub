
export default function ComplaintTable({ complaints }) {
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                    <th className="py-2">Title</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Created</th>
                </tr>
            </thead>
            <tbody>
                {complaints.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-2 font-medium text-slate-800">{c.title}</td>
                        <td className="py-2 text-slate-600 capitalize">{c.category}</td>
                        <td className="py-2">
                            <span className={`badge-${c.status === 'pending' ? 'yellow' : c.status === 'in-progress' ? 'blue' : 'green'}` + " badge-padded"}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
                        </td>
                        <td className="py-2 text-slate-500">{c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : '—'}</td>
                    </tr>
                ))}
                {complaints.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-500">No complaints</td></tr>
                )}
            </tbody>
        </table>
    );
}
