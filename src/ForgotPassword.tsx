import { usePageTitle } from './usePageTitle';
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  usePageTitle('Reset password');
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Check your email for the reset link.");
    } catch (err) {
      setError("Failed to send reset email. Check your email address.");
    }
    setLoading(false);
  }

  return (
    <div className="page" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "36px", borderRadius: "12px", width: "100%", maxWidth: "380px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <span style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>N</span>
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "8px", color: "var(--text-primary)", fontSize: "22px", fontWeight: "600" }}>Reset password</h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "22px", fontSize: "13.5px" }}>Enter your email and we'll send you a reset link.</p>
        {error && <p style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "13.5px" }}>{error}</p>}
        {message && <p style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "13.5px" }}>{message}</p>}
        <form onSubmit={handleReset}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontWeight: "500", fontSize: "13px" }}>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button disabled={loading} type="submit" className="btn-primary" style={{ width: "100%", padding: "11px", fontSize: "14px" }}>
            {loading ? "Sending..." : "Send reset email"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px" }}>
          <Link to="/login" style={{ color: "var(--text-muted)" }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
