import {
    collection, addDoc, updateDoc, doc, query, where,
    orderBy, onSnapshot, serverTimestamp, Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

const COL = "complaints";

export function subscribeComplaints(filters, callback) {
    let q = query(collection(db, COL), orderBy("createdAt", "desc"));
    if (filters?.status) {
        q = query(collection(db, COL), where("status", "==", filters.status), orderBy("createdAt", "desc"));
    }
    if (filters?.raisedBy) {
        q = query(collection(db, COL), where("raisedBy", "==", filters.raisedBy), orderBy("createdAt", "desc"));
    }
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export function subscribeAllComplaints(callback) {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export async function addComplaint(data, imageFile) {
    let imageUrl = "";
    if (imageFile) {
        const storageRef = ref(storage, `complaints/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snap.ref);
    }
    return addDoc(collection(db, COL), {
        ...data,
        imageUrl,
        status: "pending",
        createdAt: serverTimestamp(),
        resolvedAt: null,
    });
}

export async function updateComplaintStatus(id, status) {
    const updates = { status };
    if (status === "resolved") {
        updates.resolvedAt = serverTimestamp();
    }
    return updateDoc(doc(db, COL, id), updates);
}
