import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import {
    subscribeFacilities, subscribeMyBookings,
    subscribeBookingsByFacilityAndDate, createBooking, cancelBooking
} from "../../services/facilityService";
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_FACILITIES = [
    { id: "_clubhouse", name: "Clubhouse", emoji: "🏛️", description: "Large event hall for parties & gatherings", capacity: 100, openTime: "09:00", closeTime: "22:00", maxSlotHours: 4 },
    { id: "_gym", name: "Gym", emoji: "🏋️", description: "Fully equipped fitness centre", capacity: 10, openTime: "05:00", closeTime: "23:00", maxSlotHours: 2 },
    { id: "_badminton", name: "Badminton Court", emoji: "🏸", description: "Indoor badminton court (2 courts)", capacity: 8, openTime: "06:00", closeTime: "22:00", maxSlotHours: 2 },
    { id: "_swimming", name: "Swimming Pool", emoji: "🏊", description: "Olympic-size pool with changing rooms", capacity: 20, openTime: "06:00", closeTime: "20:00", maxSlotHours: 2 },
    { id: "_party", name: "Party Lawn", emoji: "🌿", description: "Open lawn area for outdoor events", capacity: 60, openTime: "09:00", closeTime: "21:00", maxSlotHours: 4 },
];

const STATUS_STYLE = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-gray-50 text-gray-500 border-gray-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
};

function generateTimeSlots(openTime, closeTime, slotDuration = 60) {
    const slots = [];
    const [oh, om] = openTime.split(":").map(Number);
    const [ch, cm] = closeTime.split(":").map(Number);
    let cur = oh * 60 + om;
    const end = ch * 60 + cm;
    while (cur + slotDuration <= end) {
        const startH = String(Math.floor(cur / 60)).padStart(2, "0");
        const startM = String(cur % 60).padStart(2, "0");
        const endMins = cur + slotDuration;
        const endH = String(Math.floor(endMins / 60)).padStart(2, "0");
        const endM = String(endMins % 60).padStart(2, "0");
        slots.push({ start: `${startH}:${startM}`, end: `${endH}:${endM}` });
        cur += slotDuration;
    }
    return slots;
}

