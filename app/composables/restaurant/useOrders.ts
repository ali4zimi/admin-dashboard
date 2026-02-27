import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { useActivityLog } from '~/composables/useActivityLog'
import { useMenu } from '~/composables/restaurant/useMenu'
import { useTables } from '~/composables/restaurant/useTables'
import type { Table } from '~/composables/restaurant/useTables'

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

export const useOrders = () => {
  const { firestore } = useFirebase()
  const { user } = useAuth()
  const { logActivity } = useActivityLog()

  const orders = useState<Order[]>('orders', () => [])
  const loading = useState<boolean>('orders-loading', () => false)
  const error = useState<string | null>('orders-error', () => null)
  const { getMenuItem } = useMenu()

  const ORDER_COLLECTION = 'orders'

  // CRUD for Orders
  const fetchOrders = async () => {
    if (!firestore) return []
    loading.value = true
    error.value = null
    try {
      const ordersRef = collection(firestore, ORDER_COLLECTION)
      const q = query(ordersRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const orderList: Order[] = []
      for (const docSnap of snapshot.docs) {
        const orderData = { id: docSnap.id, ...docSnap.data() } as Order
        // Fetch order items subcollection
        const itemsRef = collection(docSnap.ref, 'items')
        const itemsSnap = await getDocs(itemsRef)
        orderData.items = itemsSnap.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() })) as OrderItem[]
        orderList.push(orderData)
      }
      orders.value = orderList
      return orders.value
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch orders'
      return []
    } finally {
      loading.value = false
    }
  }

  const getOrder = async (id: string) => {
    if (!firestore) return null
    try {
      const docRef = doc(firestore, ORDER_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() } as Order
        // Fetch order items subcollection
        const itemsRef = collection(docRef, 'items')
        const itemsSnap = await getDocs(itemsRef)
        orderData.items = itemsSnap.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() })) as OrderItem[]
        return orderData
      }
      return null
    } catch (e: any) {
      error.value = e.message || 'Failed to get order'
      return null
    }
  }

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'items'> & { items: Omit<OrderItem, 'id' | 'name' | 'price'>[] }) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const ordersRef = collection(firestore, ORDER_COLLECTION)
      // Fetch menu item snapshot for each order item
      const itemsWithSnapshot = []
      for (const item of orderData.items) {
        let name = ''
        let price = 0
        if (item.itemId) {
          const menuItem = await getMenuItem(item.itemId)
          if (menuItem) {
            name = menuItem.name
            price = menuItem.price
          }
        }
        itemsWithSnapshot.push({ ...item, name, price })
      }
      const newOrderData = {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.value?.uid || '',
      }
      const { items, ...orderFields } = newOrderData
      const docRef = await addDoc(ordersRef, orderFields)
      // Add items to subcollection
      for (const item of itemsWithSnapshot) {
        await addDoc(collection(docRef, 'items'), item)
      }
      const newOrder: Order = { id: docRef.id, ...orderFields, items: itemsWithSnapshot }
      orders.value = [newOrder, ...orders.value]
      await logActivity({
        action: 'order.create',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'order',
        targetId: docRef.id,
        status: 'success',
        severity: 'info',
        message: `Created order for table ${orderData.tableId}`,
        changes: { before: null, after: { ...newOrder } },
        metadata: { tableId: orderData.tableId },
      })
      return newOrder
    } catch (e: any) {
      error.value = e.message || 'Failed to create order'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, ORDER_COLLECTION, id)
      await updateDoc(docRef, { ...orderData, updatedAt: serverTimestamp() })
      orders.value = orders.value.map(order => order.id === id ? { ...order, ...orderData } : order)
      const affectedOrder = orders.value.find(order => order.id === id)
      await logActivity({
        action: 'order.update',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'order',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Updated order for table ${orderData.tableId || affectedOrder?.tableId || ''}`,
        changes: { before: affectedOrder, after: { ...affectedOrder, ...orderData } },
        metadata: { tableId: orderData.tableId || affectedOrder?.tableId || '' },
      })
      return { id, ...orderData }
    } catch (e: any) {
      error.value = e.message || 'Failed to update order'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteOrder = async (id: string) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, ORDER_COLLECTION, id)
      // Delete all items in subcollection
      const itemsRef = collection(docRef, 'items')
      const itemsSnap = await getDocs(itemsRef)
      for (const itemDoc of itemsSnap.docs) {
        await deleteDoc(itemDoc.ref)
      }
      await deleteDoc(docRef)
      const deletedOrder = orders.value.find(order => order.id === id)
      await logActivity({
        action: 'order.delete',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'order',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Deleted order for table ${deletedOrder?.tableId || ''}`,
        changes: { before: deletedOrder, after: null },
        metadata: { tableId: deletedOrder?.tableId || '' },
      })
      orders.value = orders.value.filter(order => order.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete order'
      throw e
    } finally {
      loading.value = false
    }
  }

  // CRUD for Order Items
  const addOrderItem = async (orderId: string, item: Omit<OrderItem, 'id'>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    const docRef = doc(firestore, ORDER_COLLECTION, orderId)
    const itemsRef = collection(docRef, 'items')
    const itemDoc = await addDoc(itemsRef, item)
    return { id: itemDoc.id, ...item }
  }

  const updateOrderItem = async (orderId: string, itemId: string, itemData: Partial<OrderItem>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    const docRef = doc(firestore, ORDER_COLLECTION, orderId)
    const itemRef = doc(docRef, 'items', itemId)
    await updateDoc(itemRef, itemData)
    return { id: itemId, ...itemData }
  }

  const deleteOrderItem = async (orderId: string, itemId: string) => {
    if (!firestore) throw new Error('Firestore not initialized')
    const docRef = doc(firestore, ORDER_COLLECTION, orderId)
    const itemRef = doc(docRef, 'items', itemId)
    await deleteDoc(itemRef)
    return true
  }

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    addOrderItem,
    updateOrderItem,
    deleteOrderItem,
  }
}
