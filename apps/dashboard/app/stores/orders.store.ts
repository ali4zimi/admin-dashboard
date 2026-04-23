/**
 * Orders Store - Global state management for orders
 *
 * Uses OrdersService for Firebase operations.
 * Handles caching, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as OrdersService from '~/services/orders.service'
import * as MenuService from '~/services/menu.service'
import * as TablesService from '~/services/tables.service'
import { useTablesStore } from '~/stores/tables.store'
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
    async buildItemsSnapshot(items: OrderItemInput[]) {
      const itemsWithSnapshot: Omit<OrderItem, 'id'>[] = []

      for (const item of items) {
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

      return itemsWithSnapshot
    },

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
      const tablesStore = useTablesStore()

      this.loading = true
      this.error = null

      try {
        const itemsWithSnapshot = await this.buildItemsSnapshot(orderData.items)

        // Generate order number based on current timestamp
        const orderNumber = `ORD-${Date.now()}`

        // Get table IDs for status updates
        const tableIds = orderData.tableIds && orderData.tableIds.length > 0
          ? orderData.tableIds
          : (orderData.table?.id ? [orderData.table.id] : [])

        // Update table status in Firebase and globally
        if (tableIds.length > 0) {
          try {
            await TablesService.updateTablesForOrder(tableIds, orderNumber)
            // Update global state
            tablesStore.updateTableStatusesForOrder(tableIds, 'occupied', orderNumber)
          } catch (error) {
            console.error('Failed to update table status:', error)
            // Continue with order creation even if table update fails
          }
        }

        const newOrder = await OrdersService.createOrder({
          table: orderData.table,
          tableIds: orderData.tableIds,
          status: orderData.status,
          orderType: orderData.orderType,
          totalAmount: orderData.totalAmount,
          createdBy: actorUser?.uid || '',
          items: itemsWithSnapshot,
          orderNumber,
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
          message: `Created order ${orderNumber} for table ${orderData.table?.name || ''}`,
          changes: { before: null, after: { ...newOrder } },
          metadata: { table: orderData.table?.name || '', orderNumber },
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
      const tablesStore = useTablesStore()

      this.loading = true
      this.error = null

      try {
        const beforeOrder = this.orders.find((order) => order.id === id)
        const dataToUpdate: UpdateOrderData = { ...orderData }

        if (orderData.items) {
          dataToUpdate.items = await this.buildItemsSnapshot(orderData.items as OrderItemInput[]) as any
        }

        // Handle table status updates if tables changed
        if (beforeOrder && (orderData.tableIds || orderData.table)) {
          const oldTableIds = beforeOrder.tableIds && beforeOrder.tableIds.length > 0
            ? beforeOrder.tableIds
            : (beforeOrder.table?.id ? [beforeOrder.table.id] : [])

          const newTableIds = orderData.tableIds && orderData.tableIds.length > 0
            ? orderData.tableIds
            : (orderData.table?.id ? [orderData.table.id] : [])

          // If tables changed, release old ones and occupy new ones
          if (JSON.stringify(oldTableIds.sort()) !== JSON.stringify(newTableIds.sort())) {
            // Release old tables
            if (oldTableIds.length > 0) {
              const tablesToRelease = oldTableIds.filter(id => !newTableIds.includes(id))
              if (tablesToRelease.length > 0) {
                try {
                  await TablesService.releaseTablesForOrder(tablesToRelease)
                  tablesStore.updateTableStatusesForOrder(tablesToRelease, 'available')
                } catch (error) {
                  console.error('Failed to release old tables:', error)
                }
              }
            }

            // Occupy new tables
            if (newTableIds.length > 0) {
              const tablesToOccupy = newTableIds.filter(id => !oldTableIds.includes(id))
              if (tablesToOccupy.length > 0) {
                try {
                  const orderNumber = beforeOrder.orderNumber || `ORD-${Date.now()}`
                  await TablesService.updateTablesForOrder(tablesToOccupy, orderNumber)
                  tablesStore.updateTableStatusesForOrder(tablesToOccupy, 'occupied', orderNumber)
                } catch (error) {
                  console.error('Failed to occupy new tables:', error)
                }
              }
            }
          }
        }

        await OrdersService.updateOrder(id, dataToUpdate)

        this.orders = this.orders.map((order) =>
          order.id === id ? { ...order, ...dataToUpdate } : order
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
      const tablesStore = useTablesStore()

      this.loading = true
      this.error = null

      try {
        const deletedOrder = this.orders.find((order) => order.id === id)

        // Release tables when order is deleted
        if (deletedOrder) {
          const tableIds = deletedOrder.tableIds && deletedOrder.tableIds.length > 0
            ? deletedOrder.tableIds
            : (deletedOrder.table?.id ? [deletedOrder.table.id] : [])

          if (tableIds.length > 0) {
            try {
              await TablesService.releaseTablesForOrder(tableIds)
              // Update global state
              tablesStore.updateTableStatusesForOrder(tableIds, 'available')
            } catch (error) {
              console.error('Failed to release table status:', error)
              // Continue with order deletion even if table update fails
            }
          }
        }

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
