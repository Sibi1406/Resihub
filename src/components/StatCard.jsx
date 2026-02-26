import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "./AnimatedCounter";

const styleMap = {
    primary: { bg: "#FEF4DB", color: "#7A4E0A", border: "#F3E1B8", glow: "rgba(229,185,75,0.2)" },
    amber: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", glow: "rgba(180,83,9,0.15)" },
    emerald: { bg: "#ECFDF5", color: "#047857", border: "#BBF7D0", glow: "rgba(4,120,87,0.15)" },
    red: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA", glow: "rgba(185,28,28,0.15)" },
    blue: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", glow: "rgba(29,78,216,0.15)" },
    violet: { bg: "#F5F3FF", color: "#6D28D9", border: "#E9D5FF", glow: "rgba(109,40,217,0.15)" },
    warning: { bg: "#FEFCE8", color: "#A16207", border: "#FEF08A", glow: "rgba(161,98,7,0.15)" },
    green: { bg: "#ECFDF5", color: "#047857", border: "#BBF7D0", glow: "rgba(4,120,87,0.15)" },
};

export default function StatCard({ icon, label, value, color = "primary", subtext, onClick }) {
    const s = styleMap[color] || styleMap.primary;

    // 3D tilt on mouse move
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 20 });
    const springY = useSpring(y, { stiffness: 150, damping: 20 });
    const rotateX = useTransform(springY, [-0.5, 0.5], ["4deg", "-4deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-4deg", "4deg"]);

    function handleMouse(e) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        x.set(px);
        y.set(py);
    }

    function handleLeave() {
        x.set(0);
        y.set(0);
    }

    const isNumericValue = typeof value === "number";

    return (
        <motion.div
            ref={ref}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
            whileHover={{
                y: -5,
                boxShadow: `0 20px 40px ${s.glow}, 0 4px 12px rgba(16,24,40,0.08)`,
            }}
            whileTap={{ scale: 0.98 }}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            onClick={onClick}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`card rounded-xl p-5 relative overflow-hidden select-none ${onClick ? "cursor-pointer" : ""}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Animated top accent bar */}
            <motion.div
                className="absolute top-0 left-0 h-0.5 w-0"
                style={{ backgroundColor: s.color }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
            />

            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="section-label truncate mb-2">
                        {label}
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-slate-800 tabular-nums tracking-tight">
                        {isNumericValue ? (
                            <AnimatedCounter value={value} />
                        ) : (
                            value
                        )}
                    </p>
                    {subtext && (
                        <p className="text-xs text-slate-400 mt-1.5 truncate">{subtext}</p>
                    )}
                </div>
                <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 border"
                    style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                >
                    {icon}
                </motion.div>
            </div>
        </motion.div>
    );
}
