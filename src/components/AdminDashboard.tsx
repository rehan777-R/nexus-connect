import { usePageTitle } from '../usePageTitle';
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Message, Task, UserProfile } from "../types";

export default function AdminDashboard() {
  usePageTitle('Admin');
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
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
      <h2 style={{ color: color, margin: "0 0 4px", fontSize: "24px", fontWeight: "700" }}>{value}</h2>
      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "12.5px" }}>{label}</p>
    </div>
  );

  return (
    <div className="page" style={{ minHeight: "100vh", background: "var(--bg)", padding: "30px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "26px 30px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", color: "var(--text-primary)", fontWeight: "600" }}>Admin dashboard</h1>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "13.5px" }}>{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          {statCard(users.length, "Total users", "var(--accent)")}
          {statCard(adminCount, "Admins", "#EAB308")}
          {statCard(userCount, "Normal users", "#22C55E")}
          {statCard(items.length, "Total tasks", "var(--text-muted)")}
          {statCard(flaggedMessages.length, "Flagged messages", "#EF4444")}
        </div>

        {/* Flagged Messages */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
            <h3 style={{ color: "var(--text-primary)", margin: 0, fontSize: "15px", fontWeight: "600" }}>Moderation review queue</h3>
            <span className="ai-badge">✨ Screened by Llama 3.3 70B</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "12.5px", margin: "0 0 14px" }}>
            Every chat message (including edits) is classified by an LLM in the background. Flagged messages land here for human review.
          </p>
          {flaggedMessages.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>No flagged messages. Team chat looks clean.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 0", textAlign: "left", color: "var(--text-muted)", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid var(--border)" }}>From</th>
                  <th style={{ padding: "10px 0", textAlign: "left", color: "var(--text-muted)", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid var(--border)" }}>Message</th>
                  <th style={{ padding: "10px 0", textAlign: "left", color: "var(--text-muted)", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid var(--border)" }}>AI reason</th>
                </tr>
              </thead>
              <tbody>
                {flaggedMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td style={{ padding: "10px 0", color: "var(--text-primary)", fontSize: "13px", borderBottom: "1px solid var(--border)" }}>{emailByUid[msg.senderId] || "Unknown"}</td>
                    <td style={{ padding: "10px 0", color: "var(--text-primary)", fontSize: "13px", borderBottom: "1px solid var(--border)" }}>{msg.text}</td>
                    <td style={{ padding: "10px 6px 10px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ display: "inline-block", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 }}>
                        🛡 {msg.flagReason || "Flagged by AI"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Users Table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", marginBottom: "18px" }}>
          <h3 style={{ color: "var(--text-primary)", marginTop: 0, fontSize: "15px", fontWeight: "600", marginBottom: "14px" }}>All users</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 0", textAlign: "left", color: "var(--text-muted)", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid var(--border)" }}>Email</th>
                <th style={{ padding: "10px 0", textAlign: "left", color: "var(--text-muted)", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid var(--border)" }}>Role</th>
                <th style={{ padding: "10px 0", textAlign: "left", color: "var(--text-muted)", fontSize: "12px", fontWeight: "500", borderBottom: "1px solid var(--border)" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px 0", color: "var(--text-primary)", fontSize: "13px", borderBottom: "1px solid var(--border)" }}>{user.email}</td>
                  <td style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ background: user.role === "admin" ? "rgba(234,179,8,0.12)" : "rgba(37,99,235,0.12)", color: user.role === "admin" ? "#EAB308" : "var(--accent)", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "10px 0", color: "var(--text-muted)", fontSize: "12.5px", borderBottom: "1px solid var(--border)" }}>{user.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ color: "var(--text-primary)", marginTop: 0, fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>Quick actions</h3>
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
