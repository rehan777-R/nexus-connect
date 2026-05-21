import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "30px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "#4f46e5", borderRadius: "15px", padding: "30px", color: "white", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>👤 User Dashboard</h1>
            <p style={{ margin: "8px 0 0", opacity: 0.85 }}>{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} style={{ background: "white", color: "#4f46e5", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Logout
          </button>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>📦</div>
            <h3 style={{ color: "#4f46e5", margin: "10px 0 5px" }}>My Items</h3>
            <p style={{ color: "#888", margin: 0 }}>View your items</p>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>➕</div>
            <h3 style={{ color: "#4f46e5", margin: "10px 0 5px" }}>Create Item</h3>
            <p style={{ color: "#888", margin: 0 }}>Add new item</p>
          </div>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "40px" }}>💬</div>
            <h3 style={{ color: "#4f46e5", margin: "10px 0 5px" }}>Chat</h3>
            <p style={{ color: "#888", margin: 0 }}>Message users</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "white", borderRadius: "12px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <h3 style={{ color: "#333", marginTop: 0 }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/items")} style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              View All Items
            </button>
            <button onClick={() => navigate("/create")} style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              Create New Item
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}