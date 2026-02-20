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
  arrayUnion,
  arrayRemove,
  orderBy,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from './firebase';
import type { User, Team, Hackathon } from './types';

const USERS_COLLECTION = 'users';
const TEAMS_COLLECTION = 'teams';
const CHATS_COLLECTION = 'chats';
const NOTIFICATIONS_COLLECTION = 'notifications';
const HACKATHONS_COLLECTION = 'hackathons';

/**
 * Sign up a new user
 */
export async function signUpUser(
  email: string,
  password: string,
  userData: Partial<User>
) {
  console.log('Starting signUpUser for:', email);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  console.log('Firebase Auth user created:', firebaseUser.uid);

  if (userData.name) {
    console.log('Updating profile display name...');
    await updateProfile(firebaseUser, { displayName: userData.name });
  }

  // Save user data to Firestore
  console.log('Writing user data to Firestore...');
  try {
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      skills: userData.skills || [],
      interests: userData.interests || [],
      location: userData.location || 'Unknown',
      bio: userData.bio || '',
      avatar: userData.avatar || '1',
      experience: userData.experience || 'Beginner',
      githubUrl: userData.githubUrl || '',
      websiteUrl: userData.websiteUrl || '', // Added default
      githubStats: userData.githubStats || {
        topRepos: [],
        languages: [],
        stars: 0,
        forks: 0,
        recentActivity: 'No recent activity yet'
      },
      role: email === process.env.MAIL ? 'admin' : 'user'
    });
    console.log('Firestore user data saved successfully');
  } catch (error) {
    console.error('Error saving user data to Firestore:', error);
    throw error;
  }

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
  if (!userDoc.exists()) return null;

  const data = userDoc.data() as User;

  // Migration: Ensure role exists
  if (!data.role) {
    const role = data.email === 'dynamo24626@gmail.com' ? 'admin' : 'user';
    await updateDoc(doc(db, USERS_COLLECTION, userId), { role });
    data.role = role;
  }

  // Migration: Ensure githubStats matches type
  if (!data.githubStats || !data.githubStats.languages) {
    const githubStats = {
      topRepos: data.githubStats?.topRepos || [],
      languages: data.githubStats?.languages || [],
      stars: data.githubStats?.stars || 0,
      forks: data.githubStats?.forks || 0,
      recentActivity: data.githubStats?.recentActivity || 'No recent activity yet'
    };
    await updateDoc(doc(db, USERS_COLLECTION, userId), { githubStats });
    data.githubStats = githubStats;
  }

  // Migration: Ensure favorites exists
  if (!data.favorites) {
    await updateDoc(doc(db, USERS_COLLECTION, userId), { favorites: [] });
    data.favorites = [];
  }

  return data;
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
 * Delete a user profile (Admin only)
 */
export async function deleteUser(userId: string) {
  await deleteDoc(doc(db, USERS_COLLECTION, userId));
}

/**
 * Toggle favorite developer
 */
export async function toggleFavoriteDeveloper(currentUserId: string, targetUserId: string) {
  const userRef = doc(db, USERS_COLLECTION, currentUserId);
  const user = await getUserProfile(currentUserId);
  if (!user) return;

  const currentFavorites = user.favorites || [];
  const isFavorite = currentFavorites.includes(targetUserId);

  await updateDoc(userRef, {
    favorites: isFavorite ? arrayRemove(targetUserId) : arrayUnion(targetUserId),
    updatedAt: new Date(),
  });
}

/**
 * Update user GitHub stats in Firestore
 */
export async function updateUserGithubStats(userId: string, stats: any) {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    githubStats: stats,
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
  return snapshot.docs.map((doc: any) => ({
    ...doc.data(),
    id: doc.id
  } as User));
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

  // Create notification for the receiver
  // We need to figure out the receiverId from conversationId
  const ids = conversationId.split('_');
  const receiverId = ids.find(id => id !== message.senderId);
  if (receiverId) {
    await createNotification({
      userId: receiverId,
      title: 'New Message',
      message: `You have a new message: "${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}"`,
      type: 'ChatMessage',
      link: '/chat',
      read: false,
      createdAt: new Date()
    });
  }

  return msgRef.id;
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<Team[]> {
  const snapshot = await getDocs(collection(db, TEAMS_COLLECTION));
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Team[];
}

/**
 * Get a single team
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  const teamDoc = await getDoc(doc(db, TEAMS_COLLECTION, teamId));
  if (!teamDoc.exists()) return null;
  return { id: teamDoc.id, ...teamDoc.data() } as Team;
}

/**
 * Join a team directly (for admins/creation)
 */
export async function joinTeam(teamId: string, user: { id: string; name: string; avatar: string }) {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, {
    members: arrayUnion(user),
    updatedAt: new Date(),
  });
}

