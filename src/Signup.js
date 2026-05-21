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

        <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
          <span style={{ margin: "0 10px", color: "#aaa", fontSize: "14px" }}>OR</span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ddd" }} />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "white", color: "#333", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "20px" }} />
          Continue with Google
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#555" }}>
          Already have an account? <Link to="/login" style={{ color: "#4f46e5", fontWeight: "bold" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}