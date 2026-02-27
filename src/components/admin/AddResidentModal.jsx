import { useState } from 'react';
import Modal from '../Modal';
import { Info } from 'lucide-react';
import { createUserProfile } from '../../services/visitorService';
import toast from 'react-hot-toast';

export default function AddResidentModal({ open, onClose }) {
    const [form, setForm] = useState({
        uid: '',
        name: '',
        email: '',
        apartmentNumber: '',
        occupancyType: 'owner',
        phone: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleAddResident = async (e) => {
        e.preventDefault();
        if (!form.uid) return toast.error("UID is required from Firebase Auth console");

        setSubmitting(true);
        try {
            await createUserProfile(form.uid, {
                name: form.name,
                email: form.email,
                apartmentNumber: form.apartmentNumber,
                occupancyType: form.occupancyType,
                phone: form.phone
            });
            toast.success("Resident profile created successfully");
            onClose();
            setForm({ uid: '', name: '', email: '', apartmentNumber: '', occupancyType: 'owner', phone: '' });
        } catch (err) {
            console.error(err);
            toast.error("Failed to create profile");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Register Resident Profile">
            <form onSubmit={handleAddResident} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800">
                        <strong>Note:</strong> Create the user in Firebase Authentication first, then copy the <strong>UID</strong> here to sync their profile.
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">User UID (from Auth console)</label>
                    <input
                        required
                        value={form.uid}
                        onChange={(e) => setForm({ ...form, uid: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-mustard"
                        placeholder="e.g. kHl2J9m..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Full Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-mustard"
                            placeholder="Resident Name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email Address</label>
                        <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-mustard"
                            placeholder="email@resihub.in"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Apartment No</label>
                        <input
                            required
                            value={form.apartmentNumber}
                            onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-mustard"
                            placeholder="e.g. A-101"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Type</label>
                        <select
                            value={form.occupancyType}
                            onChange={(e) => setForm({ ...form, occupancyType: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-mustard"
                        >
                            <option value="owner">Owner</option>
                            <option value="tenant">Tenant</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-60 shadow-md hover:shadow-lg mt-2"
                    style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                >
                    {submitting ? "Processing..." : "Create Resident Profile"}
                </button>
            </form>
        </Modal>
    );
}
