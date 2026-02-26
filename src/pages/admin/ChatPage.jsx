import ChatPage from "../resident/ChatPage";

// Admin uses the same Chat UI as residents - role badge is handled inside ChatPage
export default function AdminChatPage() {
    return <ChatPage />;
}
