/**
 * Tables Store - Global state management for tables
 *
 * Uses TablesService for Firebase operations.
 */

import { defineStore } from 'pinia'
import * as TablesService from '~/services/tables.service'
import type { Table, TableStatus, CreateTableData, UpdateTableData } from '~/types/table.types'

export const useTablesStore = defineStore('tables', {
  state: () => ({
    tables: [] as Table[],
    loading: false,
    error: null as string | null,
    lastFetched: null as number | null,
    // Cache duration: 5 minutes
    cacheDuration: 5 * 60 * 1000,
  }),

  getters: {
    // Check if cache is still valid
    isCacheValid: (state) => {
      if (!state.lastFetched) return false
      return Date.now() - state.lastFetched < state.cacheDuration
    },

    // Get table by ID
    getTableById: (state) => (id: string) => {
      return state.tables.find(table => table.id === id)
    },

    // Get tables by status
    getTablesByStatus: (state) => (status: TableStatus) => {
      return state.tables.filter(table => table.status === status)
    },

    // Get available tables
    availableTables: (state) => {
      return state.tables.filter(table => table.status === 'available')
    },
  },

  actions: {
    async fetchTables(forceRefresh = false) {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid && this.tables.length > 0) {
        return this.tables
      }

      this.loading = true
      this.error = null

      try {
        this.tables = await TablesService.fetchAllTables()
        this.lastFetched = Date.now()
        return this.tables
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch tables'
        return []
      } finally {
        this.loading = false
      }
    },

    async getTable(id: string) {
      // First check local cache
      const cachedTable = this.getTableById(id)
      if (cachedTable) return cachedTable

      try {
        const table = await TablesService.fetchTableById(id)
        if (table && !this.tables.find(t => t.id === id)) {
          this.tables.push(table)
        }
        return table
      } catch (e: any) {
        this.error = e.message || 'Failed to get table'
        return null
      }
    },

    async createTable(tableData: CreateTableData) {
      this.loading = true
      this.error = null

      try {
        const newTable = await TablesService.createTable(tableData)

        this.tables = [newTable, ...this.tables]

        return newTable
      } catch (e: any) {
        this.error = e.message || 'Failed to create table'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateTable(id: string, tableData: UpdateTableData) {
      this.loading = true
      this.error = null

      try {
        await TablesService.updateTable(id, tableData)

        this.tables = this.tables.map(table =>
          table.id === id ? { ...table, ...tableData } : table
        )

        return { id, ...tableData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update table'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteTable(id: string) {
      this.loading = true
      this.error = null

      try {
        await TablesService.deleteTable(id)

        this.tables = this.tables.filter(table => table.id !== id)

        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete table'
        throw e
      } finally {
        this.loading = false
      }
    },

    // Invalidate cache (force next fetch to go to Firebase)
    invalidateCache() {
      this.lastFetched = null
    },

    // Clear all data (useful for logout)
    clearStore() {
      this.tables = []
      this.lastFetched = null
      this.error = null
    },

    // Update table status for order (internal, no logging)
    updateTableStatusForOrder(tableId: string, status: TableStatus, orderNumber?: string) {
      this.tables = this.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              status,
              currentOrderId: status === 'occupied' ? orderNumber : undefined,
            }
          : table
      )
    },

    // Update multiple table statuses for order (internal, no logging)
    updateTableStatusesForOrder(tableIds: string[], status: TableStatus, orderNumber?: string) {
      this.tables = this.tables.map(table => {
        if (!tableIds.includes(table.id || '')) return table
        
        const updated = { ...table, status }
        if (status === 'occupied' && orderNumber) {
          updated.currentOrderId = orderNumber
        } else if (status === 'available') {
          updated.currentOrderId = undefined
        }
        return updated
      })
    },
  },
})

// Re-export types for convenience
export type { Table, TableStatus, CreateTableData, UpdateTableData } from '~/types/table.types'
