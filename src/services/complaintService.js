import {
    collection, addDoc, updateDoc, doc, query, where,
    orderBy, onSnapshot, serverTimestamp, Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

const COL = "complaints";

export function subscribeComplaints(filters, callback) {
    let q = collection(db, COL);

    const constraints = [];
    if (filters?.status && filters.status !== 'all') {
        constraints.push(where("status", "==", filters.status));
    }
    if (filters?.raisedBy) {
        constraints.push(where("raisedBy", "==", filters.raisedBy));
    }

    // Always sort by createdAt - Removing Firestore orderBy to avoid composite index requirement
    // constraints.push(orderBy("createdAt", "desc"));

    const finalQuery = query(q, ...constraints);

    return onSnapshot(finalQuery, {
        next: (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Sort client-side to avoid "Missing Index" errors in Firestore
            data.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
            callback(data);
        },
        error: (err) => {
            console.error("Firestore Subscribe Error:", err);
        }
    });
}

export function subscribeAllComplaints(callback) {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export function subscribeUserComplaints(residentId, callback) {
    const q = query(collection(db, COL), where("raisedBy", "==", residentId), orderBy("createdAt", "desc"));
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
