import React, { useState } from "react";
import { chatWithAI } from "../Api";

function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const res = await chatWithAI(input);
    setMessages([...messages, { user: "You", text: input }, { user: "AI", text: res.data.answer }]);
    setInput("");
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2>🤖 AI Assistant</h2>
      <div className="chat-box">
        {messages.map((m, i) => (
          <p key={i}><b>{m.user}:</b> {m.text}</p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatAssistant;
