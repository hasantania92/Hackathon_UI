import React, { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(""); // optional: allow user to pick doc ID

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages([...messages, userMsg]);

    try {
      // call backend (for now assume docId = first uploaded doc or hardcoded)
      const docId = selectedDoc || "some-doc-id"; 
      const res = await axios.get(`/api/documents/${docId}/chat`, {
        params: { q: input },
      });
      const botMsg = { sender: "bot", text: res.data };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error: Could not connect to AI assistant." }]);
    }

    setInput("");
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleChat}>
        {isOpen ? "✖" : "🤖 AI Assistant"}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">AI Assistant</div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
