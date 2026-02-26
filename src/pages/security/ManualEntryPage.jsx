import { useRef, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ActionButton from '../../components/security/ActionButton';
import { addVisitor } from '../../services/visitorService';

export default function ManualEntryPage() {
    const nameRef = useRef();
    const phoneRef = useRef();
    const aptRef = useRef();
    const purposeRef = useRef();
    const [toast, setToast] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await addVisitor({
                name: nameRef.current.value,
                phone: phoneRef.current.value,
                apartmentNumber: aptRef.current.value,
                purpose: purposeRef.current.value,
                type: 'manual'
            });
            setToast({ title: 'Entry Granted', message: 'Visitor added and marked inside.' });
            setTimeout(() => setToast(null), 3000);
            nameRef.current.value = '';
            phoneRef.current.value = '';
            aptRef.current.value = '';
            purposeRef.current.value = '';
        } catch (err) { console.error(err); setToast({ title: 'Error', message: 'Failed to add visitor' }); setTimeout(() => setToast(null), 3000); }
    }

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Manual Visitor Entry</h1>
                <p className="text-sm text-slate-500 mt-1">Quickly add a visitor and grant immediate entry</p>
            </div>

            <div className="card p-6 max-w-md">
                <form onSubmit={handleSubmit} className="space-y-3">
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
                    <div className="flex gap-2">
                        <ActionButton type="submit" className="px-4 py-2 rounded-lg bg-[var(--mustard)] text-white">Grant Entry</ActionButton>
                        <ActionButton type="button" onClick={() => { nameRef.current.value=''; phoneRef.current.value=''; aptRef.current.value=''; purposeRef.current.value=''; }} className="px-4 py-2 rounded-lg border">Clear</ActionButton>
                    </div>
                </form>
            </div>

            {toast && (
                <div className="fixed right-4 bottom-6 bg-white p-3 rounded-lg shadow-md border">
                    <div className="text-sm font-medium">{toast.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{toast.message}</div>
                </div>
            )}
        </DashboardLayout>
    );
}
