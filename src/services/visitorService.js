import {
    collection, addDoc, updateDoc, doc, query, where,
    orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "visitors";

export function subscribeVisitors(filters, callback) {
    let constraints = [orderBy("entryTime", "desc")];
    const apt = filters?.apartmentNumber || filters?.ownApartment;
    if (apt) {
        constraints = [where("apartmentNumber", "==", apt), ...constraints];
    }
    if (filters?.status) {
        constraints = [where("status", "==", filters.status), ...constraints];
    }
    const q = query(collection(db, COL), ...constraints);
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export function subscribeActiveVisitors(callback) {
    const q = query(collection(db, COL), where("status", "==", "inside"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export async function addVisitor(data) {
    const entry = {
        ...data,
        visitorName: data.visitorName || data.name || "", // Align with admin dashboard
        residentName: data.residentName || data.createdByName || "", // Align with admin dashboard
        status: data.type === "informed" || data.type === "preapproved" ? "informed" : "inside",
        entryTime: (data.type === "informed" || data.type === "preapproved") ? null : serverTimestamp(),
        exitTime: null,
        createdAt: serverTimestamp(),
    };
    if (data.expectedDateTime) {
        // store as JS Date so Firestore will convert to Timestamp
        entry.expectedDateTime = data.expectedDateTime instanceof Date
            ? data.expectedDateTime
            : new Date(data.expectedDateTime);
    }
    return addDoc(collection(db, COL), entry);
}

export async function markEntry(id) {
    return updateDoc(doc(db, COL, id), {
        status: "inside",
        entryTime: serverTimestamp(),
    });
}

export async function markExit(id) {
    return updateDoc(doc(db, COL, id), {
        status: "exited",
        exitTime: serverTimestamp(),
    });
}

export function subscribeAllResidents(callback) {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}
