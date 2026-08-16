import { useEffect, useRef, useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { moderateInBackground } from "./moderation";

const ChatInput = ({ selectedUser }) => {
  const [text, setText] = useState("");
  const lastTypingWrite = useRef(0);

  const typingDocRef = () => {
    const me = auth.currentUser?.uid;
    if (!me || !selectedUser) return null;
    return doc(db, "typing", `${me}_${selectedUser.id}`);
  };

  const setTyping = async (isTyping) => {
    const ref = typingDocRef();
    if (!ref) return;
    try {
      await setDoc(ref, { isTyping, updatedAt: Date.now() });
    } catch (err) {
      // typing status is best-effort only
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    if (!value.trim()) {
      setTyping(false);
      return;
    }
    // Throttle typing writes to once per 1.5s
    const now = Date.now();
    if (now - lastTypingWrite.current > 1500) {
      lastTypingWrite.current = now;
      setTyping(true);
    }
  };

  // Clear typing status when switching chats / leaving
  useEffect(() => {
    return () => {
      setTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;
    const messageText = text.trim();
    setText("");
    setTyping(false);
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
        onChange={handleChange}
        placeholder="Type a message..."
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="chat-send-btn"
      >
        Send
      </button>
    </form>
  );
};
export default ChatInput;
