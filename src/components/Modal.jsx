import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { scaleIn } from "../lib/motionVariants";

export default function Modal({ open, onClose, title, children }) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />
                    {/* Modal panel */}
                    <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
                        <motion.div
                            variants={scaleIn}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/98 backdrop-blur-sm rounded-t-2xl z-10">
                                <h2 id="modal-title" className="text-[var(--text-title)] font-bold text-slate-800 tracking-tight">{title}</h2>
                                <motion.button
                                    type="button"
                                    aria-label="Close"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={onClose}
                                    className="min-w-[var(--touch-min)] min-h-[var(--touch-min)] w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>
                            {/* Body */}
                            <div className="px-6 py-5">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
