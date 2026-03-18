/**
 * Reservations Service - Raw Firebase operations for reservations
 *
 * This service contains only Firebase CRUD operations.
 * No state management, no activity logging - those belong in the store.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { getFirestore } from './firebase'
import type { CreateReservationData, Reservation, UpdateReservationData } from '~/types/reservation.types'

const RESERVATION_COLLECTION = 'reservations'

/**
 * Fetch all reservations ordered by creation date
 */
export const fetchAllReservations = async (): Promise<Reservation[]> => {
  const firestore = getFirestore()
  const reservationsRef = collection(firestore, RESERVATION_COLLECTION)
  const q = query(reservationsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as Reservation[]
}

/**
 * Fetch a single reservation by ID
 */
export const fetchReservationById = async (id: string): Promise<Reservation | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, RESERVATION_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Reservation
  }

  return null
}

/**
 * Create a new reservation
 * Returns the created reservation with its ID
 */
export const createReservation = async (
  reservationData: CreateReservationData,
  createdBy: string
): Promise<Reservation> => {
  const firestore = getFirestore()
  const reservationsRef = collection(firestore, RESERVATION_COLLECTION)

  const newReservationData = {
    ...reservationData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy,
  }

  const docRef = await addDoc(reservationsRef, newReservationData)

  return {
    id: docRef.id,
    ...reservationData,
    createdBy,
  }
}

/**
 * Update an existing reservation
 */
export const updateReservation = async (
  id: string,
  reservationData: UpdateReservationData
): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, RESERVATION_COLLECTION, id)

  await updateDoc(docRef, {
    ...reservationData,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a reservation by ID
 */
export const deleteReservation = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, RESERVATION_COLLECTION, id)
  await deleteDoc(docRef)
}
