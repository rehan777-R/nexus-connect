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
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
} from "firebase/firestore";
import { moderateInBackground } from "./moderation";
import { isOnline } from "./presence";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉"];

const ChatWindow = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
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

  // Typing indicator: watch the other user's typing doc for this conversation
  useEffect(() => {
    if (!selectedUser) return;
    const currentUid = auth.currentUser?.uid;
    const typingRef = doc(db, "typing", `${selectedUser.id}_${currentUid}`);
    let staleTimer;
    const unsub = onSnapshot(typingRef, (snap) => {
      clearTimeout(staleTimer);
      const data = snap.data();
      const fresh = data?.isTyping && Date.now() - (data.updatedAt || 0) < 6000;
      setOtherTyping(!!fresh);
      // Auto-hide if no further updates arrive (stale doc)
      if (fresh) staleTimer = setTimeout(() => setOtherTyping(false), 6000);
    });
    return () => {
      clearTimeout(staleTimer);
      unsub();
      setOtherTyping(false);
    };
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Could not delete message.");
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const saveEdit = async () => {
    const newText = editText.trim();
    if (!newText) return;
    const id = editingId;
    setEditingId(null);
    try {
      await updateDoc(doc(db, "messages", id), { text: newText, edited: true });
      // Edited content bhi moderation se guzarta hai
      moderateInBackground(id, newText);
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  const toggleReaction = async (msg, emoji) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const reacted = msg.reactions?.[emoji]?.includes(uid);
    try {
      await updateDoc(doc(db, "messages", msg.id), {
        [`reactions.${emoji}`]: reacted ? arrayRemove(uid) : arrayUnion(uid),
      });
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  if (!selectedUser) {
    return (
      <div className="chat-messages" style={{ alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#71717A", fontSize: "15px" }}>Select a user to start chatting</p>
      </div>
    );
  }

  const online = isOnline(selectedUser);

  const iconBtnStyle = { background: "transparent", border: "none", color: "#71717A", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "2px 4px" };

  return (
    <>
      {/* Header */}
      <div className="chat-header">
        <div style={{ position: "relative" }}>
          <div className="chat-user-avatar" style={{ background: selectedUser.avatarColor || "#2563EB", color: "#fff" }}>
            {selectedUser.displayName?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase()}
          </div>
          {online && (
            <span style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: "#22C55E", border: "2px solid #111113" }} />
          )}
        </div>
        <div>
          <p style={{ color: "#E5E5E7", fontWeight: "600", margin: 0 }}>
            {selectedUser.displayName || "User"}
          </p>
          <p style={{ color: online ? "#22C55E" : "#A1A1AA", fontSize: "12px", margin: 0 }}>
            {otherTyping ? "typing…" : online ? "Online" : selectedUser.email}
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
          const isEditing = editingId === msg.id;
          const reactionEntries = Object.entries(msg.reactions || {}).filter(([, uids]) => uids?.length > 0);
          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHovered(msg.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexDirection: isMine ? "row" : "row-reverse" }}>
                {hovered === msg.id && !isEditing && (
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    {/* Reaction picker */}
                    <div style={{ display: "flex", gap: "2px", background: "#18181B", border: "1px solid #27272A", borderRadius: "14px", padding: "2px 6px" }}>
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg, emoji)}
                          title={`React with ${emoji}`}
                          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", padding: "2px" }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    {isMine && (
                      <>
                        <button onClick={() => startEdit(msg)} title="Edit message" style={iconBtnStyle}>✎</button>
                        <button onClick={() => handleDelete(msg.id)} title="Delete message" style={{ ...iconBtnStyle, fontSize: "16px" }}>×</button>
                      </>
                    )}
                  </div>
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
                  {isEditing ? (
                    <div>
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        style={{ width: "220px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "6px", color: "#fff", padding: "6px 10px", fontSize: "13.5px", outline: "none", margin: 0 }}
                      />
                      <div style={{ display: "flex", gap: "8px", marginTop: "6px", justifyContent: "flex-end" }}>
                        <button onClick={() => setEditingId(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "12px", padding: 0 }}>Cancel</button>
                        <button onClick={saveEdit} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600, padding: 0 }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: isMine ? "rgba(255,255,255,0.7)" : "#71717A", textAlign: "right" }}>
                        {msg.edited && <span style={{ marginRight: "6px" }}>(edited)</span>}
                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {/* Reactions */}
              {reactionEntries.length > 0 && (
                <div style={{ display: "flex", gap: "4px", marginTop: "3px" }}>
                  {reactionEntries.map(([emoji, uids]) => {
                    const mine = uids.includes(auth.currentUser?.uid);
                    return (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(msg, emoji)}
                        style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          background: mine ? "rgba(37,99,235,0.2)" : "#18181B",
                          border: `1px solid ${mine ? "rgba(37,99,235,0.5)" : "#27272A"}`,
                          borderRadius: "12px", padding: "2px 8px", cursor: "pointer",
                          fontSize: "12px", color: "#E5E5E7",
                        }}
                      >
                        {emoji} <span style={{ fontSize: "11px", color: "#A1A1AA" }}>{uids.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {msg.flagged && isMine && (
                <p style={{ margin: "4px 4px 0 0", fontSize: "11px", color: "#EAB308" }}>
                  Flagged for review by AI moderation
                </p>
              )}
            </div>
          );
        })}
        {otherTyping && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ padding: "10px 16px", borderRadius: "14px 14px 14px 4px", background: "#1F1F23", border: "1px solid #27272A", color: "#A1A1AA", fontSize: "14px" }}>
              <span className="typing-dots"><span>•</span><span>•</span><span>•</span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </>
  );
};
export default ChatWindow;
