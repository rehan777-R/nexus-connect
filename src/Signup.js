import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create account. Try again!");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333", fontSize: "28px" }}>Create Account 🚀</h2>
        {error && <p style={{ background: "#ffe0e0", color: "red", padding: "10px", borderRadius: "8px", textAlign: "center" }}>{error}</p>}
        <form onSubmit={handleSignup}>
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
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold" }}>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "93%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px" }}
            />
          </div>
          <button disabled={loading} type="submit" style={{ width: "100%", padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
          Already have an account? <Link to="/login" style={{ color: "#4f46e5", fontWeight: "bold" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}