import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function saveUserToFirestore(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      role: "user",
      createdAt: new Date().toISOString()
    });
  } else {
    // displayName update karo agar missing hai
    await setDoc(userRef, {
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    }, { merge: true });
  }
}