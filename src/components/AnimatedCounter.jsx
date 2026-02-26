import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Animated number counter that counts up from 0 to the target value.
 */
export default function AnimatedCounter({ value, prefix = "", suffix = "", className = "" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { duration: 800, bounce: 0 });
    const [display, setDisplay] = useState("0");

    useEffect(() => {
        if (inView) {
            const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, "")) || 0;
            motionValue.set(numericValue);
        }
    }, [inView, value, motionValue]);

    useEffect(() => {
        const unsub = springValue.on("change", (v) => {
            const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, "")) || 0;
            if (numericValue === Math.floor(numericValue)) {
                setDisplay(Math.floor(v).toLocaleString());
            } else {
                setDisplay(v.toFixed(1));
            }
        });
        return unsub;
    }, [springValue, value]);

    // For non-numeric values, just show them directly
    const isNumeric = typeof value === "number" || !isNaN(parseFloat(String(value).replace(/[^0-9.-]/g, "")));

    return (
        <span ref={ref} className={className}>
            {prefix}{isNumeric ? display : value}{suffix}
        </span>
    );
}
