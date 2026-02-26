import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        setError("User profile not found. Contact admin.");
        setLoading(false);
        return;
      }
      const role = snap.data().role;
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "security") navigate("/security", { replace: true });
      else navigate("/resident", { replace: true });
    } catch {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-primary-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left brand panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 flex flex-col justify-center text-white">
          <h1 className="text-4xl font-bold tracking-tight">
            Resi<span className="text-primary-400">Hub</span>
          </h1>
          <p className="text-slate-300 mt-3 text-sm leading-relaxed">
            Residential Community Management System
          </p>
          <div className="mt-8 space-y-3">
            {["Smart Complaint Tracking", "Visitor Management", "Fund Transparency", "Emergency Alerts"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                {t}
              </div>
            ))}
          </div>
          <p className="mt-10 text-xs text-slate-500">Smart • Secure • Modern Living</p>
        </div>

        {/* Right form panel */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to your dashboard</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}