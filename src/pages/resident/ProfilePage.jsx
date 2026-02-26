import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { Mail, Phone, User } from "lucide-react";
import toast from "react-hot-toast";

export default function ResidentProfilePage() {
    const { user, userData, updateUserData } = useAuth();
    const [phone, setPhone] = useState(userData?.phone || "");
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateUserData({ phone: phone.trim() });
            toast.success("Profile updated");
        } catch (err) {
            toast.error("Failed to save profile");
        }
        setSaving(false);
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                <p className="text-sm text-slate-500 mt-1">Personal details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                        <User className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{userData?.name || "Resident"}</h2>
                    <div className="text-sm text-slate-500 mt-1">{userData?.occupancyType || "Occupant"}</div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="text-sm font-medium text-slate-700">Apartment</div>
                        <div className="text-lg font-bold text-slate-800 mt-1">{userData?.apartmentNumber || "-"}</div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Joined {userData?.createdAt?.toDate?.()?.toLocaleDateString() || "-"}
                    </div>
                </div>

                <div className="lg:col-span-2 card p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Contact Information</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <div className="flex-1">
                                <div className="text-sm text-slate-500">Email</div>
                                <div className="text-slate-800 mt-1">{user?.email || 'Not available'}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <div className="flex-1">
                                <label className="text-sm text-slate-500">Phone</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 rounded-lg bg-mustard text-white hover:shadow-lg transition-all btn-primary disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
