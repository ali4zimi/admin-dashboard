/**
 * Reservations Service - Raw Firebase operations for reservations.
 * All paths are scoped to clients/{clientId} via the helpers in ./firebase.
 */

import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { clientCol, clientDoc } from './firebase'
import type { CreateReservationData, Reservation, UpdateReservationData } from '@restaurant-platform/types/reservation.types'

const RESERVATION_COLLECTION = 'reservations'

export const fetchAllReservations = async (): Promise<Reservation[]> => {
  const reservationsRef = clientCol(RESERVATION_COLLECTION)
  const q = query(reservationsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as Reservation[]
}

export const fetchReservationById = async (id: string): Promise<Reservation | null> => {
  const docRef = clientDoc(RESERVATION_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Reservation
  }

  return null
}

export const createReservation = async (
  reservationData: CreateReservationData,
  createdBy: string
): Promise<Reservation> => {
  const reservationsRef = clientCol(RESERVATION_COLLECTION)

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

export const updateReservation = async (
  id: string,
  reservationData: UpdateReservationData
): Promise<void> => {
  const docRef = clientDoc(RESERVATION_COLLECTION, id)

  await updateDoc(docRef, {
    ...reservationData,
    updatedAt: serverTimestamp(),
  })
}

export const deleteReservation = async (id: string): Promise<void> => {
  const docRef = clientDoc(RESERVATION_COLLECTION, id)
  await deleteDoc(docRef)
}
