import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone } from 'lucide-react';

export default function SecurityProfilePage() {
    const { user, userData } = useAuth();

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                <p className="text-sm text-slate-500 mt-1">Account details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                        <User className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{userData?.name || 'Security'}</h2>
                    <div className="text-sm text-slate-500 mt-1">Security Staff</div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="text-sm font-medium text-slate-700">Shift</div>
                        <div className="text-lg font-bold text-slate-800 mt-1">{userData?.shift || 'Not set'}</div>
                    </div>
                </div>

                <div className="lg:col-span-2 card p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Contact Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-sm text-slate-500">Email</div>
                                <div className="text-slate-800 mt-1">{user?.email || 'Not available'}</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <div>
                                <div className="text-sm text-slate-500">Phone</div>
                                <div className="text-slate-800 mt-1">{userData?.phone || 'Not provided'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
