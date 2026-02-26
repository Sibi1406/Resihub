/**
 * ResiHub Motion Design System
 * Centralized animation variants for consistent micro-interactions
 */

// Page entrance variants
export const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// Stagger children container
export const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
};

// Card entrance (used inside stagger container)
export const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// Fade in up
export const fadeInUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// Fade in
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
};

// Scale in (for modals)
export const scaleIn = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// Slide in from right (chat messages)
export const slideInRight = {
    initial: { opacity: 0, x: 16, scale: 0.96 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

// Slide in from left
export const slideInLeft = {
    initial: { opacity: 0, x: -16, scale: 0.96 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

// Status badge pulse (for active emergencies)
export const badgePulse = {
    animate: {
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
    },
};

// Hover tilt card effect
export const hoverTiltProps = {
    whileHover: {
        y: -4,
        boxShadow: "0 16px 40px rgba(16,24,40,0.12)",
        transition: { duration: 0.2, ease: "easeOut" },
    },
    whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Button scale
export const buttonHover = {
    whileHover: { scale: 1.02, transition: { duration: 0.15 } },
    whileTap: { scale: 0.97, transition: { duration: 0.08 } },
};

// List item entrance
export const listItemVariants = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};
