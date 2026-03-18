import type { Timestamp } from 'firebase/firestore'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export interface Reservation {
  id?: string
  customerId?: string
  customerName: string
  phone: string
  partySize: number
  tableIds: string[]
  startTime: Timestamp | Date | string
  endTime: Timestamp | Date | string
  status: ReservationStatus
  depositAmount?: number
  depositPaid?: boolean
  notes?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  createdBy?: string
}

export type CreateReservationData = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
export type UpdateReservationData = Partial<Reservation>
