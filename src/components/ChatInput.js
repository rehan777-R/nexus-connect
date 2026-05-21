import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ChatInput = ({ selectedUser }) => {
  const [text, setText] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        senderId: auth.currentUser?.uid,
        receiverId: selectedUser.id,
        timestamp: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!selectedUser) return null;

  return (
    <form onSubmit={sendMessage} className="chat-input-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="chat-send-btn"
      >
        ➤
      </button>
    </form>
  );
};

export default ChatInput;