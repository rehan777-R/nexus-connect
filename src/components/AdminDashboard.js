import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const usersSnap = await getDocs(collection(db, "users"));
      const itemsSnap = await getDocs(collection(db, "items"));
      setUsers(usersSnap.docs.map(doc => doc.data()));
      setItems(itemsSnap.docs.map(doc => doc.data()));
    }
    fetchData();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "30px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "#dc2626", borderRadius: "15px", padding: "30px", color: "white", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>🛡️ Admin Dashboard</h1>
            <p style={{ margin: "8px 0 0", opacity: 0.85 }}>{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} style={{ background: "white", color: "#dc2626", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>👥</div>
            <h2 style={{ color: "#4f46e5", margin: "10px 0 5px" }}>{users.length}</h2>
            <p style={{ color: "#888", margin: 0 }}>Total Users</p>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>🛡️</div>
            <h2 style={{ color: "#dc2626", margin: "10px 0 5px" }}>{adminCount}</h2>
            <p style={{ color: "#888", margin: 0 }}>Admins</p>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>👤</div>
            <h2 style={{ color: "#10b981", margin: "10px 0 5px" }}>{userCount}</h2>
            <p style={{ color: "#888", margin: 0 }}>Normal Users</p>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>📦</div>
            <h2 style={{ color: "#f59e0b", margin: "10px 0 5px" }}>{items.length}</h2>
            <p style={{ color: "#888", margin: 0 }}>Total Items</p>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
          <h3 style={{ color: "#333", marginTop: 0 }}>All Users</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f8f8" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Role</th>
                <th style={{ padding: "12px", textAlign: "left", color: "#555" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "12px", color: "#333" }}>{user.email}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ background: user.role === "admin" ? "#fee2e2" : "#e0f2fe", color: user.role === "admin" ? "#dc2626" : "#0284c7", padding: "4px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#888", fontSize: "13px" }}>{user.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <h3 style={{ color: "#333", marginTop: 0 }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/items")} style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              Manage Items
            </button>
            <button onClick={() => navigate("/create")} style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              Create Item
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}