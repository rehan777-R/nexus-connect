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
} from "firebase/firestore";

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
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

  if (!selectedUser) {
    return (
      <div className="chat-messages" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: "18px" }}>Select a user to start chatting 💬</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-avatar" style={{ background: "#4f46e5" }}>
          {selectedUser.displayName?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ color: "white", fontWeight: "600", margin: 0 }}>
            {selectedUser.displayName || "User"}
          </p>
          <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
            {selectedUser.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", marginTop: "40px" }}>
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === auth.currentUser?.uid;
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "65%",
                padding: "10px 16px",
                borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isMine ? "#4f46e5" : "#374151",
                color: "white",
                fontSize: "14px",
              }}>
                <p style={{ margin: 0 }}>{msg.text}</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: isMine ? "#c7d2fe" : "#9ca3af", textAlign: "right" }}>
                  {msg.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </>
  );
};

export default ChatWindow;