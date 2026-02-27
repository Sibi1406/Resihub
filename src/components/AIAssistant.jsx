import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, Paperclip, ImageIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  GEMINI SETUP
// ─────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are ResiHub AI Assistant — a friendly, helpful residential society support chatbot embedded inside the ResiHub app.

Your personality:
- Warm, professional and concise
- Use emojis sparingly but effectively
- Format responses with **bold** for key points
- Keep answers under 150 words unless the issue needs detail

You help residents with:

MAINTENANCE ISSUES:
- Water leaks → Turn off main valve, place bucket, file complaint, call plumber +91-9876543210
- No water supply → Check valve, see Announcements, contact admin
- Power cuts → Check circuit breaker, call electrician +91-9123456780, BESCOM: 1912
- Electrical hazards/sparks → Turn off breaker, evacuate, call 101 (Fire)
- AC not working → Check filter, file complaint, tech visits in 24-48hrs
- Clogged drain/toilet → Use plunger, hot water + baking soda, file complaint if persists
- Gas leak → Don't touch switches, open windows, turn off regulator, evacuate, call 1906
- Lift stuck → Press alarm button, call +91-9988776655, stay calm

PAYMENTS:
- Maintenance fee due on 5th every month, 2% late fee
- Pay via Payments menu → UPI/Card/Net Banking
- Receipt auto-downloaded after payment

COMPLAINTS:
- File via My Complaints → File Complaint
- Urgent (water/electric): 2-4 hrs | High: 24 hrs | Normal: 48-72 hrs

VISITORS:
- Register via Visitors menu → Register Visitor
- Enter name, phone, vehicle, date/time
- Delivery: same process, OTP shared at gate

EMERGENCY CONTACTS:
- Fire: 101 | Ambulance: 108 | Police: 100 | National: 112
- Society Security: +91-9800001234
- Society Admin: +91-9800005678

SOCIETY INFO:
- Quiet hours: 10 PM – 7 AM
- Visitor parking: max 8 hours
- No smoking in lifts/common areas
- Pest control: file complaint under My Complaints → Pest Control

