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
      <h2>💬 Chats</h2>
      {users.length === 0 && (
        <p style={{ color: "#6b7280", fontSize: "14px" }}>No other users found</p>
      )}
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="chat-user-item"
          style={{ background: selectedUser?.id === user.id ? "#4f46e5" : "#1f2937" }}
        >
          <div
            className="chat-user-avatar"
            style={{ background: selectedUser?.id === user.id ? "#818cf8" : "#374151" }}
          >
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ color: "white", fontSize: "14px", fontWeight: "600", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.displayName || "User"}
            </p>
            <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;