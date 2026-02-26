import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { subscribeAllComplaints } from "../services/complaintService";
import { subscribeActiveEmergencies } from "../services/emergencyService";
import { subscribeVisitors } from "../services/visitorService";
import { getCurrentMonth, subscribePaymentStatus } from "../services/paymentService";

const AppContext = createContext(null);

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}

export function AppProvider({ children }) {
    const { user, role, userData } = useAuth();

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [globalComplaints, setGlobalComplaints] = useState([]);
    const [globalEmergencies, setGlobalEmergencies] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState(null); // null = loading
    const [paymentLoading, setPaymentLoading] = useState(true);

    // Subscribe to payment status for residents
    useEffect(() => {
        if (!user || role !== "resident") {
            setPaymentLoading(false);
            return;
        }
        const month = getCurrentMonth();
        const unsub = subscribePaymentStatus(user.uid, month, (payment) => {
            setPaymentStatus(payment);
            setPaymentLoading(false);
        });
        return unsub;
    }, [user, role]);

    // Subscribe to global data for admin
    useEffect(() => {
        if (!user || role !== "admin") return;
        const unsubComplaints = subscribeAllComplaints(setGlobalComplaints);
        const unsubEmergencies = subscribeActiveEmergencies(setGlobalEmergencies);
        return () => {
            unsubComplaints();
            unsubEmergencies();
        };
    }, [user, role]);

    const value = {
        unreadMessages,
        setUnreadMessages,
        globalComplaints,
        globalEmergencies,
        paymentStatus,
        paymentLoading,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
