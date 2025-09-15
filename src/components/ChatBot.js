import React, { useState, useEffect } from "react";
import axios from "axios";

const ChatBot = ({ selectedDoc, complianceResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  // Auto-open chatbot if compliance issues exist
  useEffect(() => {
    if (complianceResult && complianceResult.issues && complianceResult.issues.length > 0) {
      setIsOpen(true);
    }
  }, [complianceResult]);

  // Preload AI message when compliance results update
  useEffect(() => {
    if (complianceResult) {
      if (complianceResult.issues && complianceResult.issues.length > 0) {
        const formattedIssues = complianceResult.issues.map((iss) => `• ${iss}`).join("\n");
        setMessages([
          {
            sender: "bot",
            text: `⚠ I found ${complianceResult.issues.length} compliance issue(s):\n${formattedIssues}\n\nWould you like me to explain how to fix them?`,
          },
        ]);
      } else {
        setMessages([
          {
            sender: "bot",
            text: "✅ Great! Your document passed compliance. You can still ask me questions, e.g., about encryption or PII handling.",
          },
        ]);
      }
    }
  }, [complianceResult]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (!selectedDoc) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "⚠ Please select a document first." },
        ]);
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:8080/api/documents/${selectedDoc}/chat`,
        { params: { q: input } }
      );

      const botMsg = { sender: "bot", text: res.data };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error: Could not connect to AI assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper: format bot messages into blocks
  const renderBotMessage = (text) => {
    // Split by numbered sections (e.g., "1.", "2.")
    const sections = text.split(/\d+\./).filter((s) => s.trim() !== "");

    if (sections.length > 1) {
      return (
        <div>
          {sections.map((section, i) => (
            <div
              key={i}
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                padding: "10px 12px",
                margin: "8px 0",
                borderRadius: "6px",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#1f2937",
              }}
            >
              <strong>{i + 1}.</strong> {section.trim()}
            </div>
          ))}
        </div>
      );
    }

    // fallback = simple bubble
    return (
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          padding: "10px 12px",
          borderRadius: "6px",
          fontSize: "14px",
          color: "#1f2937",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleChat}>
        {isOpen ? "✖ Close" : "🤖 AI Compliance Assistant"}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">AI Compliance Assistant</div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>
                {msg.sender === "bot" ? renderBotMessage(msg.text) : msg.text}
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot-message">
                <em>🤖 Thinking...</em>
              </div>
            )}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about compliance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
