import {
    collection, addDoc, query, orderBy,
    onSnapshot, serverTimestamp, limit, doc, setDoc, getDoc
} from "firebase/firestore";
import { db } from "./firebase";

const CHATS_COL = "chats";
const MESSAGES_COL = "messages";

/**
 * Subscribe to all community chat channels.
 */
export function subscribeChats(callback) {
    const q = query(collection(db, CHATS_COL), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

/**
 * Subscribe to messages in a specific chat channel (real-time).
 */
export function subscribeMessages(chatId, callback, msgLimit = 50) {
    const q = query(
        collection(db, CHATS_COL, chatId, MESSAGES_COL),
        orderBy("sentAt", "asc"),
        limit(msgLimit)
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

/**
 * Send a message to a community chat channel.
 */
export async function sendMessage(chatId, userId, userName, text, role = "resident") {
    if (!text.trim()) return;
    const msg = {
        text: text.trim(),
        userId,
        userName,
        role,
        sentAt: serverTimestamp(),
    };
    await addDoc(collection(db, CHATS_COL, chatId, MESSAGES_COL), msg);

    // Update last message on the chat doc
    const chatRef = doc(db, CHATS_COL, chatId);
    await setDoc(chatRef, {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
        lastSenderName: userName,
    }, { merge: true });
}

/**
 * Ensure the general community chat channel exists.
 */
export async function ensureGeneralChat() {
    const chatRef = doc(db, CHATS_COL, "general");
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
        await setDoc(chatRef, {
            id: "general",
            name: "Community Chat",
            description: "General community discussion for all residents",
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastMessageAt: serverTimestamp(),
        });
    }
    return "general";
}
