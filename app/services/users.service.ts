/**
 * Users Service - Raw Firebase operations for users
 *
 * This service contains only Firebase CRUD operations.
 * No state management, no activity logging - those belong in the store.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirestore } from './firebase'
import type { UserData, UserRole, UserStatus, CreateUserData, UpdateUserData } from '~/types/user.types'

const COLLECTION_NAME = 'users'

const normalizeRole = (role: unknown): UserRole => {
  return String(role).toLowerCase() === 'admin' ? 'admin' : 'user'
}

const normalizeStatus = (status: unknown): UserStatus => {
  return String(status).toLowerCase() === 'active' ? 'active' : 'inactive'
}

const mapUserDoc = (id: string, data: Record<string, any>): UserData => ({
  id,
  ...data,
  role: normalizeRole(data.role),
  status: normalizeStatus(data.status),
}) as UserData

/**
 * Fetch all users ordered by creation date
 */
export const fetchAllUsers = async (): Promise<UserData[]> => {
  const firestore = getFirestore()
  const usersRef = collection(firestore, COLLECTION_NAME)
  const q = query(usersRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => mapUserDoc(docItem.id, docItem.data()))
}

/**
 * Fetch a single user by ID
 */
export const fetchUserById = async (id: string): Promise<UserData | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return mapUserDoc(docSnap.id, docSnap.data() as Record<string, any>)
  }

  return null
}

/**
 * Fetch one user by Firebase Auth UID.
 */
export const fetchUserByUid = async (uid: string): Promise<UserData | null> => {
  const firestore = getFirestore()
  const usersRef = collection(firestore, COLLECTION_NAME)
  const q = query(usersRef, where('uid', '==', uid), limit(1))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  const found = snapshot.docs[0]!

  return mapUserDoc(found.id, found.data())
}

/**
 * Fetch one user by email.
 */
export const fetchUserByEmail = async (email: string): Promise<UserData | null> => {
  const firestore = getFirestore()
  const usersRef = collection(firestore, COLLECTION_NAME)
  const q = query(usersRef, where('email', '==', email), limit(1))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  const found = snapshot.docs[0]!

  return mapUserDoc(found.id, found.data())
}

/**
 * Create a new user
 * Returns the created user with its ID
 */
export const createUser = async (userData: CreateUserData): Promise<UserData> => {
  const firestore = getFirestore()
  const usersRef = collection(firestore, COLLECTION_NAME)

  const newUserData = {
    ...userData,
    role: normalizeRole(userData.role),
    status: normalizeStatus(userData.status),
    joined: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(usersRef, newUserData)

  return {
    id: docRef.id,
    ...userData,
    role: normalizeRole(userData.role),
    status: normalizeStatus(userData.status),
    joined: new Date(),
  }
}

/**
 * Update an existing user
 */
export const updateUser = async (id: string, userData: UpdateUserData): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)

  await updateDoc(docRef, {
    ...userData,
    ...(userData.role ? { role: normalizeRole(userData.role) } : {}),
    ...(userData.status ? { status: normalizeStatus(userData.status) } : {}),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a user by ID
 */
export const deleteUser = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}
