import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { subscribeVisitors } from '../../services/visitorService';

export default function VisitorHistoryPage() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const unsub = subscribeVisitors({ status: 'exited' }, setHistory);
        return () => unsub();
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Visitor History</h1>
                <p className="text-sm text-slate-500 mt-1">Log of past visitor entries and exits</p>
            </div>

            <div className="card p-5">
                {history.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No visitor history available</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b">
                                    <th className="py-3">Name</th>
                                    <th className="py-3">Apartment</th>
                                    <th className="py-3">Entry Time</th>
                                    <th className="py-3">Exit Time</th>
                                    <th className="py-3">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(h => (
                                    <tr key={h.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="py-3 font-medium text-slate-800">{h.name}</td>
                                        <td className="py-3 text-slate-600">{h.apartmentNumber}</td>
                                        <td className="py-3 text-xs text-slate-500">{h.entryTime?.seconds ? new Date(h.entryTime.seconds*1000).toLocaleString() : '—'}</td>
                                        <td className="py-3 text-xs text-slate-500">{h.exitTime?.seconds ? new Date(h.exitTime.seconds*1000).toLocaleString() : '—'}</td>
                                        <td className="py-3 text-xs text-slate-500">{h.entryTime?.seconds && h.exitTime?.seconds ? Math.max(0, Math.floor((h.exitTime.seconds*1000 - h.entryTime.seconds*1000)/60000)) + ' min' : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
