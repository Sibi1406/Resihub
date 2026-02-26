import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F5EFE6]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#E5B94B]/30 border-t-[#E5B94B] rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium tracking-wide">Loading ResiHub...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    return children;
}
