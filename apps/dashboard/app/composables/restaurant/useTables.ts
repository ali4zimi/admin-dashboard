/**
 * Tables Composable - Thin wrapper around Tables Store
 * 
 * Provides a convenient API for components to interact with table data.
 * Use this composable in components instead of directly using the store.
 */

import { storeToRefs } from 'pinia'
import { useTablesStore } from '~/stores/tables.store'
import type { Table, TableStatus, CreateTableData, UpdateTableData } from '~/types/table.types'

export type { Table, TableStatus, CreateTableData, UpdateTableData }

export const useTables = () => {
  const store = useTablesStore()
  const { tables, loading, error } = storeToRefs(store)

  return {
    // State (reactive refs)
    tables,
    loading,
    error,
    
    // Actions
    fetchTables: (forceRefresh = false) => store.fetchTables(forceRefresh),
    getTable: (id: string) => store.getTable(id),
    createTable: (data: CreateTableData) => store.createTable(data),
    updateTable: (id: string, data: UpdateTableData) => store.updateTable(id, data),
    deleteTable: (id: string) => store.deleteTable(id),
    
    // Cache management
    invalidateCache: () => store.invalidateCache(),
    clearStore: () => store.clearStore(),
    
    // Getters
    getTableById: store.getTableById,
    getTablesByStatus: store.getTablesByStatus,
    availableTables: computed(() => store.availableTables),
  }
}

