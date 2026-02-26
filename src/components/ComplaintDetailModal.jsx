import Modal from './Modal';
import { Clock, CheckCircle, Loader } from 'lucide-react';

function formatTs(ts) {
    if (!ts) return '-';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleString();
}

function Step({ label, time, active, done, color }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${done ? 'bg-emerald-600' : active ? 'bg-blue-500' : 'bg-slate-200'}`} />
                <div className="w-px flex-1 bg-slate-200 mt-2" style={{ minHeight: 10 }} />
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{label}</div>
                <div className="text-xs text-slate-500 mt-1">{time || '—'}</div>
            </div>
        </div>
    );
}

export default function ComplaintDetailModal({ open, onClose, complaint }) {
    if (!open || !complaint) return null;

    const createdAt = complaint.createdAt;
    const inProgressAt = complaint.inProgressAt || null;
    const resolvedAt = complaint.resolvedAt || null;

    return (
        <Modal open={open} onClose={onClose} title="Complaint Details">
            <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="text-lg font-semibold text-slate-800 truncate">{complaint.title}</div>
                            <div className="text-sm text-slate-500 mt-1">{complaint.category}</div>
                            <div className="text-sm text-slate-600 mt-3">{complaint.description}</div>
                        </div>
                        {complaint.imageUrl && (
                            <div className="w-28 h-20 bg-slate-50 rounded-md overflow-hidden flex items-center justify-center border">
                                <img src={complaint.imageUrl} alt="attachment" className="object-cover w-full h-full" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Status Timeline</h4>
                    <div className="space-y-4">
                        <Step label="Raised" time={formatTs(createdAt)} done={false} active={!inProgressAt && !resolvedAt} />
                        <Step label="In Progress" time={formatTs(inProgressAt)} done={!!inProgressAt && !resolvedAt} active={!!inProgressAt && !resolvedAt} />
                        <Step label="Resolved" time={formatTs(resolvedAt)} done={!!resolvedAt} active={!!resolvedAt} />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">Close</button>
                </div>
            </div>
        </Modal>
    );
}
