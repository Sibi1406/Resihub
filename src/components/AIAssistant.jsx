import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Paperclip, Bot, Loader2, ImageIcon } from "lucide-react";

const API_KEY = "AIzaSyBLWVKrEN6KuvOjDLEO1ESItCMS0q-iOXo";
const genAI = new GoogleGenerativeAI(API_KEY);

async function fileToGenerativePart(file) {
    const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
    });
    return { inlineData: { data: base64, mimeType: file.type } };
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1 py-1">
            {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#bba03d]"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

// Simple markdown-like renderer: bold **text**, newlines, numbered lists
function MessageText({ text }) {
    const lines = text.split("\n");
    return (
        <div className="space-y-0.5">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-1" />;
                // Bold: **text**
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={i} className="leading-relaxed">
                        {parts.map((p, j) =>
                            j % 2 === 1 ? <strong key={j}>{p}</strong> : p
                        )}
                    </p>
                );
            })}
        </div>
    );
}

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: "bot",
            text: "Hi! 👋 I'm your **ResiHub AI Maintenance Assistant**.\n\nDescribe your issue or upload a photo (e.g. a leak, crack, or electrical problem) and I'll help you troubleshoot it.",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const bottomRef = useRef(null);
    const fileRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setHasNew(false);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [messages, isOpen]);

    // Pulse the FAB when a new bot message arrives and chat is closed
    useEffect(() => {
        if (!isOpen && messages.length > 1 && messages[messages.length - 1].role === "bot") {
            setHasNew(true);
        }
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text && !image) return;
        if (loading) return;

        const userMsg = { role: "user", text: text || "Analyzing uploaded image…", hasImage: !!image };
        setMessages((p) => [...p, userMsg]);
        setLoading(true);
        setInput("");
        const capturedImage = image;
        setImage(null);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `You are the ResiHub Residential Maintenance Expert AI assistant embedded inside a residential society management app.

Resident's query: "${text || "Please analyze the image attached."}"

Instructions:
1. If an image is provided, carefully analyze and describe the visible issue.
2. Provide a concise technical assessment.
3. Give 2–3 clear, actionable DIY steps the resident can try immediately.
4. State clearly whether a professional (plumber, electrician, etc.) is required.
5. Be friendly, professional, and concise. Use simple language.
6. Format your response with **bold** for key points.`;

            let result;
            if (capturedImage) {
                const imagePart = await fileToGenerativePart(capturedImage);
                result = await model.generateContent([prompt, imagePart]);
            } else {
                result = await model.generateContent(prompt);
            }

            setMessages((p) => [...p, { role: "bot", text: result.response.text() }]);
        } catch {
            setMessages((p) => [
                ...p,
                { role: "bot", text: "⚠️ Connection error. Please check your internet connection and try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={() => { setIsOpen((o) => !o); setHasNew(false); }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                aria-label="AI Maintenance Assistant"
                style={{
                    position: "fixed",
                    bottom: "28px",
                    right: "28px",
                    width: "58px",
                    height: "58px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #E5B94B 0%, #C97B1A 100%)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(201,123,26,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1050,
                    overflow: "visible",
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X className="w-5 h-5 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <Bot className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Unread badge */}
                <AnimatePresence>
                    {hasNew && !isOpen && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            style={{
                                position: "absolute",
                                top: "-3px",
                                right: "-3px",
                                width: "14px",
                                height: "14px",
                                borderRadius: "50%",
                                background: "#ef4444",
                                border: "2px solid white",
                            }}
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        style={{
                            position: "fixed",
                            bottom: "100px",
                            right: "28px",
                            width: "360px",
                            height: "530px",
                            background: "#ffffff",
                            borderRadius: "20px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(201,123,26,0.12)",
                            display: "flex",
                            flexDirection: "column",
                            border: "1px solid rgba(229,185,75,0.2)",
                            zIndex: 1049,
                            overflow: "hidden",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, #E5B94B 0%, #C97B1A 100%)",
                                padding: "14px 18px",
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div
                                    style={{
                                        width: "34px", height: "34px", borderRadius: "10px",
                                        background: "rgba(255,255,255,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Bot style={{ width: "18px", height: "18px", color: "white" }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: "700", fontSize: "14px", color: "white", margin: 0, lineHeight: 1.2 }}>
                                        ResiHub AI Assistant
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#bbf7d0", display: "inline-block" }} />
                                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)" }}>Maintenance Expert · Powered by Gemini</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                background: "#fdfcf8",
                                scrollbarWidth: "thin",
                                scrollbarColor: "#e2d9c2 transparent",
                            }}
                        >
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                                        maxWidth: "88%",
                                    }}
                                >
                                    {m.role === "bot" && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                            <div style={{
                                                width: "18px", height: "18px", borderRadius: "5px",
                                                background: "linear-gradient(135deg, #E5B94B, #C97B1A)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <Bot style={{ width: "10px", height: "10px", color: "white" }} />
                                            </div>
                                            <span style={{ fontSize: "10px", fontWeight: "600", color: "#92804a" }}>AI Assistant</span>
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            padding: "10px 14px",
                                            borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            fontSize: "13px",
                                            lineHeight: "1.55",
                                            background: m.role === "user"
                                                ? "linear-gradient(135deg, #E5B94B, #C97B1A)"
                                                : "#ffffff",
                                            color: m.role === "user" ? "#ffffff" : "#374151",
                                            border: m.role === "user" ? "none" : "1px solid #f0e8d0",
                                            boxShadow: m.role === "user"
                                                ? "0 2px 8px rgba(201,123,26,0.25)"
                                                : "0 1px 4px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        {m.hasImage && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px", opacity: 0.85, fontSize: "11px" }}>
                                                <ImageIcon style={{ width: "12px", height: "12px" }} />
                                                <span>Image attached</span>
                                            </div>
                                        )}
                                        <MessageText text={m.text} />
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div style={{ alignSelf: "flex-start", maxWidth: "88%" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                        <div style={{
                                            width: "18px", height: "18px", borderRadius: "5px",
                                            background: "linear-gradient(135deg, #E5B94B, #C97B1A)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <Loader2 style={{ width: "10px", height: "10px", color: "white", animation: "spin 1s linear infinite" }} />
                                        </div>
                                        <span style={{ fontSize: "10px", fontWeight: "600", color: "#92804a" }}>AI Assistant</span>
                                    </div>
                                    <div style={{
                                        padding: "10px 14px",
                                        borderRadius: "16px 16px 16px 4px",
                                        background: "#ffffff",
                                        border: "1px solid #f0e8d0",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                                    }}>
                                        <TypingDots />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Image preview strip */}
                        <AnimatePresence>
                            {image && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{
                                        padding: "8px 14px",
                                        background: "#fffbf0",
                                        borderTop: "1px solid #f0e8d0",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        fontSize: "12px",
                                        color: "#6b5c2e",
                                        flexShrink: 0,
                                    }}
                                >
                                    <ImageIcon style={{ width: "13px", height: "13px", flexShrink: 0, color: "#C97B1A" }} />
                                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {image.name}
                                    </span>
                                    <button
                                        onClick={() => setImage(null)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", flexShrink: 0 }}
                                    >
                                        <X style={{ width: "13px", height: "13px" }} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div
                            style={{
                                padding: "12px 14px",
                                borderTop: "1px solid #f0e8d0",
                                background: "#ffffff",
                                flexShrink: 0,
                                display: "flex",
                                gap: "8px",
                                alignItems: "flex-end",
                            }}
                        >
                            {/* Upload image */}
                            <button
                                onClick={() => fileRef.current?.click()}
                                title="Attach photo"
                                style={{
                                    width: "36px", height: "36px",
                                    borderRadius: "10px",
                                    border: "1px solid #e5e7eb",
                                    background: "#f9fafb",
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                    color: image ? "#C97B1A" : "#9ca3af",
                                    transition: "all 0.15s",
                                }}
                            >
                                <Paperclip style={{ width: "16px", height: "16px" }} />
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                ref={fileRef}
                                onChange={(e) => setImage(e.target.files[0] || null)}
                            />

                            {/* Text input */}
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    // Auto-grow up to 3 rows
                                    e.target.style.height = "auto";
                                    e.target.style.height = Math.min(e.target.scrollHeight, 72) + "px";
                                }}
                                onKeyDown={handleKey}
                                placeholder="Describe your issue…"
                                style={{
                                    flex: 1,
                                    padding: "9px 12px",
                                    borderRadius: "10px",
                                    border: "1px solid #e5e7eb",
                                    fontSize: "13px",
                                    outline: "none",
                                    resize: "none",
                                    lineHeight: "1.4",
                                    fontFamily: "inherit",
                                    background: "#f9fafb",
                                    color: "#374151",
                                    transition: "border-color 0.15s, box-shadow 0.15s",
                                    maxHeight: "72px",
                                    overflowY: "auto",
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#E5B94B";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(229,185,75,0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e5e7eb";
                                    e.target.style.boxShadow = "none";
                                }}
                            />

                            {/* Send */}
                            <motion.button
                                onClick={handleSend}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loading || (!input.trim() && !image)}
                                style={{
                                    width: "36px", height: "36px",
                                    borderRadius: "10px",
                                    border: "none",
                                    background: loading || (!input.trim() && !image)
                                        ? "#e5e7eb"
                                        : "linear-gradient(135deg, #E5B94B, #C97B1A)",
                                    cursor: loading || (!input.trim() && !image) ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                    transition: "all 0.15s",
                                }}
                            >
                                {loading
                                    ? <Loader2 style={{ width: "16px", height: "16px", color: "white", animation: "spin 1s linear infinite" }} />
                                    : <Send style={{ width: "15px", height: "15px", color: loading || (!input.trim() && !image) ? "#9ca3af" : "white" }} />
                                }
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
    );
}
