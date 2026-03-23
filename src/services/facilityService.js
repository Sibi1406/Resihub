import {
    collection, addDoc, updateDoc, doc, query, where,
    onSnapshot, serverTimestamp, getDocs
} from "firebase/firestore";
import { db } from "./firebase";

// ── Collections ────────────────────────────────────────────────────────────
const FAC_COL = "facilities";
const BOOK_COL = "facilityBookings";

function clientSort(data) {
    return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// ── Facilities ─────────────────────────────────────────────────────────────
export function subscribeFacilities(callback) {
    return onSnapshot(collection(db, FAC_COL), (snap) =>
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((f) => f.active !== false))
    );
}

export function subscribeAllFacilities(callback) {
    return onSnapshot(collection(db, FAC_COL), (snap) =>
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
}

export async function addFacility(data) {
    return addDoc(collection(db, FAC_COL), { ...data, active: true, createdAt: serverTimestamp() });
}

export async function updateFacility(id, data) {
    return updateDoc(doc(db, FAC_COL, id), data);
}

// ── Bookings ───────────────────────────────────────────────────────────────
export function subscribeAllBookings(callback) {
    return onSnapshot(collection(db, BOOK_COL), (snap) =>
        callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
    );
}

export function subscribeMyBookings(uid, callback) {
    const q = query(collection(db, BOOK_COL), where("bookedBy", "==", uid));
    return onSnapshot(q, (snap) =>
        callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
    );
}

export function subscribeBookingsByFacilityAndDate(facilityId, date, callback) {
    const q = query(
        collection(db, BOOK_COL),
        where("facilityId", "==", facilityId),
        where("date", "==", date),
        where("status", "in", ["confirmed", "pending"])
    );
    return onSnapshot(q, (snap) =>
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
}

/**
 * Create a booking after checking for time-slot collision.
 * Returns { success, error? }
 */
export async function createBooking(data) {
    // Check collision: same facility, same date, overlapping time
    const q = query(
        collection(db, BOOK_COL),
        where("facilityId", "==", data.facilityId),
        where("date", "==", data.date),
        where("status", "in", ["confirmed", "pending"])
    );
    const snap = await getDocs(q);
    const existing = snap.docs.map((d) => d.data());

    // Simple overlap check: [startTime, endTime) as "HH:MM" strings
    const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const newStart = toMins(data.startTime);
    const newEnd = toMins(data.endTime);

    for (const b of existing) {
        const bs = toMins(b.startTime);
        const be = toMins(b.endTime);
        if (newStart < be && newEnd > bs) {
            return { success: false, error: "This time slot is already booked. Please choose a different time." };
        }
    }

    await addDoc(collection(db, BOOK_COL), {
        ...data,
        status: "confirmed",
        disciplineStrike: false,
        adminNote: "",
        createdAt: serverTimestamp(),
    });
    return { success: true };
}

export async function cancelBooking(id) {
    return updateDoc(doc(db, BOOK_COL, id), { status: "cancelled", updatedAt: serverTimestamp() });
}

export async function issueDisciplineStrike(id, adminNote) {
    return updateDoc(doc(db, BOOK_COL, id), {
        disciplineStrike: true,
        adminNote,
        status: "completed",
        updatedAt: serverTimestamp(),
    });
}

export async function markCompleted(id) {
    return updateDoc(doc(db, BOOK_COL, id), { status: "completed", updatedAt: serverTimestamp() });
}
