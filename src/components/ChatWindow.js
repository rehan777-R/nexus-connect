import { useEffect, useRef, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  or,
  and,
  deleteDoc,
  doc,
} from "firebase/firestore";
const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [hovered, setHovered] = useState(null);
  const bottomRef = useRef(null);
  useEffect(() => {
    if (!selectedUser) return;
    const currentUid = auth.currentUser?.uid;
    const otherUid = selectedUser.id;
    const q = query(
      collection(db, "messages"),
      or(
        and(
          where("senderId", "==", currentUid),
          where("receiverId", "==", otherUid)
        ),
        and(
          where("senderId", "==", otherUid),
          where("receiverId", "==", currentUid)
        )
      ),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [selectedUser]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Could not delete message.");
    }
  };
  if (!selectedUser) {
    return (
      <div className="chat-messages" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#71717A", fontSize: "15px" }}>Select a user to start chatting</p>
      </div>
    );
  }
  return (
    <>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-avatar" style={{ background: "#2563EB", color: "#fff" }}>
          {selectedUser.displayName?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ color: "#E5E5E7", fontWeight: "600", margin: 0 }}>
            {selectedUser.displayName || "User"}
          </p>
          <p style={{ color: "#A1A1AA", fontSize: "12px", margin: 0 }}>
            {selectedUser.email}
          </p>
        </div>
      </div>
      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#71717A", fontSize: "14px", marginTop: "40px" }}>
            No messages yet. Say hi!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === auth.currentUser?.uid;
          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHovered(msg.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexDirection: isMine ? "row" : "row-reverse" }}>
                {isMine && hovered === msg.id && (
                  <button
                    onClick={() => handleDelete(msg.id)}
                    title="Delete message"
                    style={{ background: "transparent", border: "none", color: "#71717A", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "2px 4px" }}
                  >
                    ×
                  </button>
                )}
                <div style={{
                  maxWidth: "65%",
                  padding: "10px 16px",
                  borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: isMine ? "#2563EB" : "#1F1F23",
                  color: isMine ? "#fff" : "#E5E5E7",
                  fontSize: "14px",
                  border: msg.flagged ? "1px solid #EAB308" : (isMine ? "none" : "1px solid #27272A"),
                }}>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.7)" : "#71717A", textAlign: "right" }}>
                    {msg.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              {msg.flagged && isMine && (
                <p style={{ margin: "4px 4px 0 0", fontSize: "11px", color: "#EAB308" }}>
                  Flagged for review by AI moderation
                </p>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </>
  );
};
export default ChatWindow;
