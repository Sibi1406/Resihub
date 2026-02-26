import {
    collection, addDoc, updateDoc, doc, query, where,
    orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "visitors";

export function subscribeVisitors(filters, callback) {
    let constraints = [orderBy("entryTime", "desc")];
    if (filters?.apartmentNumber) {
        constraints = [where("apartmentNumber", "==", filters.apartmentNumber), ...constraints];
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
    return addDoc(collection(db, COL), {
        ...data,
        status: data.type === "preapproved" ? "preapproved" : "inside",
        entryTime: data.type === "preapproved" ? null : serverTimestamp(),
        exitTime: null,
        createdAt: serverTimestamp(),
    });
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
