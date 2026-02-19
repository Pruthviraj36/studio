/**
 * Firebase user management and database services
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  QueryConstraint,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './firebase';
import type { User } from './types';

const USERS_COLLECTION = 'users';
const TEAMS_COLLECTION = 'teams';
const CHATS_COLLECTION = 'chats';

/**
 * Sign up a new user
 */
export async function signUpUser(
  email: string,
  password: string,
  userData: Partial<User>
) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  if (userData.name) {
    await updateProfile(firebaseUser, { displayName: userData.name });
  }

  // Save user data to Firestore
  await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return firebaseUser;
}

/**
 * Sign in with email and password
 */
export async function signInUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  return signOut(auth);
}

/**
 * Get current user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  return userDoc.exists() ? (userDoc.data() as User) : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    ...updates,
    updatedAt: new Date(),
  });
}

/**
 * Search users by skills or name
 */
export async function searchUsersBySkill(skill: string): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('skills', 'array-contains', skill)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc: any) => doc.data() as User);
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, USERS_COLLECTION));
  return snapshot.docs.map((doc: any) => doc.data() as User);
}

/**
 * Create a team
 */
export async function createTeam(
  teamData: any
) {
  const teamRef = doc(collection(db, TEAMS_COLLECTION));
  await setDoc(teamRef, {
    ...teamData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return teamRef.id;
}

/**
 * Save a chat message
 */
export async function saveChatMessage(
  conversationId: string,
  message: {
    senderId: string;
    content: string;
    timestamp: Date;
  }
) {
  const msgRef = doc(collection(db, CHATS_COLLECTION, conversationId, 'messages'));
  await setDoc(msgRef, {
    ...message,
    createdAt: new Date(),
  });
  return msgRef.id;
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(conversationId: string) {
  const snapshot = await getDocs(
    collection(db, CHATS_COLLECTION, conversationId, 'messages')
  );
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
