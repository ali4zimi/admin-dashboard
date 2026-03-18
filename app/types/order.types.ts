import type { Timestamp } from 'firebase/firestore'
import type { Table } from './table.types'

export type OrderStatus = 'pending' | 'preparing' | 'served' | 'paid' | 'cancelled'
export type OrderType = 'dine-in' | 'takeaway' | 'delivery'
export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served'

export interface OrderItem {
  id?: string
  itemId: string
  name: string
  price: number
  quantity: number
  notes?: string
  status: OrderItemStatus
}

export interface OrderItemInput {
  itemId: string
  quantity: number
  notes?: string
  status: OrderItemStatus
  name?: string
  price?: number
}

export interface Order {
  id?: string
  table: Table
  status: OrderStatus
  orderType: OrderType
  totalAmount: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
  createdBy: string
  items?: OrderItem[]
}

export type CreateOrderData = Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'items'> & {
  items: OrderItemInput[]
}

export type UpdateOrderData = Partial<Order>