/**
 * Request to join a team
 */
export async function requestToJoinTeam(teamId: string, user: Pick<User, 'id' | 'name' | 'avatar' | 'skills'>) {
  const team = await getTeam(teamId);
  if (!team) throw new Error('Team not found');

  // Check skill overlap
  const hasMatchingSkill = team.requiredSkills.some(skill =>
    user.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
  );

  if (!hasMatchingSkill) {
    throw new Error('You do not have any of the required skills for this team.');
  }

  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, {
    pendingRequests: arrayUnion(user),
  });

  // Notify team creator
  await createNotification({
    userId: team.createdBy,
    title: 'New Join Request',
    message: `${user.name} wants to join ${team.name}`,
    type: 'JoinRequest',
    link: `/teams/${teamId}?tab=requests`,
    read: false,
    createdAt: new Date()
  });
}

/**
 * Approve join request
 */
export async function approveJoinRequest(teamId: string, user: Pick<User, 'id' | 'name' | 'avatar' | 'skills'>) {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  const team = await getTeam(teamId);
  if (!team) return;

  const updatedRequests = (team.pendingRequests || []).filter(r => r.id !== user.id);

  await updateDoc(teamRef, {
    members: arrayUnion({ id: user.id, name: user.name, avatar: user.avatar }),
    pendingRequests: updatedRequests,
    updatedAt: new Date(),
  });

  // Notify user
  await createNotification({
    userId: user.id,
    title: 'Request Approved!',
    message: `You have been accepted into ${team.name}`,
    type: 'TeamUpdate',
    link: `/teams/${teamId}`,
    read: false,
    createdAt: new Date()
  });
}

/**
 * Reject join request
 */
export async function rejectJoinRequest(teamId: string, userId: string) {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  const team = await getTeam(teamId);
  if (!team) return;

  const updatedRequests = (team.pendingRequests || []).filter(r => r.id !== userId);

  await updateDoc(teamRef, {
    pendingRequests: updatedRequests,
    updatedAt: new Date(),
  });
}

/**
 * Task Management
 */
export async function addTaskToTeam(teamId: string, task: any) {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, {
    tasks: arrayUnion({ ...task, id: Math.random().toString(36).substr(2, 9) }),
    updatedAt: new Date(),
  });
}

/**
 * Meeting Management
 */
export async function scheduleMeeting(teamId: string, meeting: any) {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, {
    meetings: arrayUnion({ ...meeting, id: Math.random().toString(36).substr(2, 9) }),
    updatedAt: new Date(),
  });
}

/**
 * Notification Management
 */
export async function createNotification(notification: any) {
  const notifRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
  await setDoc(notifRef, {
    ...notification,
    id: notifRef.id,
    createdAt: new Date(),
  });
}

export async function getUserNotifications(userId: string) {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function markNotificationAsRead(notificationId: string) {
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
    read: true
  });
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(conversationId: string) {
  const messagesRef = collection(db, CHATS_COLLECTION, conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Hackathon Management
export async function getAllHackathons(): Promise<Hackathon[]> {
  const hackathonsRef = collection(db, HACKATHONS_COLLECTION);
  const q = query(hackathonsRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hackathon));
}

export async function createHackathon(hackathonData: Omit<Hackathon, 'id'>) {
  const hackathonsRef = collection(db, HACKATHONS_COLLECTION);
  const docRef = doc(hackathonsRef);
  await setDoc(docRef, {
    ...hackathonData,
    id: docRef.id,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateHackathon(hackathonId: string, updates: Partial<Hackathon>) {
  const hackathonRef = doc(db, HACKATHONS_COLLECTION, hackathonId);
  await updateDoc(hackathonRef, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function deleteHackathon(hackathonId: string) {
  const hackathonRef = doc(db, HACKATHONS_COLLECTION, hackathonId);
  await deleteDoc(hackathonRef);
}
