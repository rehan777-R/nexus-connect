import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCv6ZAN2y5bI6hS7WWIb56MrP3iZTG_kbY",
  authDomain: "my-crud-app-3d948.firebaseapp.com",
  projectId: "my-crud-app-3d948",
  storageBucket: "my-crud-app-3d948.firebasestorage.app",
  messagingSenderId: "1047304411123",
  appId: "1:1047304411123:web:2ab0328c3408d96c306486"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();