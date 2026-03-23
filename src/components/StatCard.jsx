import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "./AnimatedCounter";

const styleMap = {
    primary: { bg: "rgba(124,174,142,0.10)", color: "#5B9471", border: "rgba(124,174,142,0.15)", glow: "rgba(124,174,142,0.15)" },
    amber: { bg: "rgba(251,191,36,0.08)", color: "#FBBF24", border: "rgba(251,191,36,0.1)", glow: "rgba(251,191,36,0.15)" },
    emerald: { bg: "rgba(16,185,129,0.08)", color: "#10B981", border: "rgba(16,185,129,0.1)", glow: "rgba(16,185,129,0.15)" },
    red: { bg: "rgba(239,68,68,0.08)", color: "#EF4444", border: "rgba(239,68,68,0.1)", glow: "rgba(239,68,68,0.15)" },
    blue: { bg: "rgba(59,130,246,0.08)", color: "#3B82F6", border: "rgba(59,130,246,0.1)", glow: "rgba(59,130,246,0.15)" },
    violet: { bg: "rgba(139,92,246,0.08)", color: "#8B5CF6", border: "rgba(139,92,246,0.1)", glow: "rgba(139,92,246,0.15)" },
    warning: { bg: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "rgba(245,158,11,0.1)", glow: "rgba(245,158,11,0.15)" },
    green: { bg: "rgba(16,185,129,0.08)", color: "#10B981", border: "rgba(16,185,129,0.1)", glow: "rgba(16,185,129,0.15)" },
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
                boxShadow: `0 16px 32px ${s.glow}, 0 4px 12px rgba(0,0,0,0.08)`,
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
                    <p className="text-3xl md:text-4xl font-bold tabular-nums tracking-tight" style={{ color: "#1A1D23" }}>
                        {isNumericValue ? (
                            <AnimatedCounter value={value} />
                        ) : (
                            value
                        )}
                    </p>
                    {subtext && (
                        <p className="text-xs mt-1.5 truncate" style={{ color: "#9CA3AF" }}>{subtext}</p>
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
