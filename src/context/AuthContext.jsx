import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
            if (firebaseUser) {
                try {
                    const snap = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        setUser(firebaseUser);
                        setRole(data.role);
                        setUserData(data);
                    } else {
                        setUser(null);
                        setRole(null);
                        setUserData(null);
                    }
                } catch {
                    setUser(null);
                    setRole(null);
                    setUserData(null);
                }
            } else {
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

    return (
        <AuthContext.Provider value={{ user, role, userData, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
