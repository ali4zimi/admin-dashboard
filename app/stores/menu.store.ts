/**
 * Menu Store - Global state management for menu items and categories
 * 
 * Uses MenuService for Firebase operations.
 * Handles caching, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as MenuService from '~/services/menu.service'
import type { 
  MenuItem, 
  MenuCategory,
  CreateMenuItemData, 
  UpdateMenuItemData,
  CreateMenuCategoryData,
  UpdateMenuCategoryData,
} from '~/types/menu.types'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuItems: [] as MenuItem[],
    menuCategories: [] as MenuCategory[],
    loading: false,
    error: null as string | null,
    lastItemsFetched: null as number | null,
    lastCategoriesFetched: null as number | null,
    // Cache duration: 5 minutes
    cacheDuration: 5 * 60 * 1000,
  }),

  getters: {
    // Check if items cache is valid
    isItemsCacheValid: (state) => {
      if (!state.lastItemsFetched) return false
      return Date.now() - state.lastItemsFetched < state.cacheDuration
    },

    // Check if categories cache is valid
    isCategoriesCacheValid: (state) => {
      if (!state.lastCategoriesFetched) return false
      return Date.now() - state.lastCategoriesFetched < state.cacheDuration
    },

    // Get menu item by ID
    getMenuItemById: (state) => (id: string) => {
      return state.menuItems.find(item => item.id === id)
    },

    // Get category by ID
    getCategoryById: (state) => (id: string) => {
      return state.menuCategories.find(cat => cat.id === id)
    },

    // Get items by category
    getItemsByCategory: (state) => (categoryId: string) => {
      return state.menuItems.filter(item => item.categoryId === categoryId)
    },

    // Get category name by ID
    getCategoryName: (state) => (categoryId: string) => {
      const cat = state.menuCategories.find(c => c.id === categoryId)
      return cat ? cat.name : 'Uncategorized'
    },

    // Search items
    searchItems: (state) => (term: string) => {
      if (!term) return state.menuItems
      const lowerTerm = term.toLowerCase()
      return state.menuItems.filter(item =>
        item.name.toLowerCase().includes(lowerTerm) ||
        (item.description && item.description.toLowerCase().includes(lowerTerm))
      )
    },
  },

  actions: {
    // ==================== Menu Items ====================
    
    async fetchMenuItems(forceRefresh = false) {
      if (!forceRefresh && this.isItemsCacheValid && this.menuItems.length > 0) {
        return this.menuItems
      }

      this.loading = true
      this.error = null

      try {
        this.menuItems = await MenuService.fetchAllMenuItems()
        this.lastItemsFetched = Date.now()
        return this.menuItems
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch menu items'
        return []
      } finally {
        this.loading = false
      }
    },

    async getMenuItem(id: string) {
      const cachedItem = this.getMenuItemById(id)
      if (cachedItem) return cachedItem

      try {
        const item = await MenuService.fetchMenuItemById(id)
        if (item && !this.menuItems.find(i => i.id === id)) {
          this.menuItems.push(item)
        }
        return item
      } catch (e: any) {
        this.error = e.message || 'Failed to get menu item'
        return null
      }
    },

    async createMenuItem(itemData: CreateMenuItemData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const userData = user.value as any

      this.loading = true
      this.error = null

      try {
        const newItem = await MenuService.createMenuItem(itemData)
        
        this.menuItems = [newItem, ...this.menuItems]

        await logActivity({
          action: 'menuItem.create',
          actorId: userData?.uid || '',
          actorType: userData?.role || 'user',
          targetType: 'menuItem',
          targetId: newItem.id!,
          status: 'success',
          severity: 'info',
          message: `Created menu item "${itemData.name}"`,
          changes: { before: null, after: { ...newItem } },
          metadata: { name: itemData.name },
        })

        return newItem
      } catch (e: any) {
        this.error = e.message || 'Failed to create menu item'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateMenuItem(id: string, itemData: UpdateMenuItemData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const userData = user.value as any

      this.loading = true
      this.error = null

      try {
        const beforeItem = this.menuItems.find(item => item.id === id)
        
        await MenuService.updateMenuItem(id, itemData)
        
        this.menuItems = this.menuItems.map(item => 
          item.id === id ? { ...item, ...itemData } : item
        )
        const afterItem = this.menuItems.find(item => item.id === id)

        await logActivity({
          action: 'menuItem.update',
          actorId: userData?.uid || '',
          actorType: userData?.role || 'user',
          targetType: 'menuItem',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Updated menu item "${itemData.name || afterItem?.name || ''}"`,
          changes: { before: beforeItem, after: afterItem },
          metadata: { name: itemData.name || afterItem?.name || '' },
        })

        return { id, ...itemData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update menu item'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteMenuItem(id: string) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const userData = user.value as any

      this.loading = true
      this.error = null

      try {
        const deletedItem = this.menuItems.find(item => item.id === id)
        
        await MenuService.deleteMenuItem(id)

        await logActivity({
          action: 'menuItem.delete',
          actorId: userData?.uid || '',
          actorType: userData?.role || 'user',
          targetType: 'menuItem',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Deleted menu item "${deletedItem?.name || ''}"`,
          changes: { before: deletedItem, after: null },
          metadata: { name: deletedItem?.name || '' },
        })

        this.menuItems = this.menuItems.filter(item => item.id !== id)
        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete menu item'
        throw e
      } finally {
        this.loading = false
      }
    },

    // ==================== Menu Categories ====================

    async fetchMenuCategories(forceRefresh = false) {
      if (!forceRefresh && this.isCategoriesCacheValid && this.menuCategories.length > 0) {
        return this.menuCategories
      }

      this.loading = true
      this.error = null

      try {
        this.menuCategories = await MenuService.fetchAllMenuCategories()
        this.lastCategoriesFetched = Date.now()
        return this.menuCategories
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch menu categories'
        return []
      } finally {
        this.loading = false
      }
    },

    async getMenuCategory(id: string) {
      const cachedCategory = this.getCategoryById(id)
      if (cachedCategory) return cachedCategory

      try {
        const category = await MenuService.fetchMenuCategoryById(id)
        if (category && !this.menuCategories.find(c => c.id === id)) {
          this.menuCategories.push(category)
        }
        return category
      } catch (e: any) {
        this.error = e.message || 'Failed to get menu category'
        return null
      }
    },

    async createMenuCategory(categoryData: CreateMenuCategoryData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const userData = user.value as any

      this.loading = true
      this.error = null

      try {
        const newCategory = await MenuService.createMenuCategory(categoryData)
        
        this.menuCategories = [newCategory, ...this.menuCategories]

        await logActivity({
          action: 'menuCategory.create',
          actorId: userData?.uid || '',
          actorType: userData?.role || 'user',
          targetType: 'menuCategory',
          targetId: newCategory.id!,
          status: 'success',
          severity: 'info',
          message: `Created menu category "${categoryData.name}"`,
          changes: { before: null, after: { ...newCategory } },
          metadata: { name: categoryData.name },
        })

        return newCategory
      } catch (e: any) {
        this.error = e.message || 'Failed to create menu category'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateMenuCategory(id: string, categoryData: UpdateMenuCategoryData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const userData = user.value as any

      this.loading = true
      this.error = null

      try {
        const beforeCategory = this.menuCategories.find(cat => cat.id === id)
        
        await MenuService.updateMenuCategory(id, categoryData)
        
        this.menuCategories = this.menuCategories.map(cat => 
          cat.id === id ? { ...cat, ...categoryData } : cat
        )
        const afterCategory = this.menuCategories.find(cat => cat.id === id)

        await logActivity({
          action: 'menuCategory.update',
          actorId: userData?.uid || '',
          actorType: userData?.role || 'user',
          targetType: 'menuCategory',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Updated menu category "${categoryData.name || afterCategory?.name || ''}"`,
          changes: { before: beforeCategory, after: afterCategory },
          metadata: { name: categoryData.name || afterCategory?.name || '' },
        })

        return { id, ...categoryData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update menu category'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteMenuCategory(id: string) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const userData = user.value as any

      this.loading = true
      this.error = null

      try {
        const deletedCategory = this.menuCategories.find(cat => cat.id === id)
        
        await MenuService.deleteMenuCategory(id)

        await logActivity({
          action: 'menuCategory.delete',
          actorId: userData?.uid || '',
          actorType: userData?.role || 'user',
          targetType: 'menuCategory',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Deleted menu category "${deletedCategory?.name || ''}"`,
          changes: { before: deletedCategory, after: null },
          metadata: { name: deletedCategory?.name || '' },
        })

        this.menuCategories = this.menuCategories.filter(cat => cat.id !== id)
        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete menu category'
        throw e
      } finally {
        this.loading = false
      }
    },

    // ==================== Reorder Categories ====================

    async reorderMenuCategories(orderedIds: string[]) {
      const previousCategories = [...this.menuCategories]

      // Optimistic update
      const orders = orderedIds.map((id, index) => ({ id, order: index }))
      this.menuCategories = this.menuCategories.map(cat => ({
        ...cat,
        order: orders.find(o => o.id === cat.id)?.order ?? cat.order ?? 0,
      }))

      try {
        await MenuService.updateMenuCategoryOrders(orders)
      } catch (e: any) {
        // Rollback on failure
        this.menuCategories = previousCategories
        this.error = e.message || 'Failed to reorder categories'
        throw e
      }
    },

    async reorderMenuItems(categoryId: string, orderedIds: string[]) {
      const previousItems = [...this.menuItems]

      // Optimistic update
      const orders = orderedIds.map((id, index) => ({ id, order: index }))
      this.menuItems = this.menuItems.map(item => ({
        ...item,
        order: item.categoryId === categoryId
          ? (orders.find(o => o.id === item.id)?.order ?? item.order ?? 0)
          : item.order,
      }))

      try {
        await MenuService.updateMenuItemOrders(categoryId, orders)
      } catch (e: any) {
        // Rollback on failure
        this.menuItems = previousItems
        this.error = e.message || 'Failed to reorder menu items'
        throw e
      }
    },

    // Cache management
    invalidateItemsCache() {
      this.lastItemsFetched = null
    },

    invalidateCategoriesCache() {
      this.lastCategoriesFetched = null
    },

    invalidateAllCache() {
      this.lastItemsFetched = null
      this.lastCategoriesFetched = null
    },

    clearStore() {
      this.menuItems = []
      this.menuCategories = []
      this.lastItemsFetched = null
      this.lastCategoriesFetched = null
      this.error = null
    },
  },
})

// Re-export types for convenience
export type { 
  MenuItem, 
  MenuCategory,
  CreateMenuItemData, 
  UpdateMenuItemData,
  CreateMenuCategoryData,
  UpdateMenuCategoryData,
} from '~/types/menu.types'
