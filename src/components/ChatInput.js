import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

// Message bhejne ke baad background mein AI se check karwata hai
// ke content appropriate hai ya nahi. Sending block nahi hoti - flag
// baad mein silently apply ho jata hai agar zaroorat pade.
async function moderateInBackground(messageId, text) {
  try {
    const response = await fetch("/api/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    if (data.flagged) {
      await updateDoc(doc(db, "messages", messageId), {
        flagged: true,
        flagReason: data.reason || "Flagged by AI moderation",
      });
    }
  } catch (err) {
    console.error("Moderation check failed:", err);
  }
}

const ChatInput = ({ selectedUser }) => {
  const [text, setText] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;
    const messageText = text.trim();
    setText("");
    try {
      const docRef = await addDoc(collection(db, "messages"), {
        text: messageText,
        senderId: auth.currentUser?.uid,
        receiverId: selectedUser.id,
        timestamp: serverTimestamp(),
        flagged: false,
      });
      // AI moderation background mein chalti hai, message turant bhej dete hain
      moderateInBackground(docRef.id, messageText);
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
