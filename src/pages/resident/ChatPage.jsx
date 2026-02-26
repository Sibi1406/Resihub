import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/DashboardLayout";
import PageTransition from "../../components/PageTransition";
import { useAuth } from "../../context/AuthContext";
import { subscribeMessages, sendMessage, ensureGeneralChat } from "../../services/chatService";
import { Send, MessageCircle, Loader2, Users } from "lucide-react";
import { buttonHover } from "../../lib/motionVariants";
import toast from "react-hot-toast";

const roleColors = {
    admin: { bg: "bg-[#E5B94B]", text: "text-white", bubble: "bg-[#E5B94B] text-white", label: "bg-[#E5B94B]/15 text-[#7A4E0A]" },
    security: { bg: "bg-blue-500", text: "text-white", bubble: "bg-blue-500 text-white", label: "bg-blue-50 text-blue-700" },
    resident: { bg: "bg-slate-200", text: "text-slate-700", bubble: "", label: "" },
};

function Bubble({ msg, isMe }) {
    const rc = roleColors[msg.role] || roleColors.resident;
    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
        >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${rc.bg} ${rc.text}`}>
                {(msg.userName || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                    <div className="flex items-center gap-1.5 px-0.5">
                        <span className="text-[10px] font-bold text-slate-600">{msg.userName}</span>
                        {msg.role !== "resident" && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${rc.label}`}>
                                {msg.role}
                            </span>
                        )}
                    </div>
                )}
                <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed max-w-full break-words ${isMe
                        ? "bg-[#E5B94B] text-white rounded-br-sm"
                        : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-sm"
                    }`}>
                    {msg.text}
                </div>
                <span className="text-[9px] text-slate-300 px-1">
                    {msg.sentAt?.toDate
                        ? msg.sentAt.toDate().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                        : ""}
                </span>
            </div>
        </motion.div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-slate-400"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay, ease: "easeInOut" }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    const { user, userData, role } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [showTyping, setShowTyping] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const bottomRef = useRef(null);
    const containerRef = useRef(null);
    const typingTimerRef = useRef(null);

    useEffect(() => {
        ensureGeneralChat().then(id => setChatId(id)).catch(() => toast.error("Could not load chat"));
    }, []);

    useEffect(() => {
        if (!chatId) return;
        const unsub = subscribeMessages(chatId, setMessages);
        return unsub;
    }, [chatId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (isAtBottom) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isAtBottom]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        setIsAtBottom(scrollHeight - scrollTop - clientHeight < 60);
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!text.trim() || !chatId || sending) return;
        setSending(true);
        const msgText = text;
        setText("");
        try {
            await sendMessage(chatId, user.uid, userData?.name || "User", msgText, role);
            setIsAtBottom(true);
        } catch {
            toast.error("Failed to send message");
            setText(msgText); // restore on failure
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setText(e.target.value);
        // Simulate typing indicator for demo
        setShowTyping(false);
        clearTimeout(typingTimerRef.current);
    };

    const rc = roleColors[role] || roleColors.resident;

    return (
        <DashboardLayout>
            <PageTransition>
                <div className="flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
                    {/* Header */}
                    <div className="mb-4 flex items-center gap-3 flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-[#E5B94B]/15 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-[#7A4E0A]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Community Chat</h1>
                            <p className="text-xs text-slate-400">Real-time discussion • General channel</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-emerald-700 font-medium">Live</span>
                        </div>
                    </div>

                    {/* Chat Container */}
                    <div className="card rounded-2xl flex-1 flex flex-col overflow-hidden min-h-0">
                        {/* Messages */}
                        <div
                            ref={containerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 space-y-3"
                            style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                        >
                            {!chatId && (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-[#E5B94B] animate-spin" />
                                </div>
                            )}
                            {chatId && messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 py-12"
                                >
                                    <MessageCircle className="w-14 h-14 opacity-40" />
                                    <p className="text-sm font-medium">No messages yet.</p>
                                    <p className="text-xs">Be the first to say hello! 👋</p>
                                </motion.div>
                            )}
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <Bubble key={msg.id} msg={msg} isMe={msg.userId === user?.uid} />
                                ))}
                            </AnimatePresence>

                            {/* Typing indicator */}
                            <AnimatePresence>
                                {showTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                    >
                                        <TypingIndicator />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={bottomRef} />
                        </div>

                        {/* Scroll to bottom button */}
                        <AnimatePresence>
                            {!isAtBottom && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => { setIsAtBottom(true); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                                    className="absolute bottom-20 right-6 w-8 h-8 bg-[#E5B94B] text-white rounded-full shadow-lg flex items-center justify-center text-xs"
                                >
                                    ↓
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div className="border-t border-slate-100 p-3 flex-shrink-0">
                            <form onSubmit={handleSend} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${rc.bg} ${rc.text}`}>
                                    {(userData?.name || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                                </div>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={handleInput}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message… (Enter to send)"
                                    disabled={!chatId || sending}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E5B94B]/40 focus:border-[#E5B94B] transition-all disabled:opacity-60"
                                />
                                <motion.button
                                    type="submit"
                                    {...buttonHover}
                                    disabled={!text.trim() || !chatId || sending}
                                    className="w-10 h-10 rounded-xl bg-[#E5B94B] text-white flex items-center justify-center hover:bg-[#d4a63a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </div>
            </PageTransition>
        </DashboardLayout>
    );
}
