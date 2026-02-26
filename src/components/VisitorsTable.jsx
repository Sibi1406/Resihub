
export default function VisitorsTable({ visitors }) {
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                    <th className="py-2">Name</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Entry</th>
                    <th className="py-2">Exit</th>
                </tr>
            </thead>
            <tbody>
                {visitors.map(v => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-2 font-medium text-slate-800">{v.name}</td>
                        <td className="py-2">
                            <span className={v.status === 'inside' ? 'badge-blue badge-padded' : 'badge-green badge-padded'}>
                                {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                            </span>
                        </td>
                        <td className="py-2 text-slate-500 text-xs">
                            {v.entryTime?.seconds ? new Date(v.entryTime.seconds * 1000).toLocaleTimeString() : '—'}
                        </td>
                        <td className="py-2 text-slate-500 text-xs">
                            {v.exitTime?.seconds ? new Date(v.exitTime.seconds * 1000).toLocaleTimeString() : '—'}
                        </td>
                    </tr>
                ))}
                {visitors.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-500">No visitors</td></tr>
                )}
            </tbody>
        </table>
    );
}
