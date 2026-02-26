import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { Eye, EyeOff, Loader2, Building2, Shield, Users } from "lucide-react";

const features = [
  { icon: <Building2 className="w-4 h-4" />, label: "Smart Management" },
  { icon: <Shield className="w-4 h-4" />, label: "Secure Access" },
  { icon: <Users className="w-4 h-4" />, label: "Community First" },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        setError("User profile not found. Contact your administrator.");
        setLoading(false);
        return;
      }
      const role = snap.data().role;
      if (role === "admin") navigate("/admin");
      else if (role === "security") navigate("/security");
      else navigate("/resident");
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) {
        setError("Invalid email or password. Please try again.");
      } else if (code.includes("too-many-requests")) {
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setError("Login failed. Please check your connection.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-beige)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-64 h-64 rounded-full shape-float-1"
          style={{ background: "radial-gradient(circle, rgba(229,185,75,0.12) 0%, transparent 70%)", top: "5%", left: "-5%" }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full shape-float-2"
          style={{ background: "radial-gradient(circle, rgba(229,185,75,0.08) 0%, transparent 70%)", bottom: "-10%", right: "-5%" }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full shape-float-3"
          style={{ background: "radial-gradient(circle, rgba(229,185,75,0.1) 0%, transparent 70%)", top: "50%", right: "10%" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(#E5B94B 1px, transparent 1px), linear-gradient(90deg, #E5B94B 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.04)" }}
        >
          {/* Left Panel */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)" }}
          >
            {/* Background image overlay */}
            <div className="absolute inset-0"
              style={{
                backgroundImage: "url(https://images.unsplash.com/photo-1560184897-ae75f418493e?q=80&w=1400&auto=format&fit=crop)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.25,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-[#E5B94B]/20" />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative z-10"
            >
              <h1 className="text-3xl font-bold text-white">
                Resi<span style={{ color: "#E5B94B" }}>Hub</span>
              </h1>
              <p className="text-white/60 text-sm mt-1">Smart Residential Management</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative z-10"
            >
              <p className="text-white/80 text-lg font-medium leading-relaxed mb-6">
                Your all-in-one platform for modern residential community management.
              </p>
              <div className="space-y-2.5">
                {features.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#E5B94B]/20 border border-[#E5B94B]/30 flex items-center justify-center text-[#E5B94B]">
                      {f.icon}
                    </div>
                    <span className="text-white/70 text-sm">{f.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Panel — Form */}
          <div className="bg-white p-8 lg:p-10 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
            >
              {/* Mobile brand */}
              <div className="lg:hidden mb-6">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  Resi<span className="accent-mustard">Hub</span>
                </h1>
              </div>

              <h2 className="text-[var(--text-title)] font-bold text-slate-800 tracking-tight mb-1">Welcome back 👋</h2>
              <p className="text-slate-500 text-[var(--text-small)] mb-6">Sign in to your account to continue</p>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="form-label block mb-1.5">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@resihub.in"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[var(--text-body)] text-slate-800 placeholder-slate-400 input-ring"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="form-label block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[var(--text-body)] text-slate-800 placeholder-slate-400 input-ring pr-12"
                    />
                    <button
                      type="button"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[var(--touch-min)] min-h-[var(--touch-min)] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -4, height: 0 }}
                      className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01, boxShadow: "0 8px 24px rgba(229,185,75,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full min-h-[var(--touch-min)] py-3 rounded-xl text-[var(--text-body)] font-bold text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, var(--mustard) 0%, #C97B1A 100%)" }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in…
                    </>
                  ) : "Sign In →"}
                </motion.button>
              </form>

              {/* Demo hint */}
              <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[var(--text-caption)] text-slate-500 text-center font-medium">
                  Demo: <span className="text-slate-700">admin@resihub.in</span> · <span className="text-slate-700">priya@resihub.in</span>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-slate-400 mt-5"
        >
          © 2026 ResiHub · Smart Residential Management System
        </motion.p>
      </div>
    </div>
  );
}