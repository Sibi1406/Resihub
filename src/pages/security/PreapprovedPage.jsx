import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { subscribeVisitors, markEntry, markExit } from '../../services/visitorService';
import ActionButton from '../../components/security/ActionButton';

export default function PreapprovedPage() {
    const [informed, setInformed] = useState([]);

    useEffect(() => {
        const unsub = subscribeVisitors({ status: 'informed' }, setInformed);
        return () => unsub();
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Informed Visitors</h1>
                <p className="text-sm text-slate-500 mt-1">Visitors registered by residents awaiting entry</p>
            </div>

            <div className="card p-5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-slate-500 border-b">
                                <th className="py-3">Name</th>
                                <th className="py-3">Phone</th>
                                <th className="py-3">Apartment</th>
                                <th className="py-3">Expected</th>
                                <th className="py-3">Status</th>
                                <th className="py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {informed.map(v => (
                                <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 font-medium text-slate-800">{v.name || v.visitorName}</td>
                                    <td className="py-3 text-slate-600">{v.phone}</td>
                                    <td className="py-3 text-slate-600">{v.apartmentNumber}</td>
                                    <td className="py-3 text-xs text-slate-500">{v.expectedTime?.seconds ? new Date(v.expectedTime.seconds * 1000).toLocaleString() : '—'}</td>
                                    <td className="py-3"><span className="badge-yellow">Informed</span></td>
                                    <td className="py-3 text-right">
                                        <ActionButton className="px-3 py-1.5 rounded-lg border mr-2" onClick={() => markExit(v.id)}>Reject</ActionButton>
                                        <ActionButton className="px-3 py-1.5 rounded-lg bg-[var(--mustard)] text-white" onClick={() => markEntry(v.id)}>Grant</ActionButton>
                                    </td>
                                </tr>
                            ))}
                            {informed.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No pending informed visitors</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
