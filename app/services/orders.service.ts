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
 * Fetch all orders with items subcollection, ordered by creation date.
 */
export const fetchAllOrders = async (): Promise<Order[]> => {
  const firestore = getFirestore()
  const ordersRef = collection(firestore, ORDER_COLLECTION)
  const q = query(ordersRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  const orders: Order[] = []

  for (const orderDoc of snapshot.docs) {
    const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order
    const itemsRef = collection(orderDoc.ref, 'items')
    const itemsSnap = await getDocs(itemsRef)

    orderData.items = itemsSnap.docs.map((itemDoc) => ({
      id: itemDoc.id,
      ...itemDoc.data(),
    })) as OrderItem[]

    orders.push(orderData)
  }

  return orders
}

/**
 * Fetch one order with items by ID.
 */
export const fetchOrderById = async (id: string): Promise<Order | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ORDER_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  const orderData = { id: docSnap.id, ...docSnap.data() } as Order
  const itemsRef = collection(docRef, 'items')
  const itemsSnap = await getDocs(itemsRef)

  orderData.items = itemsSnap.docs.map((itemDoc) => ({
    id: itemDoc.id,
    ...itemDoc.data(),
  })) as OrderItem[]

  return orderData
}

/**
 * Create order document and items subcollection.
 */
export const createOrder = async (orderData: CreateOrderServiceData): Promise<Order> => {
  const firestore = getFirestore()
  const ordersRef = collection(firestore, ORDER_COLLECTION)

  const { items, ...orderFields } = orderData
  const newOrderData = {
    ...orderFields,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(ordersRef, newOrderData)

  for (const item of items) {
    await addDoc(collection(docRef, 'items'), item)
  }

  return {
    id: docRef.id,
    ...orderFields,
    items,
  }
}

/**
 * Update order document fields (items are managed through item-specific APIs).
 */
export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ORDER_COLLECTION, id)

  const { items, ...updatableFields } = orderData

  await updateDoc(docRef, {
    ...updatableFields,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete order and all items in its subcollection.
 */
export const deleteOrder = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ORDER_COLLECTION, id)

  const itemsRef = collection(docRef, 'items')
  const itemsSnap = await getDocs(itemsRef)

  for (const itemDoc of itemsSnap.docs) {
    await deleteDoc(itemDoc.ref)
  }

  await deleteDoc(docRef)
}

/**
 * Add one item to order items subcollection.
 */
export const addOrderItem = async (orderId: string, item: Omit<OrderItem, 'id'>): Promise<OrderItem> => {
  const firestore = getFirestore()
  const orderRef = doc(firestore, ORDER_COLLECTION, orderId)
  const itemRef = await addDoc(collection(orderRef, 'items'), item)

  return {
    id: itemRef.id,
    ...item,
  }
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
  const itemRef = doc(orderRef, 'items', itemId)

  await updateDoc(itemRef, itemData)
}

/**
 * Delete one order item.
 */
export const deleteOrderItem = async (orderId: string, itemId: string): Promise<void> => {
  const firestore = getFirestore()
  const orderRef = doc(firestore, ORDER_COLLECTION, orderId)
  const itemRef = doc(orderRef, 'items', itemId)

  await deleteDoc(itemRef)
}
