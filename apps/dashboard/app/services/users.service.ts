/**
 * Users Service - Raw Firebase operations for users.
 * All paths are scoped to clients/{clientId} via the helpers in ./firebase.
 *
 * Document shape matches what the super-admin app writes:
 * { authUid, displayName, email, role, status, createdAt, updatedAt, ... }
 */

import {
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
import { clientCol, clientDoc } from './firebase'
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
  displayName: typeof data.displayName === 'string' ? data.displayName : '',
  email: typeof data.email === 'string' ? data.email : '',
  role: normalizeRole(data.role),
  status: normalizeStatus(data.status),
}) as UserData

export const fetchAllUsers = async (): Promise<UserData[]> => {
  const usersRef = clientCol(COLLECTION_NAME)
  const q = query(usersRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => mapUserDoc(docItem.id, docItem.data()))
}

export const fetchUserById = async (id: string): Promise<UserData | null> => {
  const docRef = clientDoc(COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return mapUserDoc(docSnap.id, docSnap.data() as Record<string, any>)
  }

  return null
}

export const fetchUserByUid = async (uid: string): Promise<UserData | null> => {
  const usersRef = clientCol(COLLECTION_NAME)
  const q = query(usersRef, where('authUid', '==', uid), limit(1))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  const found = snapshot.docs[0]!

  return mapUserDoc(found.id, found.data())
}

export const fetchUserByEmail = async (email: string): Promise<UserData | null> => {
  const usersRef = clientCol(COLLECTION_NAME)
  const q = query(usersRef, where('email', '==', email), limit(1))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  const found = snapshot.docs[0]!

  return mapUserDoc(found.id, found.data())
}

export const createUser = async (userData: CreateUserData): Promise<UserData> => {
  const usersRef = clientCol(COLLECTION_NAME)

  const newUserData = {
    ...userData,
    role: normalizeRole(userData.role),
    status: normalizeStatus(userData.status),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(usersRef, newUserData)

  return {
    id: docRef.id,
    ...userData,
    role: normalizeRole(userData.role),
    status: normalizeStatus(userData.status),
  }
}

export const updateUser = async (id: string, userData: UpdateUserData): Promise<void> => {
  const docRef = clientDoc(COLLECTION_NAME, id)

  await updateDoc(docRef, {
    ...userData,
    ...(userData.role ? { role: normalizeRole(userData.role) } : {}),
    ...(userData.status ? { status: normalizeStatus(userData.status) } : {}),
    updatedAt: serverTimestamp(),
  })
}

export const deleteUser = async (id: string): Promise<void> => {
  const docRef = clientDoc(COLLECTION_NAME, id)
  await deleteDoc(docRef)
}
