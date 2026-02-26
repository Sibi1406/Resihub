import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Settings } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

function Toast({ toast }) {
    if (!toast) return null;
    return (
        <div className="fixed right-4 bottom-6 bg-white p-3 rounded-lg shadow-md border" style={{ minWidth: 220 }}>
            <div className="text-sm font-medium">{toast.title}</div>
            <div className="text-xs text-slate-500 mt-1">{toast.message}</div>
        </div>
    );
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        communityName: 'ResiHub Community',
        totalUnits: 100,
        maintenanceFee: 5000,
        contactEmail: 'admin@resihub.com',
    });
    const [toast, setToast] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const nameRef = useRef();
    const unitsRef = useRef();
    const feeRef = useRef();
    const emailRef = useRef();

    useEffect(() => {
        async function loadSettings() {
            try {
                const settingsDoc = await getDoc(doc(db, 'settings', 'community'));
                if (settingsDoc.exists()) {
                    const data = settingsDoc.data();
                    setSettings({
                        communityName: data.communityName || 'ResiHub Community',
                        totalUnits: data.totalUnits || 100,
                        maintenanceFee: data.maintenanceFee || 5000,
                        contactEmail: data.contactEmail || 'admin@resihub.com',
                    });
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        loadSettings();
    }, []);

    useEffect(() => {
        if (nameRef.current) {
            nameRef.current.value = settings.communityName;
            unitsRef.current.value = settings.totalUnits;
            feeRef.current.value = settings.maintenanceFee;
            emailRef.current.value = settings.contactEmail;
        }
    }, [settings]);

    async function handleSave(e) {
        e.preventDefault();
        setIsSaving(true);
        try {
            const newSettings = {
                communityName: nameRef.current.value,
                totalUnits: parseInt(unitsRef.current.value),
                maintenanceFee: parseInt(feeRef.current.value),
                contactEmail: emailRef.current.value,
            };
            
            // Save to Firestore
            await setDoc(doc(db, 'settings', 'community'), newSettings);
            
            setSettings(newSettings);
            setToast({ title: 'Success', message: 'Settings saved successfully.' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setToast({ title: 'Error', message: error.message });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <DashboardLayout>
            <Toast toast={toast} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Community Settings</h1>
                <p className="text-sm text-slate-500 mt-2">Manage community information and preferences</p>
            </div>

            {/* Settings Form */}
            <div className="card p-6 max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Community Name</label>
                        <input
                            ref={nameRef}
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#E5B94B' }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Total Units</label>
                            <input
                                ref={unitsRef}
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': '#E5B94B' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Maintenance Fee (₹)</label>
                            <input
                                ref={feeRef}
                                type="number"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': '#E5B94B' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
                        <input
                            ref={emailRef}
                            type="email"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': '#E5B94B' }}
                        />
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-100">
                        <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 rounded-lg text-white transition-all" style={{ backgroundColor: '#E5B94B' }}>
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Info Box */}
            <div className="mt-8 card p-6 bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900">Active Settings</h3>
                        <p className="text-sm text-blue-700 mt-2">
                            These settings apply to the entire community and are visible to all residents through the system.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
