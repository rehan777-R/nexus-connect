// Shared domain types for the app's Firestore documents.
import type { Timestamp } from 'firebase/firestore';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdBy: string;
  createdByEmail: string;
  createdAt: string;
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
  lastSeen?: string;
  avatarColor?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp?: Timestamp;
  edited?: boolean;
  flagged?: boolean;
  flagReason?: string;
  reactions?: Record<string, string[]>;
}

// A chat contact as loaded from the users collection ({ id: doc.id, ...data }).
export interface ChatUser {
  id: string;
  email?: string;
  displayName?: string;
  avatarColor?: string;
  lastSeen?: string;
}