For general conversation (greetings, thanks, goodbye) respond naturally and warmly as a helpful assistant.
If asked something outside your knowledge, guide them to contact admin via Community Chat.`;

// ─────────────────────────────────────────────────────────────
//  LOCAL FALLBACK ENGINE  (if API fails)
// ─────────────────────────────────────────────────────────────
function getLocalResponse(input) {
    const msg = input.toLowerCase().trim();

    if (msg === "hi" || msg === "hello" || msg === "hey" || msg.includes("good morning") || msg.includes("good evening"))
        return "👋 Hello! I'm your **ResiHub AI Assistant**. How can I help you today?\n\nYou can ask about maintenance, payments, complaints, visitors, or emergencies!";
    else if (msg.includes("thank") || msg.includes("thanks") || msg.includes("thx"))
        return "😊 You're very welcome! Feel free to ask anything else. Have a great day! 🏠";
    else if (msg.includes("bye") || msg.includes("goodbye"))
        return "👋 Goodbye! Take care. I'm always here if you need help!";
    else if (msg.includes("water leak") || msg.includes("pipe leak") || msg.includes("leaking"))
        return "🚰 **Water Leak:**\n1. Turn off the main water valve.\n2. Place a bucket under the leak.\n3. File a complaint via **My Complaints**.\n4. Emergency plumber: **+91-9876543210**";
    else if (msg.includes("no water") || msg.includes("water supply"))
        return "💧 **No Water Supply:**\n1. Check if your main valve is open.\n2. Check **Announcements** for scheduled cuts.\n3. Contact admin via **Community Chat**.";
    else if (msg.includes("power cut") || msg.includes("no electricity") || msg.includes("no power"))
        return "⚡ **Power Cut:**\n1. Check your circuit breaker.\n2. Ask neighbours if it's building-wide.\n3. Electrician: **+91-9123456780** | BESCOM: **1912**";
    else if (msg.includes("payment") || msg.includes("dues") || msg.includes("fee"))
        return "💳 **Payments:**\nGo to **Payments** in the menu → Pay Now.\nDue date: **5th of every month**. Late fee: 2%/month.";
    else if (msg.includes("complaint") || msg.includes("complain"))
        return "📋 **File a Complaint:**\nGo to **My Complaints → File Complaint**.\nUrgent issues resolved in **2–4 hours**.";
    else if (msg.includes("visitor") || msg.includes("guest"))
        return "🧑‍🤝‍🧑 **Register Visitor:**\nGo to **Visitors → Register Visitor**.\nEnter name, phone, vehicle and expected time.";
    else if (msg.includes("emergency") || msg.includes("fire") || msg.includes("ambulance"))
        return "🚨 **Emergency:**\n• Fire: 101 | Ambulance: 108 | Police: 100\n• Society Security: **+91-9800001234**\n\nUse the **Emergency** section in the app to report an incident.";
    else if (msg.includes("ac") || msg.includes("air conditioner"))
        return "❄️ **AC Issue:**\n1. Check the filter is clean.\n2. Ensure circuit breaker is on.\n3. File complaint → technician visits in **24–48 hrs**.";
    else if (msg.includes("lift") || msg.includes("elevator"))
        return "🛗 **Lift Issue / Stuck:**\nPress the **emergency alarm button** inside the lift.\nCall: **+91-9988776655**. Stay calm — help comes in 10–20 min.";
    else if (msg.includes("gas"))
        return "🔥 **Gas Leak — URGENT:**\n1. Don't touch any switches.\n2. Open all windows.\n3. Turn off gas regulator.\n4. Evacuate and call **1906** or **101**.";
    else if (msg.includes("parking"))
        return "🚗 **Parking:** Your slot matches your apartment (e.g. B-201 → Slot B-201).\nFor unauthorized vehicles, call Security: **+91-9800001234**.";
    else if (msg.includes("noise") || msg.includes("loud"))
        return "🔊 **Noise Complaint:** Quiet hours are **10 PM – 7 AM**.\nFile a complaint via **My Complaints → Noise** — your identity stays anonymous.";
    else if (msg.includes("help") || msg.includes("menu") || msg.includes("what can you"))
        return "🤖 I can help with:\n• Maintenance (leaks, AC, power)\n• Payments & dues\n• Filing complaints\n• Visitor registration\n• Emergencies\n• Society rules & announcements\n\nJust ask! 😊";
    else
        return "🤔 I'm not sure about that. Try asking about maintenance, payments, complaints, or visitors.\n\nOr contact admin via **Community Chat** for personalised help.";
}

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
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

function MessageText({ text }) {
    const lines = text.split("\n");
    return (
        <div className="space-y-0.5">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-1" />;
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={i} className="leading-relaxed">
                        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
                    </p>
                );
            })}
        </div>
    );
}

const QUICK_REPLIES = [
    "Water leak 💧", "Power cut ⚡", "Pay dues 💳",
    "File complaint 📋", "Emergency 🚨", "Register visitor 🧑‍🤝‍🧑",
];

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: "bot",
            text: "👋 Hi! I'm your **ResiHub AI Assistant**.\n\nI can help with maintenance issues, payments, complaints, visitors, emergencies, and general questions.\n\nWhat can I help you with today?",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const [chatSession, setChatSession] = useState(null);
    const bottomRef = useRef(null);
    const fileRef = useRef(null);
    const inputRef = useRef(null);

    // Initialise Gemini chat session once
    useEffect(() => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const session = model.startChat({
                history: [
                    { role: "user", parts: [{ text: "You are ResiHub AI Assistant. Follow this system prompt strictly:\n\n" + SYSTEM_PROMPT }] },
                    { role: "model", parts: [{ text: "Understood! I'm ResiHub AI Assistant, ready to help residents with maintenance, payments, complaints, visitors, emergencies, and general questions. I'll be warm, concise, and professional." }] },
                ],
            });
            setChatSession(session);
        } catch (e) {
            console.error("Failed to init Gemini:", e);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setHasNew(false);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (!isOpen && messages.length > 1 && messages[messages.length - 1].role === "bot") {
            setHasNew(true);
        }
    }, [messages]);

    const handleSend = async (quickText) => {
        const text = (quickText || input).trim();
        if (!text && !image) return;
        if (loading) return;

        const userMsg = { role: "user", text: text || "Analyzing uploaded image…", hasImage: !!image };
        setMessages((p) => [...p, userMsg]);
        setLoading(true);
        setInput("");
        const capturedImage = image;
        setImage(null);

        try {
            let botText;

            if (chatSession) {
                // Use Gemini API
                let result;
                if (capturedImage) {
                    const imagePart = await fileToGenerativePart(capturedImage);
                    result = await chatSession.sendMessage([text || "Please analyze this image and identify any maintenance issue.", imagePart]);
                } else {
                    result = await chatSession.sendMessage(text);
                }
                botText = result.response.text();
            } else {
                // Fallback to local engine
                botText = getLocalResponse(text);
            }

            setMessages((p) => [...p, { role: "bot", text: botText }]);

        } catch (err) {
            console.error("Gemini error:", err);

            // Smart error detection → fallback to local
            const is401 = err?.message?.includes("401") || err?.message?.includes("API_KEY_INVALID") || err?.status === 401;
            const is429 = err?.message?.includes("429") || err?.message?.toLowerCase().includes("quota");

            let botText;
            if (is401) {
                botText = "🔑 API key issue detected. Switching to offline mode...\n\n" + getLocalResponse(text);
            } else if (is429) {
                botText = "⏳ Too many requests right now. Here's what I know:\n\n" + getLocalResponse(text);
            } else {
                botText = getLocalResponse(text);
            }

            setMessages((p) => [...p, { role: "bot", text: botText }]);
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
            {/* ── FAB ─────────────────────────────────────────── */}
            <motion.button
                onClick={() => { setIsOpen((o) => !o); setHasNew(false); }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                aria-label="AI Assistant"
                style={{
                    position: "fixed", bottom: "28px", right: "28px",
                    width: "58px", height: "58px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #E5B94B 0%, #C97B1A 100%)",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(201,123,26,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1050, overflow: "visible",
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X className="w-5 h-5 text-white" /></motion.div>
                        : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Bot className="w-6 h-6 text-white" /></motion.div>
                    }
                </AnimatePresence>
                <AnimatePresence>
                    {hasNew && !isOpen && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            style={{ position: "absolute", top: "-3px", right: "-3px", width: "14px", height: "14px", borderRadius: "50%", background: "#ef4444", border: "2px solid white" }}
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* ── Chat Panel ────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        style={{
                            position: "fixed", bottom: "100px", right: "28px",
                            width: "370px", height: "560px",
                            background: "#ffffff", borderRadius: "20px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(201,123,26,0.12)",
                            display: "flex", flexDirection: "column",
                            border: "1px solid rgba(229,185,75,0.2)", zIndex: 1049, overflow: "hidden",
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: "linear-gradient(135deg, #E5B94B 0%, #C97B1A 100%)", padding: "14px 18px", flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Bot style={{ width: "18px", height: "18px", color: "white" }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: "700", fontSize: "14px", color: "white", margin: 0, lineHeight: 1.2 }}>ResiHub AI Assistant</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#bbf7d0", display: "inline-block" }} />
                                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)" }}>Online · Powered by Gemini AI</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "#fdfcf8", scrollbarWidth: "thin", scrollbarColor: "#e2d9c2 transparent" }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%" }}>
                                    {m.role === "bot" && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                            <div style={{ width: "18px", height: "18px", borderRadius: "5px", background: "linear-gradient(135deg, #E5B94B, #C97B1A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Bot style={{ width: "10px", height: "10px", color: "white" }} />
                                            </div>
                                            <span style={{ fontSize: "10px", fontWeight: "600", color: "#92804a" }}>AI Assistant</span>
                                        </div>
                                    )}
                                    <div style={{
                                        padding: "10px 14px",
                                        borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                        fontSize: "13px", lineHeight: "1.55",
                                        background: m.role === "user" ? "linear-gradient(135deg, #E5B94B, #C97B1A)" : "#ffffff",
                                        color: m.role === "user" ? "#ffffff" : "#374151",
                                        border: m.role === "user" ? "none" : "1px solid #f0e8d0",
                                        boxShadow: m.role === "user" ? "0 2px 8px rgba(201,123,26,0.25)" : "0 1px 4px rgba(0,0,0,0.05)",
                                    }}>
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
                                <div style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                        <div style={{ width: "18px", height: "18px", borderRadius: "5px", background: "linear-gradient(135deg, #E5B94B, #C97B1A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Loader2 style={{ width: "10px", height: "10px", color: "white", animation: "spin 1s linear infinite" }} />
                                        </div>
                                        <span style={{ fontSize: "10px", fontWeight: "600", color: "#92804a" }}>AI Assistant</span>
                                    </div>
                                    <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "#ffffff", border: "1px solid #f0e8d0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                                        <TypingDots />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div style={{ padding: "8px 14px 4px", borderTop: "1px solid #f0e8d0", background: "#fffbf0", display: "flex", flexWrap: "wrap", gap: "6px", flexShrink: 0 }}>
                                {QUICK_REPLIES.map((chip) => (
                                    <button
                                        key={chip}
                                        onClick={() => handleSend(chip)}
                                        style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "white", border: "1px solid #E5B94B", color: "#C97B1A", cursor: "pointer", transition: "all 0.15s" }}
                                        onMouseEnter={(e) => { e.target.style.background = "#E5B94B"; e.target.style.color = "white"; }}
                                        onMouseLeave={(e) => { e.target.style.background = "white"; e.target.style.color = "#C97B1A"; }}
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Image Preview */}
                        <AnimatePresence>
                            {image && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    style={{ padding: "8px 14px", background: "#fffbf0", borderTop: "1px solid #f0e8d0", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6b5c2e", flexShrink: 0 }}>
                                    <ImageIcon style={{ width: "13px", height: "13px", color: "#C97B1A", flexShrink: 0 }} />
                                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{image.name}</span>
                                    <button onClick={() => setImage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                                        <X style={{ width: "13px", height: "13px" }} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Bar */}
                        <div style={{ padding: "12px 14px", borderTop: "1px solid #f0e8d0", background: "#ffffff", flexShrink: 0, display: "flex", gap: "8px", alignItems: "flex-end" }}>
                            {/* Upload */}
                            <button
                                onClick={() => fileRef.current?.click()}
                                title="Attach photo"
                                style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: image ? "#C97B1A" : "#9ca3af", transition: "all 0.15s" }}
                            >
                                <Paperclip style={{ width: "16px", height: "16px" }} />
                            </button>
                            <input type="file" accept="image/*" hidden ref={fileRef} onChange={(e) => setImage(e.target.files[0] || null)} />

                            {/* Text */}
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = Math.min(e.target.scrollHeight, 72) + "px";
                                }}
                                onKeyDown={handleKey}
                                placeholder="Ask me anything…"
                                style={{
                                    flex: 1, padding: "9px 12px", borderRadius: "10px",
                                    border: "1px solid #e5e7eb", fontSize: "13px",
                                    outline: "none", resize: "none", lineHeight: "1.4",
                                    fontFamily: "inherit", background: "#f9fafb", color: "#374151",
                                    transition: "border-color 0.15s, box-shadow 0.15s",
                                    maxHeight: "72px", overflowY: "auto",
                                }}
                                onFocus={(e) => { e.target.style.borderColor = "#E5B94B"; e.target.style.boxShadow = "0 0 0 3px rgba(229,185,75,0.15)"; }}
                                onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
                            />

                            {/* Send */}
                            <motion.button
                                onClick={() => handleSend()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loading || (!input.trim() && !image)}
                                style={{
                                    width: "36px", height: "36px", borderRadius: "10px", border: "none",
                                    background: loading || (!input.trim() && !image) ? "#e5e7eb" : "linear-gradient(135deg, #E5B94B, #C97B1A)",
                                    cursor: loading || (!input.trim() && !image) ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, transition: "all 0.15s",
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
