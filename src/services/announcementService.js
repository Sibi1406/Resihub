import {
    collection, addDoc, query, orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "announcements";

export function subscribeAnnouncements(callback) {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export async function addAnnouncement(data) {
    return addDoc(collection(db, COL), {
        ...data,
        createdAt: serverTimestamp(),
    });
}
