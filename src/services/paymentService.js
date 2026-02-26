import {
    collection, doc, query, where,
    onSnapshot, setDoc, serverTimestamp, getDoc
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "payments";

/**
 * Subscribe to the current user's payment for a specific month.
 * @param {string} userId
 * @param {string} month  - "YYYY-MM" format
 * @param {function} callback
 */
export function subscribePaymentStatus(userId, month, callback) {
    const q = query(
        collection(db, COL),
        where("userId", "==", userId),
        where("month", "==", month)
    );
    return onSnapshot(q, (snap) => {
        if (snap.empty) {
            callback(null);
        } else {
            const d = snap.docs[0];
            callback({ id: d.id, ...d.data() });
        }
    });
}

/**
 * Subscribe to all payments (admin view), optionally filtered by month.
 */
export function subscribeAllPayments(month, callback) {
    let q;
    if (month) {
        q = query(collection(db, COL), where("month", "==", month));
    } else {
        q = query(collection(db, COL));
    }
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

/**
 * Subscribe to a user's full payment history (all months).
 */
export function subscribeUserPayments(userId, callback) {
    const q = query(collection(db, COL), where("userId", "==", userId));
    return onSnapshot(q, (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by month descending
        docs.sort((a, b) => b.month.localeCompare(a.month));
        callback(docs);
    });
}

/**
 * Mark a payment as paid (admin action or via system).
 */
export async function markPaymentPaid(userId, month, amount, residentName, apartmentNumber) {
    const docId = `${userId}_${month}`;
    await setDoc(doc(db, COL, docId), {
        userId,
        month,
        amount: amount || 2500,
        status: "paid",
        residentName: residentName || "",
        apartmentNumber: apartmentNumber || "",
        paidAt: serverTimestamp(),
        dueDate: `${month}-05`,
    }, { merge: true });
}

/**
 * Get current month string "YYYY-MM"
 */
export function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get due date for a given month (5th of that month)
 */
export function getDueDate(month) {
    return `${month}-05`;
}
