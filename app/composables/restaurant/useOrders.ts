/**
 * Orders Composable - Thin wrapper around Orders Store
 */

import { storeToRefs } from 'pinia'
import { useOrdersStore } from '~/stores/orders.store'
import type { CreateOrderData, OrderItem, UpdateOrderData } from '~/types/order.types'

export const useOrders = () => {
  const store = useOrdersStore()
  const { orders, loading, error } = storeToRefs(store)

  return {
    orders,
    loading,
    error,
    fetchOrders: (forceRefresh = false) => store.fetchOrders(forceRefresh),
    getOrder: (id: string) => store.getOrder(id),
    createOrder: (data: CreateOrderData) => store.createOrder(data),
    updateOrder: (id: string, data: UpdateOrderData) => store.updateOrder(id, data),
    deleteOrder: (id: string) => store.deleteOrder(id),
    addOrderItem: (orderId: string, item: Omit<OrderItem, 'id'>) => store.addOrderItem(orderId, item),
    updateOrderItem: (orderId: string, itemId: string, itemData: Partial<OrderItem>) =>
      store.updateOrderItem(orderId, itemId, itemData),
    deleteOrderItem: (orderId: string, itemId: string) => store.deleteOrderItem(orderId, itemId),
    invalidateCache: () => store.invalidateCache(),
    clearStore: () => store.clearStore(),
    getOrderById: store.getOrderById,
    getOrdersByStatus: store.getOrdersByStatus,
  }
}
