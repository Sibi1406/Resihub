import {
    collection, addDoc, updateDoc, doc, query,
    orderBy, onSnapshot, serverTimestamp, where
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "emergencies";

export function subscribeEmergencies(callback) {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export function subscribeActiveEmergencies(callback) {
    const q = query(collection(db, COL), where("status", "==", "active"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export async function raiseEmergency(data) {
    return addDoc(collection(db, COL), {
        ...data,
        status: "active",
        createdAt: serverTimestamp(),
        resolvedAt: null,
    });
}

export async function resolveEmergency(id) {
    return updateDoc(doc(db, COL, id), {
        status: "resolved",
        resolvedAt: serverTimestamp(),
    });
}
