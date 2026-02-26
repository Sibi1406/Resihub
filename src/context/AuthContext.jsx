import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("AuthStateChanged ->", firebaseUser);
            if (firebaseUser) {
                try {
                    const snap = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        console.log("userData loaded", data);
                        setUser(firebaseUser);
                        setRole(data.role);
                        setUserData(data);
                    } else {
                        console.warn("no user document for", firebaseUser.uid);
                        setUser(null);
                        setRole(null);
                        setUserData(null);
                    }
                } catch (e) {
                    console.error("failed to load user doc", e);
                    setUser(null);
                    setRole(null);
                    setUserData(null);
                }
            } else {
                console.log("user signed out");
                setUser(null);
                setRole(null);
                setUserData(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
        setUserData(null);
    };

    // helper to update profile fields both in Firestore and local state
    const updateUserData = async (updates) => {
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, updates);
            setUserData(prev => ({ ...prev, ...updates }));
        } catch (err) {
            console.error("Failed to update user data", err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, userData, loading, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
}
