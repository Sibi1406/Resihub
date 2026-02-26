import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { Users, FileText } from 'lucide-react';
import { subscribeAllResidents } from '../../services/visitorService';
import { subscribeAllComplaints } from '../../services/complaintService';
import { subscribeVisitors } from '../../services/visitorService';

export default function AdminResidentsPage() {
    const [residents, setResidents] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [selectedResident, setSelectedResident] = useState(null);
    const [selectedResidentComplaints, setSelectedResidentComplaints] = useState([]);
    const [selectedResidentVisitors, setSelectedResidentVisitors] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
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
        setSelectedResidentComplaints(complaints.filter(c => c.residentId === resident.id));
        setSelectedResidentVisitors(visitors.filter(v => v.apartmentNumber === resident.apartmentNumber && v.status === 'exited'));
        setModalOpen(true);
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Resident Management</h1>
                <p className="text-sm text-slate-500 mt-2">View and manage all residents and their details</p>
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
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Email</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Apartment</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Type</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-800">Status</th>
                            <th className="text-center px-6 py-3 text-sm font-semibold text-slate-800">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {residents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-slate-500">No residents found</td>
                            </tr>
                        ) : (
                            residents.map(res => (
                                <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{res.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{res.email || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{res.apartmentNumber || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-medium capitalize">
                                            {res.occupancyType || 'Not specified'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 font-medium">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleViewResident(res)}
                                            className="text-sm px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            <Modal open={modalOpen && selectedResident} onClose={() => setModalOpen(false)}>
                <div className="w-full max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedResident?.name}</h2>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-slate-200">
                        <button
                            onClick={() => setModalTab('overview')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                modalTab === 'overview'
                                    ? 'border-b-2 border-mustard text-mustard'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setModalTab('complaints')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                modalTab === 'complaints'
                                    ? 'border-b-2 border-mustard text-mustard'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            Complaints ({selectedResidentComplaints.length})
                        </button>
                        <button
                            onClick={() => setModalTab('visitors')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                modalTab === 'visitors'
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
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg mt-4">
                                        <div>
                                            <div className="text-sm text-slate-500">Total Complaints</div>
                                            <div className="text-2xl font-bold text-amber-600 mt-1">{selectedResidentComplaints.length}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500">Visitor Visits</div>
                                            <div className="text-2xl font-bold text-blue-600 mt-1">{selectedResidentVisitors.length}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Complaints Tab */}
                            {modalTab === 'complaints' && (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {selectedResidentComplaints.length === 0 ? (
                                        <p className="text-slate-500 text-center py-6">No complaints</p>
                                    ) : (
                                        selectedResidentComplaints.map(c => (
                                            <div key={c.id} className="p-3 border border-slate-200 rounded-lg">
                                                <div className="font-medium text-slate-800">{c.title}</div>
                                                <div className="text-sm text-slate-600 mt-1">{c.description?.substring(0, 100)}</div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-slate-500 capitalize">{c.category}</span>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        c.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {c.status}
                                                    </span>
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
                                                <div className="font-medium text-slate-800">{v.name}</div>
                                                <div className="text-sm text-slate-600 mt-1">{v.phone}</div>
                                                <div className="text-xs text-slate-500 mt-2">
                                                    {v.entryTime?.seconds && new Date(v.entryTime.seconds * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-6 border-t border-slate-200 mt-6">
                                <button 
                                    onClick={() => setModalOpen(false)} 
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
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
