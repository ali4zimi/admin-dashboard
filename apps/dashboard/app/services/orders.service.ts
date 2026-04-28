/**
 * Orders Service - Raw Firebase operations for orders.
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
import type { Order, OrderItem } from '~/types/order.types'

const ORDER_COLLECTION = 'orders'

interface CreateOrderServiceData {
  table: Order['table']
  tableIds?: string[]
  status: Order['status']
  orderType: Order['orderType']
  totalAmount: number
  createdBy: string
  items: Omit<OrderItem, 'id'>[]
  orderNumber?: string
}

export const fetchAllOrders = async (): Promise<Order[]> => {
  const ordersRef = clientCol(ORDER_COLLECTION)
  const q = query(ordersRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((orderDoc) => {
    const data = orderDoc.data() as Omit<Order, 'id'>
    return {
      id: orderDoc.id,
      ...data,
      items: data.items || [],
    }
  }) as Order[]
}

export const fetchOrderById = async (id: string): Promise<Order | null> => {
  const docRef = clientDoc(ORDER_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  const data = docSnap.data() as Omit<Order, 'id'>

  return {
    id: docSnap.id,
    ...data,
    items: data.items || [],
  } as Order
}

export const createOrder = async (orderData: CreateOrderServiceData): Promise<Order> => {
  const ordersRef = clientCol(ORDER_COLLECTION)

  const newOrderData = {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(ordersRef, newOrderData)

  return {
    id: docRef.id,
    ...orderData,
  }
}

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<void> => {
  const docRef = clientDoc(ORDER_COLLECTION, id)

  await updateDoc(docRef, {
    ...orderData,
    updatedAt: serverTimestamp(),
  })
}

export const deleteOrder = async (id: string): Promise<void> => {
  const docRef = clientDoc(ORDER_COLLECTION, id)
  await deleteDoc(docRef)
}

export const addOrderItem = async (orderId: string, item: Omit<OrderItem, 'id'>): Promise<OrderItem> => {
  const orderRef = clientDoc(ORDER_COLLECTION, orderId)
  const orderSnap = await getDoc(orderRef)

  if (!orderSnap.exists()) {
    throw new Error('Order not found')
  }

  const orderData = orderSnap.data() as Partial<Order>
  const currentItems = (orderData.items || []) as OrderItem[]

  const newItem: OrderItem = {
    id: `item_${Date.now()}`,
    ...item,
  }

  await updateDoc(orderRef, {
    items: [...currentItems, newItem],
    updatedAt: serverTimestamp(),
  })

  return newItem
}

export const updateOrderItem = async (
  orderId: string,
  itemId: string,
  itemData: Partial<OrderItem>
): Promise<void> => {
  const orderRef = clientDoc(ORDER_COLLECTION, orderId)
  const orderSnap = await getDoc(orderRef)

  if (!orderSnap.exists()) {
    throw new Error('Order not found')
  }

  const orderData = orderSnap.data() as Partial<Order>
  const currentItems = (orderData.items || []) as OrderItem[]

  const updatedItems = currentItems.map((item) =>
    item.id === itemId ? { ...item, ...itemData } : item
  )

  await updateDoc(orderRef, {
    items: updatedItems,
    updatedAt: serverTimestamp(),
  })
}

export const deleteOrderItem = async (orderId: string, itemId: string): Promise<void> => {
  const orderRef = clientDoc(ORDER_COLLECTION, orderId)
  const orderSnap = await getDoc(orderRef)

  if (!orderSnap.exists()) {
    throw new Error('Order not found')
  }

  const orderData = orderSnap.data() as Partial<Order>
  const currentItems = (orderData.items || []) as OrderItem[]
  const filteredItems = currentItems.filter((item) => item.id !== itemId)

  await updateDoc(orderRef, {
    items: filteredItems,
    updatedAt: serverTimestamp(),
  })
}
