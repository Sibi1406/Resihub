import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleGuard({ allowedRoles, children }) {
    const { role, loading } = useAuth();

    if (loading) return null;
    if (!role) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(role)) {
        const fallback = role === "admin" ? "/admin" : role === "security" ? "/security" : "/resident";
        return <Navigate to={fallback} replace />;
    }

    return children;
}

