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
  serverTimestamp,
} from 'firebase/firestore'
import { getFirestore } from './firebase'
import type { UserData, CreateUserData, UpdateUserData } from '~/types/user.types'

const COLLECTION_NAME = 'users'

/**
 * Fetch all users ordered by creation date
 */
export const fetchAllUsers = async (): Promise<UserData[]> => {
  const firestore = getFirestore()
  const usersRef = collection(firestore, COLLECTION_NAME)
  const q = query(usersRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as UserData[]
}

/**
 * Fetch a single user by ID
 */
export const fetchUserById = async (id: string): Promise<UserData | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserData
  }

  return null
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
    joined: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(usersRef, newUserData)

  return {
    id: docRef.id,
    ...userData,
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
