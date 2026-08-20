import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  async function saveUserToFirestore(user) {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
      },
      { merge: true }
    );
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signup(email, password);
      await saveUserToFirestore(result.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create account. Try again!");
    }
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError("");
    setLoading(true);
    try {
      const result = await googleLogin();
      await saveUserToFirestore(result.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed. Try again!");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111113", border: "1px solid #1F1F23", padding: "36px", borderRadius: "12px", width: "100%", maxWidth: "380px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "26px", color: "white", fontSize: "22px", fontWeight: "600" }}>Create your account</h2>
        {error && <p style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "13.5px" }}>{error}</p>}
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: "#A1A1AA", fontWeight: "500", fontSize: "13px" }}>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: "#A1A1AA", fontWeight: "500", fontSize: "13px" }}>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={loading} type="submit" className="btn-primary" style={{ width: "100%", padding: "11px", fontSize: "14px" }}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "18px 0" }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #1F1F23" }} />
          <span style={{ margin: "0 10px", color: "#52525B", fontSize: "12px" }}>OR</span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #1F1F23" }} />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="btn-secondary"
          style={{ width: "100%", padding: "11px", fontSize: "13.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "18px" }} />
          Continue with Google
        </button>

        <p style={{ textAlign: "center", marginTop: "18px", color: "#71717A", fontSize: "13px" }}>
          Already have an account? <Link to="/login" style={{ color: "#2563EB", fontWeight: "500" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
