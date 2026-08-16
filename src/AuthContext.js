import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, googleProvider } from "./firebase";
import { db } from "./firebase";
import { saveUserToFirestore } from "./saveUser";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(result.user);
    return result;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function googleLogin() {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(result.user);
    return result;
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function deleteAccount() {
    return deleteUser(auth.currentUser);
  }

  useEffect(() => {
    let unsubProfile = null;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (user) {
        // Live subscription: profile edits (name, avatar) aur role changes turant reflect hon
        unsubProfile = onSnapshot(doc(db, "users", user.uid), (snap) => {
          if (snap.exists()) {
            setUserRole(snap.data().role);
            setUserProfile(snap.data());
          }
          setLoading(false);
        });
      } else {
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Presence heartbeat: lastSeen har 45 second update hota hai jab tak app khula hai.
  // Doosre users isse online/offline status dekhte hain.
  useEffect(() => {
    if (!currentUser) return;
    const beat = () =>
      setDoc(
        doc(db, "users", currentUser.uid),
        { lastSeen: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    beat();
    const interval = setInterval(beat, 45 * 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

const value = {
    currentUser,
    userRole,
    userProfile,
    loading,        // ← YEH ADD KAREIN
    signup,
    login,
    googleLogin,
    logout,
    resetPassword,
    deleteAccount
  };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}