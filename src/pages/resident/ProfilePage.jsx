import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { storage } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    User, Mail, Phone, MapPin, Users, Edit3, Save, X,
    Camera, AlertTriangle, Plus, Trash2, Home
} from "lucide-react";
import toast from "react-hot-toast";

// ── Field component ───────────────────────────────────────────
function Field({ label, value, editing, name, onChange, type = "text", placeholder = "" }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</label>
            {editing ? (
                <input
                    type={type}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    placeholder={placeholder || label}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
            ) : (
                <div className="text-sm text-slate-800 font-medium py-1">{value || <span className="text-slate-400 italic">Not set</span>}</div>
            )}
        </div>
    );
}

// ── Section header ────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = "#C97B1A" }) {
    return (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}>
                <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
    );
}

// ── Member Row ────────────────────────────────────────────────
function MemberRow({ member, index, editing, onChange, onRemove }) {
    return (
        <div className="grid grid-cols-3 gap-2 items-center">
            <input
                value={member.name || ""}
                onChange={(e) => onChange(index, "name", e.target.value)}
                disabled={!editing}
                placeholder="Name"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-white disabled:border-transparent disabled:px-0"
            />
            <input
                value={member.relation || ""}
                onChange={(e) => onChange(index, "relation", e.target.value)}
                disabled={!editing}
                placeholder="Relation"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-white disabled:border-transparent disabled:px-0"
            />
            <div className="flex items-center gap-1">
                <input
                    value={member.age || ""}
                    onChange={(e) => onChange(index, "age", e.target.value)}
                    disabled={!editing}
                    placeholder="Age"
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-white disabled:border-transparent disabled:px-0"
                />
                {editing && (
                    <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────
export default function ResidentProfilePage() {
    const { user, userData, updateUserData } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        native: "",
        ownerName: "",
        ownerPhone: "",
        ownerEmail: "",
        emergencyContact: "",
        emergencyPhone: "",
        emergencyRelation: "",
        members: [],
        photoURL: "",
    });

    // Sync from userData when it loads
    useEffect(() => {
        if (userData) {
            setForm({
                name: userData.name || "",
                phone: userData.phone || "",
                email: userData.email || user?.email || "",
                native: userData.native || "",
                ownerName: userData.ownerName || "",
                ownerPhone: userData.ownerPhone || "",
                ownerEmail: userData.ownerEmail || "",
                emergencyContact: userData.emergencyContact || "",
                emergencyPhone: userData.emergencyPhone || "",
                emergencyRelation: userData.emergencyRelation || "",
                members: userData.members || [],
                photoURL: userData.photoURL || "",
            });
        }
    }, [userData, user]);

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    // ── Member helpers ────────────────────────────────────────
    const addMember = () =>
        setForm((p) => ({ ...p, members: [...p.members, { name: "", relation: "", age: "" }] }));

    const updateMember = (i, field, val) =>
        setForm((p) => {
            const m = [...p.members];
            m[i] = { ...m[i], [field]: val };
            return { ...p, members: m };
        });

    const removeMember = (i) =>
        setForm((p) => ({ ...p, members: p.members.filter((_, idx) => idx !== i) }));

    // ── Photo upload ──────────────────────────────────────────
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const storageRef = ref(storage, `profile-photos/${user.uid}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setForm((p) => ({ ...p, photoURL: url }));
            await updateUserData({ photoURL: url });
            toast.success("Profile photo updated!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload photo");
        } finally {
            setUploading(false);
        }
    };

    // ── Save ──────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserData({
                name: form.name,
                phone: form.phone,
                native: form.native,
                ownerName: form.ownerName,
                ownerPhone: form.ownerPhone,
                ownerEmail: form.ownerEmail,
                emergencyContact: form.emergencyContact,
                emergencyPhone: form.emergencyPhone,
                emergencyRelation: form.emergencyRelation,
                members: form.members,
                photoURL: form.photoURL,
            });
            toast.success("Profile saved successfully!");
            setEditing(false);
        } catch {
            toast.error("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset to stored data
        if (userData) {
            setForm({
                name: userData.name || "",
                phone: userData.phone || "",
                email: userData.email || user?.email || "",
                native: userData.native || "",
                ownerName: userData.ownerName || "",
                ownerPhone: userData.ownerPhone || "",
                ownerEmail: userData.ownerEmail || "",
                emergencyContact: userData.emergencyContact || "",
                emergencyPhone: userData.emergencyPhone || "",
                emergencyRelation: userData.emergencyRelation || "",
                members: userData.members || [],
                photoURL: userData.photoURL || "",
            });
        }
        setEditing(false);
    };

    const initials = form.name
        ? form.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
        : "R";

    return (
        <DashboardLayout>
            {/* ── Page header ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your personal and household details</p>
                </div>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                                style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Saving…" : "Save Profile"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                            style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                        >
                            <Edit3 className="w-4 h-4" /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left: Photo + apartment ──────────────── */}
                <div className="card p-6 flex flex-col items-center text-center">
                    {/* Profile Photo */}
                    <div className="relative mb-4">
                        {form.photoURL ? (
                            <img
                                src={form.photoURL}
                                alt="Profile"
                                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-200 shadow-lg"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-[#7A4E0A] shadow-lg"
                                style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}>
                                {initials}
                            </div>
                        )}
                        {/* Camera overlay button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md transition-all hover:scale-110"
                            style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                            title="Change photo"
                        >
                            {uploading ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Camera className="w-4 h-4" />
                            )}
                        </button>
                        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handlePhotoUpload} />
                    </div>

                    <h2 className="text-lg font-bold text-slate-800 mt-2">{form.name || "Resident"}</h2>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        Resident
                    </span>

                    <div className="w-full mt-6 space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                            <Home className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <div className="text-left">
                                <div className="text-xs text-slate-400">Apartment</div>
                                <div className="font-bold text-slate-800">{userData?.apartmentNumber || "—"}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                            <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <div className="text-left">
                                <div className="text-xs text-slate-400">Household Members</div>
                                <div className="font-bold text-slate-800">{form.members.length || 0} members</div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                            Member since {userData?.createdAt?.toDate?.()?.toLocaleDateString("en-IN", { year: "numeric", month: "short" }) || "—"}
                        </div>
                    </div>
                </div>

                {/* ── Right: Detail sections ───────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Resident Details */}
                    <div className="card p-6">
                        <SectionHeader icon={User} title="Resident Details" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Full Name" value={form.name} name="name" editing={editing} onChange={handleChange} placeholder="Your full name" />
                            <Field label="Phone Number" value={form.phone} name="phone" editing={editing} onChange={handleChange} type="tel" placeholder="+91 XXXXX XXXXX" />
                            <Field label="Email Address" value={form.email || user?.email} name="email" editing={false} onChange={handleChange} />
                            <Field label="Native / Hometown" value={form.native} name="native" editing={editing} onChange={handleChange} placeholder="City, State" />
                        </div>
                    </div>

                    {/* Owner Details */}
                    <div className="card p-6">
                        <SectionHeader icon={Home} title="Owner Details" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Owner Name" value={form.ownerName} name="ownerName" editing={editing} onChange={handleChange} placeholder="Property owner's name" />
                            <Field label="Owner Phone" value={form.ownerPhone} name="ownerPhone" editing={editing} onChange={handleChange} type="tel" placeholder="+91 XXXXX XXXXX" />
                            <Field label="Owner Email" value={form.ownerEmail} name="ownerEmail" editing={editing} onChange={handleChange} type="email" placeholder="owner@example.com" />
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="card p-6">
                        <SectionHeader icon={AlertTriangle} title="Emergency Contact" color="#EF4444" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Contact Name" value={form.emergencyContact} name="emergencyContact" editing={editing} onChange={handleChange} placeholder="Emergency person's name" />
                            <Field label="Phone Number" value={form.emergencyPhone} name="emergencyPhone" editing={editing} onChange={handleChange} type="tel" placeholder="+91 XXXXX XXXXX" />
                            <Field label="Relation" value={form.emergencyRelation} name="emergencyRelation" editing={editing} onChange={handleChange} placeholder="e.g. Father, Spouse" />
                        </div>
                    </div>

                    {/* Household Members */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 flex-1">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}>
                                    <Users className="w-4 h-4 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-slate-800">Household Members</h3>
                                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                    {form.members.length}
                                </span>
                            </div>
                            {editing && (
                                <button
                                    onClick={addMember}
                                    className="ml-4 flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shadow-sm"
                                    style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Member
                                </button>
                            )}
                        </div>

                        {form.members.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-sm">
                                {editing ? "Click \"Add Member\" to add household members" : "No household members added yet"}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Header row */}
                                <div className="grid grid-cols-3 gap-2 px-1">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Name</span>
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Relation</span>
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Age</span>
                                </div>
                                {form.members.map((m, i) => (
                                    <MemberRow
                                        key={i}
                                        member={m}
                                        index={i}
                                        editing={editing}
                                        onChange={updateMember}
                                        onRemove={removeMember}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
