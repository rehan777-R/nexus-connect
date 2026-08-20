import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import { saveUserToFirestore } from "./saveUser";
import type { UserProfile, UserRole } from "./types";

interface AuthContextValue {
  currentUser: User | null;
  userRole: UserRole | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  googleLogin: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(result.user);
    return result;
  }

  function login(email: string, password: string) {
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

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  function deleteAccount() {
    if (!auth.currentUser) return Promise.reject(new Error("Not signed in"));
    return deleteUser(auth.currentUser);
  }

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
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
            const profile = snap.data() as UserProfile;
            setUserRole(profile.role);
            setUserProfile(profile);
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

  const value: AuthContextValue = {
    currentUser,
    userRole,
    userProfile,
    loading,
    signup,
    login,
    googleLogin,
    logout,
    resetPassword,
    deleteAccount,
  };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
