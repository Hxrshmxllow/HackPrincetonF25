import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import "./ChatSidebar.css";

function ChatSidebar({ open, car, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/listings/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car,
          messageHistory: newMessages,
          message: userMessage.content,
        }),
      });

      if (!res.ok) throw new Error("Chat fetch failed");
      const data = await res.json();

      setMessages(data.messageHistory || newMessages);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chat-sidebar ${open ? "open" : ""}`}>
      {/* Header */}
      <div className="chat-sidebar-header">
        <h3>
          <MessageCircle size={18} /> Ask AI About This Car
        </h3>
        <button className="chat-sidebar-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="chat-sidebar-content">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-placeholder">
              <MessageCircle size={32} />
              <p>Start a conversation about this car!</p>
              <p className="chat-suggestions">
                Try asking: “Is this a good deal?” or “What are common issues?”
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${
                  msg.role === "user" ? "user-message" : "ai-message"
                }`}
              >
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}

          {loading && (
            <div className="chat-message ai-message">
              <div className="message-content typing-indicator">
                AI is thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about this car..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatSidebar;
