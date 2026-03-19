/**
 * Calendar Service - Raw Firebase operations for calendar events
 *
 * This service contains only Firebase CRUD operations.
 * No state management, no activity logging - those belong in the store.
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { getFirestore } from './firebase'
import type {
  CalendarEvent,
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from '~/types/calendar.types'

const COLLECTION_NAME = 'calendarEvents'

const toDate = (val: any): Date | null => {
  if (!val) return null
  if (val instanceof Date) return val
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

/**
 * Fetch all events ordered by creation date.
 */
export const fetchAllEvents = async (): Promise<CalendarEvent[]> => {
  const firestore = getFirestore()
  const eventsRef = collection(firestore, COLLECTION_NAME)
  const q = query(eventsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => {
    const data = docItem.data()
    return {
      id: docItem.id,
      ...data,
      date: (toDate(data.date) || new Date()) as Date,
      createdAt: toDate(data.createdAt) || undefined,
      updatedAt: toDate(data.updatedAt) || undefined,
    }
  }) as CalendarEvent[]
}

/**
 * Fetch one event by ID.
 */
export const fetchEventById = async (id: string): Promise<CalendarEvent | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  const data = docSnap.data()
  return {
    id: docSnap.id,
    ...data,
    date: (toDate(data.date) || new Date()) as Date,
    createdAt: toDate(data.createdAt) || undefined,
    updatedAt: toDate(data.updatedAt) || undefined,
  } as CalendarEvent
}

/**
 * Create a new event.
 */
export const createEvent = async (
  eventData: CreateCalendarEventData,
  author: string,
  authorId: string
): Promise<CalendarEvent> => {
  const firestore = getFirestore()
  const eventsRef = collection(firestore, COLLECTION_NAME)

  const payload = {
    ...eventData,
    author,
    authorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(eventsRef, payload)

  const createdEvent: CalendarEvent = {
    id: docRef.id,
    title: eventData.title,
    date: eventData.date,
    time: eventData.time,
    duration: eventData.duration,
    ...eventData,
    author,
    authorId,
  }

  return createdEvent
}

/**
 * Update an existing event.
 */
export const updateEvent = async (
  id: string,
  eventData: UpdateCalendarEventData
): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)

  const payload = {
    ...eventData,
    updatedAt: serverTimestamp(),
  }

  await updateDoc(docRef, payload)
}

/**
 * Delete an event by ID.
 */
export const deleteEvent = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}
