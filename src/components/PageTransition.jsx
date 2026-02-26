import { motion } from "framer-motion";
import { pageVariants } from "../lib/motionVariants";

/**
 * Wraps any page content with a smooth fade+slide entrance animation.
 */
export default function PageTransition({ children, className = "" }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
}
