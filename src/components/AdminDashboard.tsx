import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Message, Task, UserProfile } from "../types";

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [items, setItems] = useState<Task[]>([]);
  const [flaggedMessages, setFlaggedMessages] = useState<Message[]>([]);

  useEffect(() => {
    async function fetchData() {
      const usersSnap = await getDocs(collection(db, "users"));
      const itemsSnap = await getDocs(collection(db, "items"));
      setUsers(usersSnap.docs.map(doc => doc.data() as UserProfile));
      setItems(itemsSnap.docs.map(doc => doc.data() as Task));

      const flaggedQuery = query(collection(db, "messages"), where("flagged", "==", true));
      const flaggedSnap = await getDocs(flaggedQuery);
      setFlaggedMessages(flaggedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }
    fetchData();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

  const emailByUid: Record<string, string> = {};
  users.forEach(u => { emailByUid[u.uid] = u.email; });

  const statCard = (value: number, label: string, color: string) => (
    <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
      <h2 style={{ color: color, margin: "0 0 4px", fontSize: "24px", fontWeight: "700" }}>{value}</h2>
      <p style={{ color: "#71717A", margin: 0, fontSize: "12.5px" }}>{label}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", padding: "30px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "12px", padding: "26px 30px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", color: "white", fontWeight: "600" }}>Admin dashboard</h1>
            <p style={{ margin: "6px 0 0", color: "#71717A", fontSize: "13.5px" }}>{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          {statCard(users.length, "Total users", "#2563EB")}
          {statCard(adminCount, "Admins", "#EAB308")}
          {statCard(userCount, "Normal users", "#22C55E")}
          {statCard(items.length, "Total tasks", "#71717A")}
          {statCard(flaggedMessages.length, "Flagged messages", "#EF4444")}
        </div>

        {/* Flagged Messages */}
        <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "12px", padding: "24px", marginBottom: "18px" }}>
          <h3 style={{ color: "white", marginTop: 0, fontSize: "15px", fontWeight: "600", marginBottom: "14px" }}>Flagged messages (AI moderation)</h3>
          {flaggedMessages.length === 0 ? (
            <p style={{ color: "#71717A", fontSize: "13.5px" }}>No flagged messages. Team chat looks clean.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 0", textAlign: "left", color: "#71717A", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid #1F1F23" }}>From</th>
                  <th style={{ padding: "10px 0", textAlign: "left", color: "#71717A", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid #1F1F23" }}>Message</th>
                  <th style={{ padding: "10px 0", textAlign: "left", color: "#71717A", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid #1F1F23" }}>AI reason</th>
                </tr>
              </thead>
              <tbody>
                {flaggedMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td style={{ padding: "10px 0", color: "#E5E5E7", fontSize: "13px", borderBottom: "1px solid #1F1F23" }}>{emailByUid[msg.senderId] || "Unknown"}</td>
                    <td style={{ padding: "10px 0", color: "#E5E5E7", fontSize: "13px", borderBottom: "1px solid #1F1F23" }}>{msg.text}</td>
                    <td style={{ padding: "10px 0", color: "#EF4444", fontSize: "13px", borderBottom: "1px solid #1F1F23" }}>{msg.flagReason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Users Table */}
        <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "12px", padding: "24px", marginBottom: "18px" }}>
          <h3 style={{ color: "white", marginTop: 0, fontSize: "15px", fontWeight: "600", marginBottom: "14px" }}>All users</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 0", textAlign: "left", color: "#71717A", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid #1F1F23" }}>Email</th>
                <th style={{ padding: "10px 0", textAlign: "left", color: "#71717A", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid #1F1F23" }}>Role</th>
                <th style={{ padding: "10px 0", textAlign: "left", color: "#71717A", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid #1F1F23" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px 0", color: "#E5E5E7", fontSize: "13px", borderBottom: "1px solid #1F1F23" }}>{user.email}</td>
                  <td style={{ padding: "10px 0", borderBottom: "1px solid #1F1F23" }}>
                    <span style={{ background: user.role === "admin" ? "rgba(234,179,8,0.12)" : "rgba(37,99,235,0.12)", color: user.role === "admin" ? "#EAB308" : "#2563EB", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "10px 0", color: "#71717A", fontSize: "12.5px", borderBottom: "1px solid #1F1F23" }}>{user.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ color: "white", marginTop: 0, fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>Quick actions</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/items")} className="btn-primary">
              Manage tasks
            </button>
            <button onClick={() => navigate("/create")} className="btn-secondary">
              Create task
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
