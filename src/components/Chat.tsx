import { usePageTitle } from '../usePageTitle';
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import UsersList from "./UsersList";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import type { ChatUser } from "../types";

const Chat = () => {
  usePageTitle('Chat');
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const saveUser = async () => {
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
    };
    saveUser();
  }, []);

  return (
    <div className="chat-wrapper">
      <UsersList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
      <div className="chat-main">
        <ChatWindow selectedUser={selectedUser} />
        <ChatInput selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default Chat;