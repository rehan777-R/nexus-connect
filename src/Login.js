import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // ← YEH FUNCTION ADD HUA
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

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      await saveUserToFirestore(result.user); // ← YEH ADD HUA
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password!");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError("");
    try {
      const result = await googleLogin();
      await saveUserToFirestore(result.user); // ← YEH ADD HUA
      navigate("/dashboard");
    } catch (err) {
      setError("Google Sign-In failed!");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333", fontSize: "28px" }}>Welcome Back 👋</h2>
        {error && <p style={{ background: "#ffe0e0", color: "red", padding: "10px", borderRadius: "8px", textAlign: "center" }}>{error}</p>}
        <form onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "93%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px" }}
            />
          </div>
          <button disabled={loading} type="submit" style={{ width: "100%", padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={{ margin: "20px 0", textAlign: "center", color: "#aaa" }}>— OR —</div>
        <button onClick={handleGoogle} style={{ width: "100%", padding: "12px", background: "white", color: "#333", border: "1px solid #ddd", borderRadius: "8px", fontSize: "15px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          🔵 Sign in with Google
        </button>
        <p style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
          <Link to="/forgot-password" style={{ color: "#4f46e5" }}>Forgot Password?</Link>
        </p>
        <p style={{ textAlign: "center", color: "#555" }}>
          No account? <Link to="/signup" style={{ color: "#4f46e5", fontWeight: "bold" }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}