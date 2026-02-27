import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import StatCard from '../components/StatCard';
import DashboardLayout from '../components/DashboardLayout';
import { subscribeVisitors, addVisitor, markEntry, markExit, subscribeActiveVisitors } from '../services/visitorService';
import { subscribeActiveEmergencies, resolveEmergency } from '../services/emergencyService';
import { subscribeAnnouncements } from '../services/announcementService';
import Modal from '../components/Modal';
import ActionButton from '../components/security/ActionButton';
import { Users, UserPlus, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function Toast({ toast }) {
    if (!toast) return null;
    return (
        <div className="fixed right-4 bottom-6 bg-white p-3 rounded-lg shadow-md border" style={{ minWidth: 220 }}>
            <div className="text-sm font-medium">{toast.title}</div>
            <div className="text-xs text-slate-500 mt-1">{toast.message}</div>
        </div>
    );
}

export default function SecurityDashboard() {
    const [informed, setInformed] = useState([]);
    const [active, setActive] = useState([]);
    const [history, setHistory] = useState([]);
    const [emergencies, setEmergencies] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const [clock, setClock] = useState(new Date());
    const [toast, setToast] = useState(null);

    const [manualOpen, setManualOpen] = useState(false);
    const nameRef = useRef();
    const phoneRef = useRef();
    const aptRef = useRef();
    const purposeRef = useRef();

    useEffect(() => {
        const u1 = subscribeVisitors({ status: 'informed' }, setInformed);
        const u2 = subscribeActiveVisitors(setActive);
        const u3 = subscribeVisitors({ status: 'exited' }, setHistory);
        const u4 = subscribeActiveEmergencies(setEmergencies);
        const u5 = subscribeAnnouncements(setAnnouncements);

        const t = setInterval(() => setClock(new Date()), 1000);
        return () => { u1(); u2(); u3(); u4(); u5(); clearInterval(t); };
    }, []);

    // deep-link handling: scroll to a section if URL has a hash like #preapproved
    const location = useLocation();
    useEffect(() => {
        if (!location.hash) return;
        const id = location.hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // small focus for accessibility
            el.setAttribute('tabindex', '-1');
            el.focus({ preventScroll: true });
        }
    }, [location.hash]);

    async function handleGrantEntryPre(id) {
        try {
            await markEntry(id);
            setToast({ title: 'Entry Granted', message: 'Visitor marked as inside.' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { console.error(err); }
    }

    async function handleRejectPre(id) {
        try {
            await markExit(id); // mark as exited / rejected
            setToast({ title: 'Rejected', message: 'Pre-approved visitor rejected.' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { console.error(err); }
    }

    async function handleManualGrant(e) {
        e.preventDefault();
        const data = { name: nameRef.current.value, phone: phoneRef.current.value, apartmentNumber: aptRef.current.value, purpose: purposeRef.current.value, type: 'manual' };
        try {
            await addVisitor(data);
            setManualOpen(false);
            setToast({ title: 'Entry Granted', message: 'Manual visitor added and marked inside.' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { console.error(err); }
    }

    async function handleExit(id) {
        try {
            await markExit(id);
            setToast({ title: 'Exit Recorded', message: 'Visitor moved to history.' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { console.error(err); }
    }

    async function handleResolveEmergency(eid) {
        try {
            await resolveEmergency(eid);
            setToast({ title: 'Emergency Resolved', message: 'Marked resolved.' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) { console.error(err); }
    }

    return (
        <DashboardLayout>
            <div className="mb-8 animate-in fade-in duration-300 ease-out">
                <h1 className="page-title">Security Panel</h1>
                <p className="page-subtitle">Real-time visitor monitoring & gate management</p>
            </div>

            {emergencies.length > 0 && (
                <div className="mb-6 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top duration-400 ease-out" style={{ backgroundColor: 'rgba(254,226,226,0.6)', border: '1px solid rgba(248,113,113,0.12)' }}>
                    <AlertTriangle className="w-6 h-6 text-red-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-red-700">🚨 Emergency Active: {emergencies[0]?.title || emergencies[0]?.type}</div>
                        <div className="text-sm text-red-600 mt-1">{emergencies[0]?.description}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ActionButton className="px-4 py-2 rounded-lg border hover:bg-slate-50 transition-colors text-sm">View Details</ActionButton>
                        <ActionButton className="px-4 py-2 rounded-lg bg-[var(--mustard)] text-white hover:shadow-md transition-all" onClick={() => handleResolveEmergency(emergencies[0].id)}>Mark Resolved</ActionButton>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
                    <StatCard icon={<Users className="w-6 h-6" />} label="Visitors Inside" value={active.length} color="blue" />
                </div>
                <div style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
                    <StatCard icon={<UserPlus className="w-6 h-6" />} label="Today's Entries" value={history.length + active.length} color="primary" />
                </div>
                <div style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
                    <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Informed Pending" value={informed.length} color="amber" />
                </div>
                <div style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}>
                    <StatCard icon={<AlertTriangle className="w-6 h-6" />} label="Active Emergencies" value={emergencies.length} color="red" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
                <div className="card p-5 lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Informed Visitors</h3>
                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Expected time</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                                    <th className="py-3 font-semibold">Name</th>
                                    <th className="py-3 font-semibold">Phone</th>
                                    <th className="py-3 font-semibold">Apartment</th>
                                    <th className="py-3 font-semibold">Expected</th>
                                    <th className="py-3 font-semibold">Status</th>
                                    <th className="py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {informed.slice(0, 5).map((v) => (
                                    <tr key={v.id} className="align-middle border-b border-slate-50 hover:bg-amber-50/30 transition-colors">
                                        <td className="py-3 font-medium text-slate-800">{v.name}</td>
                                        <td className="py-3 text-slate-600">{v.phone}</td>
                                        <td className="py-3 text-slate-600">{v.apartmentNumber}</td>
                                        <td className="py-3 text-xs text-slate-500">{v.expectedTime ? new Date(v.expectedTime.seconds * 1000).toLocaleString() : '—'}</td>
                                        <td className="py-3"><span className="badge-yellow">Informed</span></td>
                                        <td className="py-3 text-right">
                                            <ActionButton className="px-3 py-1.5 rounded-lg mr-2 border hover:bg-slate-50 transition-colors text-sm font-medium" onClick={() => handleRejectPre(v.id)}>Reject</ActionButton>
                                            <ActionButton className="px-3 py-1.5 rounded-lg bg-[var(--mustard)] text-white hover:shadow-md transition-all text-sm font-medium" onClick={() => handleGrantEntryPre(v.id)}>Grant</ActionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {informed.length === 0 && <div className="text-center py-6 text-slate-400">No pending informed visitors</div>}
                    </div>
                </div>

                <div className="card p-5 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Quick Entry</h3>
                    <p className="text-sm text-slate-600 mb-4">Add a visitor manually and grant immediate entry.</p>
                    <ActionButton onClick={() => setManualOpen(true)} className="w-full px-4 py-3 bg-[var(--mustard)] text-white rounded-lg hover:shadow-md transition-all font-medium">+ Add Manual Entry</ActionButton>
                </div>
            </div>

            <div className="card p-5 hover:shadow-lg transition-shadow duration-300" style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Visitors</h3>
                {active.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No visitors currently inside</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                                    <th className="py-3 font-semibold">Name</th>
                                    <th className="py-3 font-semibold">Apartment</th>
                                    <th className="py-3 font-semibold">Entry Time</th>
                                    <th className="py-3 font-semibold">Duration</th>
                                    <th className="py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {active.map((v) => (
                                    <tr key={v.id} className="align-middle border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                                        <td className="py-3 font-medium text-slate-800">{v.name}</td>
                                        <td className="py-3 text-slate-600">{v.apartmentNumber}</td>
                                        <td className="py-3 text-xs text-slate-500">{v.entryTime?.seconds ? new Date(v.entryTime.seconds * 1000).toLocaleString() : '—'}</td>
                                        <td className="py-3 text-xs text-slate-500 font-medium text-blue-600">{v.entryTime?.seconds ? Math.max(0, Math.floor((clock.getTime() - v.entryTime.seconds * 1000) / 60000)) + ' min' : '—'}</td>
                                        <td className="py-3 text-right">
                                            <ActionButton className="px-3 py-1.5 rounded-lg border hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium" onClick={() => handleExit(v.id)}>Exit</ActionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}>
                <div className="card p-5 hover:shadow-lg transition-shadow duration-300">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Recent Announcements</h4>
                    {announcements.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">No announcements</div>
                    ) : (
                        <div className="space-y-3">
                            {announcements.slice(0, 3).map((a) => (
                                <div key={a.id} className="p-3 rounded-lg border border-slate-150 hover:bg-slate-50 transition-colors">
                                    <div className="font-semibold text-slate-800">{a.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">{a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toLocaleString() : ''}</div>
                                    {a.body && <div className="text-sm text-slate-600 mt-2 line-clamp-2">{a.body.slice(0, 120)}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="card p-5 hover:shadow-lg transition-shadow duration-300">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">System Status</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm text-slate-700 font-medium">Security System Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm text-slate-700 font-medium">Gate Access Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm text-slate-700 font-medium">Firestore Connected</span>
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Manual Visitor Entry">
                <form onSubmit={handleManualGrant} className="space-y-3">
                    <div>
                        <label className="text-sm text-slate-600">Visitor Name</label>
                        <input ref={nameRef} required className="w-full mt-1 rounded-lg border px-3 py-2" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-600">Phone</label>
                        <input ref={phoneRef} required className="w-full mt-1 rounded-lg border px-3 py-2" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-600">Apartment Number</label>
                        <input ref={aptRef} required className="w-full mt-1 rounded-lg border px-3 py-2" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-600">Purpose</label>
                        <input ref={purposeRef} className="w-full mt-1 rounded-lg border px-3 py-2" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <ActionButton type="button" className="px-3 py-2 rounded-lg border" onClick={() => setManualOpen(false)}>Cancel</ActionButton>
                        <ActionButton type="submit" className="px-3 py-2 rounded-lg bg-[var(--mustard)] text-white">Grant Entry</ActionButton>
                    </div>
                </form>
            </Modal>

            <Toast toast={toast} />
        </DashboardLayout>
    );
}
