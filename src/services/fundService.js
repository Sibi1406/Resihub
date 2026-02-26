import {
    collection, addDoc, query, where, orderBy,
    onSnapshot, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "funds";

export function subscribeFunds(month, callback) {
    let q;
    if (month) {
        q = query(collection(db, COL), where("month", "==", month), orderBy("createdAt", "desc"));
    } else {
        q = query(collection(db, COL), orderBy("createdAt", "desc"));
    }
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

export async function addFundEntry(data) {
    return addDoc(collection(db, COL), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export function calculateSummary(entries) {
    let income = 0;
    let expense = 0;
    entries.forEach((e) => {
        if (e.type === "income") income += Number(e.amount) || 0;
        else expense += Number(e.amount) || 0;
    });
    return { income, expense, balance: income - expense };
}
