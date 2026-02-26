import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { subscribeActiveEmergencies, resolveEmergency } from '../../services/emergencyService';
import ActionButton from '../../components/security/ActionButton';
import { AlertTriangle } from 'lucide-react';

export default function EmergenciesPage() {
    const [emergencies, setEmergencies] = useState([]);

    useEffect(() => {
        const unsub = subscribeActiveEmergencies(setEmergencies);
        return () => unsub();
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Emergencies</h1>
                <p className="text-sm text-slate-500 mt-1">Active emergency alerts</p>
            </div>

            {emergencies.length === 0 ? (
                <div className="card p-6 text-center text-slate-500">No active emergencies</div>
            ) : (
                <div className="space-y-3">
                    {emergencies.map(e => (
                        <div key={e.id} className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-700" />
                            <div className="flex-1">
                                <div className="font-semibold text-red-700 capitalize">{e.type}</div>
                                <div className="text-sm text-red-600 mt-1">{e.description}</div>
                                <div className="text-xs text-red-500 mt-2">Reported: {e.createdAt?.seconds ? new Date(e.createdAt.seconds*1000).toLocaleString() : ''}</div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <ActionButton className="px-3 py-1.5 rounded-lg bg-[var(--mustard)] text-white" onClick={() => resolveEmergency(e.id)}>Mark Resolved</ActionButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
