import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { isOnline } from "./presence";
import type { ChatUser } from "../types";

interface UsersListProps {
  onSelectUser: (user: ChatUser) => void;
  selectedUser: ChatUser | null;
}

const UsersList = ({ onSelectUser, selectedUser }: UsersListProps) => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as ChatUser))
        .filter((u) => u.id !== auth.currentUser?.uid);
      setUsers(list);
    });
    return () => unsub();
  }, []);
  return (
    <div className="chat-sidebar">
      <h2>Chats</h2>
      {users.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No other users found</p>
      )}
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="chat-user-item"
          style={{ background: selectedUser?.id === user.id ? "var(--accent)" : "var(--border)", border: "1px solid var(--border-strong)" }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              className="chat-user-avatar"
              style={{ background: selectedUser?.id === user.id ? "#3B82F6" : (user.avatarColor || "var(--border-strong)"), color: "var(--text-primary)" }}
            >
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            {isOnline(user) && (
              <span style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: "#22C55E", border: "2px solid var(--surface)" }} />
            )}
          </div>
          <div className="chat-user-meta" style={{ overflow: "hidden" }}>
            <p style={{ color: selectedUser?.id === user.id ? "white" : "var(--text-primary)", fontSize: "14px", fontWeight: "600", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.displayName || "User"}
            </p>
            <p style={{ color: selectedUser?.id === user.id ? "rgba(255,255,255,0.7)" : "var(--text-secondary)", fontSize: "12px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default UsersList;
