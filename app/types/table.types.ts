import type { Timestamp } from 'firebase/firestore'

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'blocked'

export interface Table {
  id?: string
  name: string
  capacity: number
  status: TableStatus
  currentOrderId?: string
  currentReservationId?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type CreateTableData = Omit<Table, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTableData = Partial<Table>
