import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { subscribeActiveVisitors, markExit } from '../../services/visitorService';
import ActionButton from '../../components/security/ActionButton';

export default function ActiveVisitorsPage() {
    const [active, setActive] = useState([]);
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const u = subscribeActiveVisitors(setActive);
        const t = setInterval(() => setClock(new Date()), 1000);
        return () => { u(); clearInterval(t); };
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Active Visitors</h1>
                <p className="text-sm text-slate-500 mt-1">Visitors currently inside the community</p>
            </div>

            <div className="card p-5">
                {active.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No visitors currently inside</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b">
                                    <th className="py-3">Name</th>
                                    <th className="py-3">Apartment</th>
                                    <th className="py-3">Entry Time</th>
                                    <th className="py-3">Duration</th>
                                    <th className="py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {active.map(v => (
                                    <tr key={v.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="py-3 font-medium text-slate-800">{v.name}</td>
                                        <td className="py-3 text-slate-600">{v.apartmentNumber}</td>
                                        <td className="py-3 text-xs text-slate-500">{v.entryTime?.seconds ? new Date(v.entryTime.seconds*1000).toLocaleString() : '—'}</td>
                                        <td className="py-3 text-xs text-blue-600">{v.entryTime?.seconds ? Math.max(0, Math.floor((clock.getTime() - v.entryTime.seconds*1000)/60000)) + ' min' : '—'}</td>
                                        <td className="py-3 text-right"><ActionButton className="px-3 py-1.5 rounded-lg border hover:bg-red-50" onClick={() => markExit(v.id)}>Exit</ActionButton></td>
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
