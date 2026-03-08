/**
 * Menu Composable - Thin wrapper around Menu Store
 * 
 * Provides a convenient API for components to interact with menu data.
 * Use this composable in components instead of directly using the store.
 */

import { storeToRefs } from 'pinia'
import { useMenuStore } from '~/stores/menu.store'
import type { 
  MenuItem, 
  MenuCategory,
  CreateMenuItemData, 
  UpdateMenuItemData,
  CreateMenuCategoryData,
  UpdateMenuCategoryData,
} from '~/types/menu.types'

export type { 
  MenuItem, 
  MenuCategory,
  CreateMenuItemData, 
  UpdateMenuItemData,
  CreateMenuCategoryData,
  UpdateMenuCategoryData,
}

export const useMenu = () => {
  const store = useMenuStore()
  const { menuItems, menuCategories, loading, error } = storeToRefs(store)

  return {
    // State (reactive refs)
    menuItems,
    menuCategories,
    loading,
    error,
    
    // Menu Items Actions
    fetchMenuItems: (forceRefresh = false) => store.fetchMenuItems(forceRefresh),
    getMenuItem: (id: string) => store.getMenuItem(id),
    createMenuItem: (data: CreateMenuItemData) => store.createMenuItem(data),
    updateMenuItem: (id: string, data: UpdateMenuItemData) => store.updateMenuItem(id, data),
    deleteMenuItem: (id: string) => store.deleteMenuItem(id),
    searchMenuItems: store.searchItems,
    
    // Menu Categories Actions
    fetchMenuCategories: (forceRefresh = false) => store.fetchMenuCategories(forceRefresh),
    getMenuCategory: (id: string) => store.getMenuCategory(id),
    createMenuCategory: (data: CreateMenuCategoryData) => store.createMenuCategory(data),
    updateMenuCategory: (id: string, data: UpdateMenuCategoryData) => store.updateMenuCategory(id, data),
    deleteMenuCategory: (id: string) => store.deleteMenuCategory(id),
    
    // Cache management
    invalidateItemsCache: () => store.invalidateItemsCache(),
    invalidateCategoriesCache: () => store.invalidateCategoriesCache(),
    invalidateAllCache: () => store.invalidateAllCache(),
    clearStore: () => store.clearStore(),
    
    // Getters
    getMenuItemById: store.getMenuItemById,
    getCategoryById: store.getCategoryById,
    getItemsByCategory: store.getItemsByCategory,
    getCategoryName: store.getCategoryName,
  }
}
