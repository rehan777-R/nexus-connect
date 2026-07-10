import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
const UsersList = ({ onSelectUser, selectedUser }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== auth.currentUser?.uid);
      setUsers(list);
    });
    return () => unsub();
  }, []);
  return (
    <div className="chat-sidebar">
      <h2>Chats</h2>
      {users.length === 0 && (
        <p style={{ color: "#71717A", fontSize: "14px" }}>No other users found</p>
      )}
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="chat-user-item"
          style={{ background: selectedUser?.id === user.id ? "#2563EB" : "#1F1F23", border: "1px solid #27272A" }}
        >
          <div
            className="chat-user-avatar"
            style={{ background: selectedUser?.id === user.id ? "#3B82F6" : "#27272A", color: "#E5E5E7" }}
          >
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ color: selectedUser?.id === user.id ? "white" : "#E5E5E7", fontSize: "14px", fontWeight: "600", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.displayName || "User"}
            </p>
            <p style={{ color: selectedUser?.id === user.id ? "rgba(255,255,255,0.7)" : "#A1A1AA", fontSize: "12px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default UsersList;
