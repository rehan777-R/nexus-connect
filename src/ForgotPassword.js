import { useState } from "react";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Check your email for password reset link!");
    } catch (err) {
      setError("Failed to send reset email. Check your email address!");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#333", fontSize: "28px" }}>Reset Password 🔒</h2>
        <p style={{ textAlign: "center", color: "#888", marginBottom: "25px" }}>Enter your email and we'll send you a reset link</p>
        {error && <p style={{ background: "#ffe0e0", color: "red", padding: "10px", borderRadius: "8px", textAlign: "center" }}>{error}</p>}
        {message && <p style={{ background: "#e0ffe0", color: "green", padding: "10px", borderRadius: "8px", textAlign: "center" }}>{message}</p>}
        <form onSubmit={handleReset}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold" }}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "93%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px" }}
            />
          </div>
          <button disabled={loading} type="submit" style={{ width: "100%", padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
          <Link to="/login" style={{ color: "#4f46e5", fontWeight: "bold" }}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}