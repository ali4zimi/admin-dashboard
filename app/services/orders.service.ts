/**
 * Orders Service - Raw Firebase operations for orders
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
import type { Order, OrderItem } from '~/types/order.types'

const ORDER_COLLECTION = 'orders'

interface CreateOrderServiceData {
  table: Order['table']
  status: Order['status']
  orderType: Order['orderType']
  totalAmount: number
  createdBy: string
  items: Omit<OrderItem, 'id'>[]
}

/**
 * Fetch all orders ordered by creation date.
 * Items are stored directly on each order document.
 */
export const fetchAllOrders = async (): Promise<Order[]> => {
  const firestore = getFirestore()
  const ordersRef = collection(firestore, ORDER_COLLECTION)
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

/**
 * Fetch one order by ID.
 * Items are stored directly on the order document.
 */
export const fetchOrderById = async (id: string): Promise<Order | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ORDER_COLLECTION, id)
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

/**
 * Create order document with items embedded in the same document.
 */
export const createOrder = async (orderData: CreateOrderServiceData): Promise<Order> => {
  const firestore = getFirestore()
  const ordersRef = collection(firestore, ORDER_COLLECTION)

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

/**
 * Update order document fields, including items.
 */
export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ORDER_COLLECTION, id)

  await updateDoc(docRef, {
    ...orderData,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete order by ID.
 */
export const deleteOrder = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ORDER_COLLECTION, id)
  await deleteDoc(docRef)
}

/**
 * Add one item to order items array.
 */
export const addOrderItem = async (orderId: string, item: Omit<OrderItem, 'id'>): Promise<OrderItem> => {
  const firestore = getFirestore()
  const orderRef = doc(firestore, ORDER_COLLECTION, orderId)
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

/**
 * Update one order item.
 */
export const updateOrderItem = async (
  orderId: string,
  itemId: string,
  itemData: Partial<OrderItem>
): Promise<void> => {
  const firestore = getFirestore()
  const orderRef = doc(firestore, ORDER_COLLECTION, orderId)
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

/**
 * Delete one order item.
 */
export const deleteOrderItem = async (orderId: string, itemId: string): Promise<void> => {
  const firestore = getFirestore()
  const orderRef = doc(firestore, ORDER_COLLECTION, orderId)
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
