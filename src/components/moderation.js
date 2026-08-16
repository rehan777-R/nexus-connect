import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";

// Message bhejne ke baad background mein AI se check karwata hai
// ke content appropriate hai ya nahi. Sending block nahi hoti - flag
// baad mein silently apply ho jata hai agar zaroorat pade.
export async function moderateInBackground(messageId, text) {
  try {
    const response = await fetch("/api/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    await updateDoc(doc(db, "messages", messageId), {
      flagged: !!data.flagged,
      flagReason: data.flagged ? data.reason || "Flagged by AI moderation" : "",
    });
  } catch (err) {
    console.error("Moderation check failed:", err);
  }
}
