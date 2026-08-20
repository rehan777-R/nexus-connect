import { usePageTitle } from './usePageTitle';
import { useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {
  usePageTitle('Login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  async function saveUserToFirestore(user: User) {
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

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      await saveUserToFirestore(result.user);
      navigate("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code ? `Login failed: ${code}` : "Invalid email or password!");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError("");
    try {
      const result = await googleLogin();
      await saveUserToFirestore(result.user);
      navigate("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code ? `Google sign-in failed: ${code}` : "Google Sign-In failed!");
    }
  }

  return (
    <div className="page" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="glass-card" style={{ padding: "40px 36px", borderRadius: "16px", width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--accent-grad)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <span style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>N</span>
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "26px", color: "var(--text-primary)", fontSize: "22px", fontWeight: "600" }}>Welcome back</h2>
        {error && <p style={{ background: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)", padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "13.5px" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontWeight: "500", fontSize: "13px" }}>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)", fontWeight: "500", fontSize: "13px" }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={loading} type="submit" className="btn-primary" style={{ width: "100%", padding: "11px", fontSize: "14px" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={{ margin: "18px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>OR</div>
        <button onClick={handleGoogle} className="btn-secondary" style={{ width: "100%", padding: "11px", fontSize: "13.5px" }}>
          Sign in with Google
        </button>
        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px" }}>
          <Link to="/forgot-password" style={{ color: "var(--text-muted)" }}>Forgot password?</Link>
        </p>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
          No account? <Link to="/signup" style={{ color: "var(--accent)", fontWeight: "500" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
