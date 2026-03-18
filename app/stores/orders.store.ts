/**
 * Orders Store - Global state management for orders
 *
 * Uses OrdersService for Firebase operations.
 * Handles caching, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as OrdersService from '~/services/orders.service'
import * as MenuService from '~/services/menu.service'
import type {
  CreateOrderData,
  Order,
  OrderItem,
  OrderItemInput,
  OrderStatus,
  UpdateOrderData,
} from '~/types/order.types'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [] as Order[],
    loading: false,
    error: null as string | null,
    lastFetched: null as number | null,
    cacheDuration: 5 * 60 * 1000,
  }),

  getters: {
    isCacheValid: (state) => {
      if (!state.lastFetched) return false
      return Date.now() - state.lastFetched < state.cacheDuration
    },

    getOrderById: (state) => (id: string) => {
      return state.orders.find((order) => order.id === id)
    },

    getOrdersByStatus: (state) => (status: OrderStatus) => {
      return state.orders.filter((order) => order.status === status)
    },
  },

  actions: {
    async fetchOrders(forceRefresh = false) {
      if (!forceRefresh && this.isCacheValid && this.orders.length > 0) {
        return this.orders
      }

      this.loading = true
      this.error = null

      try {
        this.orders = await OrdersService.fetchAllOrders()
        this.lastFetched = Date.now()
        return this.orders
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch orders'
        return []
      } finally {
        this.loading = false
      }
    },

    async getOrder(id: string) {
      const cachedOrder = this.getOrderById(id)
      if (cachedOrder) return cachedOrder

      try {
        const order = await OrdersService.fetchOrderById(id)
        if (order && !this.orders.find((existingOrder) => existingOrder.id === id)) {
          this.orders.push(order)
        }
        return order
      } catch (e: any) {
        this.error = e.message || 'Failed to get order'
        return null
      }
    },

    async createOrder(orderData: CreateOrderData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const itemsWithSnapshot: Omit<OrderItem, 'id'>[] = []

        for (const item of orderData.items) {
          let name = item.name || ''
          let price = item.price || 0

          if ((!name || !price) && item.itemId) {
            const menuItem = await MenuService.fetchMenuItemById(item.itemId)
            if (menuItem) {
              name = menuItem.name
              price = menuItem.price
            }
          }

          itemsWithSnapshot.push({
            itemId: item.itemId,
            name,
            price,
            quantity: item.quantity,
            notes: item.notes,
            status: item.status,
          })
        }

        const newOrder = await OrdersService.createOrder({
          table: orderData.table,
          status: orderData.status,
          orderType: orderData.orderType,
          totalAmount: orderData.totalAmount,
          createdBy: actorUser?.uid || '',
          items: itemsWithSnapshot,
        })

        this.orders = [newOrder, ...this.orders]

        await logActivity({
          action: 'order.create',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'order',
          targetId: newOrder.id || '',
          status: 'success',
          severity: 'info',
          message: `Created order for table ${orderData.table?.name || ''}`,
          changes: { before: null, after: { ...newOrder } },
          metadata: { table: orderData.table?.name || '' },
        })

        return newOrder
      } catch (e: any) {
        this.error = e.message || 'Failed to create order'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateOrder(id: string, orderData: UpdateOrderData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const beforeOrder = this.orders.find((order) => order.id === id)

        await OrdersService.updateOrder(id, orderData)

        this.orders = this.orders.map((order) =>
          order.id === id ? { ...order, ...orderData } : order
        )

        const afterOrder = this.orders.find((order) => order.id === id)

        await logActivity({
          action: 'order.update',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'order',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Updated order for table ${orderData.table?.name || afterOrder?.table?.name || ''}`,
          changes: { before: beforeOrder, after: afterOrder },
          metadata: { table: orderData.table?.name || afterOrder?.table?.name || '' },
        })

        return { id, ...orderData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update order'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteOrder(id: string) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const deletedOrder = this.orders.find((order) => order.id === id)

        await OrdersService.deleteOrder(id)

        await logActivity({
          action: 'order.delete',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'order',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Deleted order for table ${deletedOrder?.table?.name || ''}`,
          changes: { before: deletedOrder, after: null },
          metadata: { table: deletedOrder?.table?.name || '' },
        })

        this.orders = this.orders.filter((order) => order.id !== id)
        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete order'
        throw e
      } finally {
        this.loading = false
      }
    },

    async addOrderItem(orderId: string, item: Omit<OrderItem, 'id'>) {
      const newItem = await OrdersService.addOrderItem(orderId, item)

      this.orders = this.orders.map((order) => {
        if (order.id !== orderId) return order
        return {
          ...order,
          items: [...(order.items || []), newItem],
        }
      })

      return newItem
    },

    async updateOrderItem(orderId: string, itemId: string, itemData: Partial<OrderItem>) {
      await OrdersService.updateOrderItem(orderId, itemId, itemData)

      this.orders = this.orders.map((order) => {
        if (order.id !== orderId) return order

        const updatedItems = (order.items || []).map((item) =>
          item.id === itemId ? { ...item, ...itemData } : item
        )

        return {
          ...order,
          items: updatedItems,
        }
      })

      return { id: itemId, ...itemData }
    },

    async deleteOrderItem(orderId: string, itemId: string) {
      await OrdersService.deleteOrderItem(orderId, itemId)

      this.orders = this.orders.map((order) => {
        if (order.id !== orderId) return order

        return {
          ...order,
          items: (order.items || []).filter((item) => item.id !== itemId),
        }
      })

      return true
    },

    invalidateCache() {
      this.lastFetched = null
    },

    clearStore() {
      this.orders = []
      this.lastFetched = null
      this.error = null
    },
  },
})
