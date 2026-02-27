import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { Users, FileText, UserPlus, Trash2, Info } from 'lucide-react';
import { subscribeAllResidents, deleteUser } from '../../services/visitorService';
import AddResidentModal from '../../components/admin/AddResidentModal';
import { subscribeAllComplaints } from '../../services/complaintService';
import { subscribeVisitors } from '../../services/visitorService';
import toast from 'react-hot-toast';

export default function AdminResidentsPage() {
    const [residents, setResidents] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [selectedResident, setSelectedResident] = useState(null);
    const [selectedResidentComplaints, setSelectedResidentComplaints] = useState([]);
    const [selectedResidentVisitors, setSelectedResidentVisitors] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('overview'); // overview, complaints, visitors



    useEffect(() => {
        const unsub = subscribeAllResidents((res) => {
            setResidents(res.filter(r => r.role === 'resident'));
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub1 = subscribeAllComplaints(setComplaints);
        const unsub2 = subscribeVisitors({}, setVisitors);
        return () => { unsub1(); unsub2(); };
    }, []);

    const handleViewResident = (resident) => {
        setSelectedResident(resident);
        setModalTab('overview');
        // Filter complaints and visitors for this resident
        setSelectedResidentComplaints(complaints.filter(c => c.residentId === resident.id || c.raisedBy === resident.id));
        setSelectedResidentVisitors(visitors.filter(v => v.apartmentNumber === resident.apartmentNumber && v.status === 'exited'));
        setModalOpen(true);
    }


    const handleDelete = async (uid) => {
        if (!window.confirm("Delete this resident's profile from Firestore? (Must also be deleted from Auth console for full removal)")) return;
        try {
            await deleteUser(uid);
            toast.success("Profile deleted");
        } catch (err) {
            toast.error("Delete failed");
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Resident Management</h1>
                    <p className="text-sm text-slate-500 mt-2">View and manage all residents and their details</p>
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                >
                    <UserPlus className="w-4 h-4" /> Add Resident
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                <StatCard icon={<Users className="w-6 h-6" />} label="Total Residents" value={residents.length} color="blue" />
            </div>

            {/* Residents Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Name</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Email/Apt</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Type</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Status</th>
                            <th className="text-right px-6 py-3 text-sm font-semibold text-slate-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {residents.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-slate-500">
                                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    No residents found
                                </td>
                            </tr>
                        ) : (
                            residents.map(res => (
                                <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800">{res.name || 'N/A'}</p>
                                        <p className="text-xs text-slate-400 font-mono select-all">{res.id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{res.email}</div>
                                        <div className="text-xs text-slate-400 font-medium">Apt: {res.apartmentNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${res.occupancyType === 'owner' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {res.occupancyType || 'resident'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 font-medium">Active</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewResident(res)}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-semibold"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => handleDelete(res.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                title="Delete Profile"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AddResidentModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

            {/* Details Modal */}
            <Modal open={modalOpen && selectedResident} onClose={() => setModalOpen(false)}>
                <div className="w-full max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedResident?.name}</h2>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-slate-200">
                        <button
                            onClick={() => setModalTab('overview')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${modalTab === 'overview'
                                ? 'border-b-2 border-mustard text-mustard'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setModalTab('complaints')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${modalTab === 'complaints'
                                ? 'border-b-2 border-mustard text-mustard'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            Complaints ({selectedResidentComplaints.length})
                        </button>
                        <button
                            onClick={() => setModalTab('visitors')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${modalTab === 'visitors'
                                ? 'border-b-2 border-mustard text-mustard'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            Visitors ({selectedResidentVisitors.length})
                        </button>
                    </div>

                    {selectedResident && (
                        <div>
                            {/* Overview Tab */}
                            {modalTab === 'overview' && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium font-mono text-[10px] uppercase tracking-widest">Auth UID</div>
                                        <div className="text-slate-800 mt-1 font-mono text-xs select-all bg-slate-50 p-2 rounded-lg border border-slate-100">{selectedResident.id}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium">Email</div>
                                        <div className="text-slate-800 mt-1">{selectedResident.email}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-slate-500 font-medium">Apartment</div>
                                            <div className="text-slate-800 mt-1">{selectedResident.apartmentNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500 font-medium">Occupancy Type</div>
                                            <div className="text-slate-800 mt-1 capitalize">{selectedResident.occupancyType}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium">Phone</div>
                                        <div className="text-slate-800 mt-1">{selectedResident.phone || 'Not provided'}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg mt-4 font-bold border border-slate-100">
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest">Total Complaints</div>
                                            <div className="text-2xl font-bold text-amber-600 mt-1">{selectedResidentComplaints.length}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest">Visitor Visits</div>
                                            <div className="text-2xl font-bold text-blue-600 mt-1">{selectedResidentVisitors.length}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Complaints Tab */}
                            {modalTab === 'complaints' && (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {selectedResidentComplaints.length === 0 ? (
                                        <p className="text-slate-500 text-center py-6">No complaints found</p>
                                    ) : (
                                        selectedResidentComplaints.map(c => (
                                            <div key={c.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/30">
                                                <div className="font-semibold text-slate-800">{c.title}</div>
                                                <div className="text-sm text-slate-600 mt-1 line-clamp-2">{c.description}</div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white border border-slate-200 rounded text-slate-500">{c.category}</span>
                                                    <StatusBadge status={c.status} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Visitors Tab */}
                            {modalTab === 'visitors' && (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {selectedResidentVisitors.length === 0 ? (
                                        <p className="text-slate-500 text-center py-6">No visitor history</p>
                                    ) : (
                                        selectedResidentVisitors.map(v => (
                                            <div key={v.id} className="p-3 border border-slate-200 rounded-lg">
                                                <div className="font-medium text-slate-800">{v.visitorName || v.name}</div>
                                                <div className="text-sm text-slate-600 mt-1">{v.phone}</div>
                                                <div className="text-xs text-slate-500 mt-2 font-mono">
                                                    {v.entryTime?.seconds && new Date(v.entryTime.seconds * 1000).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-6 border-t border-slate-200 mt-6">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-semibold text-slate-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </DashboardLayout>
    );
}