export default function FacilityBookingPage() {
    const { user, userData } = useAuth();
    const [facilities, setFacilities] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [tab, setTab] = useState("book");
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [takenSlots, setTakenSlots] = useState([]);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [booking, setBooking] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const unsub1 = subscribeFacilities((facs) => {
            setFacilities(facs.length > 0 ? facs : DEFAULT_FACILITIES);
        });
        const unsub2 = subscribeMyBookings(user.uid, setMyBookings);
        return () => { unsub1(); unsub2(); };
    }, [user]);

    useEffect(() => {
        if (!selectedFacility || !selectedDate) { setTakenSlots([]); return; }
        return subscribeBookingsByFacilityAndDate(selectedFacility.id, selectedDate, setTakenSlots);
    }, [selectedFacility, selectedDate]);

    const handleBook = async () => {
        if (!bookingSlot) return;
        setBooking(true);
        const result = await createBooking({
            facilityId: selectedFacility.id,
            facilityName: selectedFacility.name,
            bookedBy: user.uid,
            bookedByName: userData?.name || "",
            apartmentNumber: userData?.apartmentNumber || "",
            date: selectedDate,
            startTime: bookingSlot.start,
            endTime: bookingSlot.end,
        });
        setBooking(false);
        if (result.success) {
            toast.success(`✅ Booked ${selectedFacility.name} on ${selectedDate} at ${bookingSlot.start}`);
            setBookingSlot(null);
            setSelectedFacility(null);
        } else {
            toast.error(result.error);
        }
    };

    const handleCancel = async (id) => {
        try {
            await cancelBooking(id);
            toast.success("Booking cancelled");
        } catch {
            toast.error("Failed to cancel");
        }
    };

    const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const isSlotTaken = (slot) => takenSlots.some(
        (b) => toMins(slot.start) < toMins(b.endTime) && toMins(slot.end) > toMins(b.startTime)
    );

    const strikeCount = myBookings.filter((b) => b.disciplineStrike).length;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Facility Booking</h1>
                <p className="text-sm text-slate-500 mt-1">Book shared facilities — slots are reserved in real-time</p>
                {strikeCount > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl w-fit">
                        <AlertTriangle className="w-4 h-4" />
                        You have {strikeCount} discipline strike{strikeCount > 1 ? "s" : ""}. Please adhere to facility rules.
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
                {[["book", "Book a Facility"], ["mybookings", "My Bookings"]].map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                            ${tab === id ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
                        style={tab === id ? { background: "linear-gradient(135deg, #E5B94B, #C97B1A)" } : {}}
                    >
                        {label}
                        {id === "mybookings" && myBookings.filter(b => b.status === "confirmed").length > 0 && (
                            <span className="ml-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                                {myBookings.filter(b => b.status === "confirmed").length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Book a Facility */}
            {tab === "book" && (
                <div className="space-y-6">
                    {/* Facility cards */}
                    {!selectedFacility ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {facilities.map((fac) => (
                                <button
                                    key={fac.id}
                                    onClick={() => { setSelectedFacility(fac); setSelectedDate(today); setBookingSlot(null); }}
                                    className="card p-5 text-left hover:border-[#E5B94B]/50 hover:shadow-md transition-all border border-transparent cursor-pointer"
                                >
                                    <div className="text-3xl mb-3">{fac.emoji || "🏛️"}</div>
                                    <h3 className="font-semibold text-slate-800">{fac.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-3">{fac.description}</p>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max {fac.capacity}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fac.openTime}–{fac.closeTime}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div>
                            {/* Back + facility info */}
                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => { setSelectedFacility(null); setBookingSlot(null); }}
                                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                                >
                                    ← Back
                                </button>
                                <span className="text-2xl">{selectedFacility.emoji || "🏛️"}</span>
                                <div>
                                    <h2 className="font-bold text-slate-800">{selectedFacility.name}</h2>
                                    <p className="text-xs text-slate-400">{selectedFacility.description}</p>
                                </div>
                            </div>

                            {/* Date picker */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                                <input
                                    type="date"
                                    min={today}
                                    value={selectedDate}
                                    onChange={(e) => { setSelectedDate(e.target.value); setBookingSlot(null); }}
                                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40"
                                />
                            </div>

                            {/* Time slots */}
                            {selectedDate && (
                                <>
                                    <p className="text-sm font-medium text-slate-700 mb-3">Available Time Slots</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-5">
                                        {generateTimeSlots(
                                            selectedFacility.openTime || "06:00",
                                            selectedFacility.closeTime || "22:00",
                                            60
                                        ).map((slot) => {
                                            const taken = isSlotTaken(slot);
                                            const selected = bookingSlot?.start === slot.start;
                                            return (
                                                <button
                                                    key={slot.start}
                                                    disabled={taken}
                                                    onClick={() => setBookingSlot(selected ? null : slot)}
                                                    className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer
                                                        ${taken ? "bg-red-50 border-red-100 text-red-300 cursor-not-allowed line-through"
                                                            : selected ? "border-[#E5B94B] bg-amber-50 text-[#7A4E0A] font-semibold"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-[#E5B94B] hover:bg-amber-50"}`}
                                                >
                                                    {slot.start}–{slot.end}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {bookingSlot && (
                                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                                            <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                            <p className="text-sm text-amber-800">
                                                Booking <strong>{selectedFacility.name}</strong> on <strong>{selectedDate}</strong> at <strong>{bookingSlot.start} – {bookingSlot.end}</strong>
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleBook}
                                        disabled={!bookingSlot || booking}
                                        className="px-6 py-2.5 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                                        style={{ background: "linear-gradient(135deg, #E5B94B, #C97B1A)" }}
                                    >
                                        {booking ? "Confirming…" : "Confirm Booking"}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* My Bookings */}
            {tab === "mybookings" && (
                <div className="space-y-3">
                    {myBookings.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">No bookings yet</p>
                        </div>
                    ) : myBookings.map((b) => (
                        <div key={b.id} className={`card p-4 border ${b.disciplineStrike ? "border-red-200 bg-red-50/20" : "border-slate-200"}`}>
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-slate-800">{b.facilityName}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLE[b.status] || ""}`}>
                                            {b.status}
                                        </span>
                                        {b.disciplineStrike && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Strike Issued
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        📅 {b.date} · ⏰ {b.startTime} – {b.endTime}
                                    </p>
                                    {b.adminNote && <p className="text-xs text-red-600 mt-1">Admin: {b.adminNote}</p>}
                                </div>
                                {b.status === "confirmed" && (
                                    <button
                                        onClick={() => handleCancel(b.id)}
                                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
