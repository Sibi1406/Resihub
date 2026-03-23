import {
    collection, addDoc, updateDoc, doc, query, where,
    onSnapshot, serverTimestamp, orderBy
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "lostFound";

function clientSort(data) {
    return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/**
 * Subscribe to ALL lost & found items (admin).
 */
export function subscribeAllLostFound(callback) {
    return onSnapshot(collection(db, COL), (snap) =>
        callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
    );
}

/**
 * Subscribe to items reported by a specific user (resident).
 */
export function subscribeMyLostFound(uid, callback) {
    const q = query(collection(db, COL), where("reportedBy", "==", uid));
    return onSnapshot(q, (snap) =>
        callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
    );
}

/**
 * Subscribe to all open lost or found items (for matching).
 */
export function subscribeOpenItems(callback) {
    const q = query(collection(db, COL), where("status", "==", "open"));
    return onSnapshot(q, (snap) =>
        callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
    );
}

/**
 * Add a new lost or found item.
 * @param {Object} data - { type:'lost'|'found', itemName, description, reportedBy, reportedByName, apartmentNumber }
 */
export async function addLostFoundItem(data) {
    return addDoc(collection(db, COL), {
        ...data,
        status: "open",
        matchedWith: null,
        aiMatchScore: null,
        aiMatchSuggestion: null,
        createdAt: serverTimestamp(),
    });
}

/**
 * Update item status (open | matched | closed).
 */
export async function updateItemStatus(id, status, matchedWith = null) {
    return updateDoc(doc(db, COL, id), {
        status,
        ...(matchedWith ? { matchedWith } : {}),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Confirm a match between two items (admin action).
 */
export async function confirmMatch(lostId, foundId) {
    await Promise.all([
        updateItemStatus(lostId, "matched", foundId),
        updateItemStatus(foundId, "matched", lostId),
    ]);
}

/**
 * Close / archive an item.
 */
export async function closeItem(id) {
    return updateDoc(doc(db, COL, id), { status: "closed", updatedAt: serverTimestamp() });
}
