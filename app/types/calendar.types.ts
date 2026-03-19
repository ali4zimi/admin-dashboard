import type { Timestamp } from 'firebase/firestore'

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  duration: string
  author?: string
  authorId?: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
  [key: string]: any
}

export type CreateCalendarEventData = Omit<
  CalendarEvent,
  'id' | 'createdAt' | 'updatedAt' | 'author' | 'authorId'
>

export type UpdateCalendarEventData = Partial<CalendarEvent>
