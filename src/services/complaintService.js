import {
    collection, addDoc, updateDoc, doc, query, where,
    onSnapshot, serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

const COL = "complaints";

function clientSort(data) {
    return data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export function subscribeComplaints(filters, callback) {
    const constraints = [];
    if (filters?.status && filters.status !== "all") {
        constraints.push(where("status", "==", filters.status));
    }
    if (filters?.raisedBy) {
        constraints.push(where("raisedBy", "==", filters.raisedBy));
    }
    const q = query(collection(db, COL), ...constraints);
    return onSnapshot(q, {
        next: (snap) => callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() })))),
        error: (err) => console.error("Firestore Subscribe Error:", err),
    });
}

export function subscribeAllComplaints(callback) {
    return onSnapshot(collection(db, COL), (snap) =>
        callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
    );
}

export function subscribeUserComplaints(residentId, callback) {
    const q = query(collection(db, COL), where("raisedBy", "==", residentId));
    return onSnapshot(q, (snap) =>
        callback(clientSort(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
    );
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
        aiCategorized: data.aiCategorized ?? false,
        createdAt: serverTimestamp(),
        resolvedAt: null,
    });
}

export async function updateComplaintStatus(id, status) {
    const updates = { status };
    if (status === "resolved") updates.resolvedAt = serverTimestamp();
    return updateDoc(doc(db, COL, id), updates);
}
