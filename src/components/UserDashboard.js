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
    <div style={{ minHeight: "100vh", background: "#0A0A0B", padding: "30px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "12px", padding: "26px 30px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", color: "white", fontWeight: "600" }}>Your dashboard</h1>
            <p style={{ margin: "6px 0 0", color: "#71717A", fontSize: "13.5px" }}>{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "10px", padding: "22px" }}>
            <h3 style={{ color: "white", margin: "0 0 5px", fontSize: "15px", fontWeight: "600" }}>My tasks</h3>
            <p style={{ color: "#71717A", margin: 0, fontSize: "13px" }}>View your assigned work</p>
          </div>
          <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "10px", padding: "22px" }}>
            <h3 style={{ color: "white", margin: "0 0 5px", fontSize: "15px", fontWeight: "600" }}>Create task</h3>
            <p style={{ color: "#71717A", margin: 0, fontSize: "13px" }}>Add something new</p>
          </div>
          <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "10px", padding: "22px" }}>
            <h3 style={{ color: "white", margin: "0 0 5px", fontSize: "15px", fontWeight: "600" }}>Chat</h3>
            <p style={{ color: "#71717A", margin: 0, fontSize: "13px" }}>Message your team</p>
          </div>
        </div>
        {/* Quick Actions */}
        <div style={{ background: "#111113", border: "1px solid #1F1F23", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ color: "white", marginTop: 0, fontSize: "15px", fontWeight: "600", marginBottom: "16px" }}>Quick actions</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/items")} className="btn-primary">
              View all tasks
            </button>
            <button onClick={() => navigate("/create")} className="btn-secondary">
              Create new task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
