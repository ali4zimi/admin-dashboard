import type { Timestamp } from 'firebase/firestore'

export interface MenuCategory {
  id?: string
  name: string
  description?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface MenuItem {
  id?: string
  name: string
  description?: string
  price: number
  categoryId: string
  imageUrl?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type CreateMenuItemData = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMenuItemData = Partial<MenuItem>
export type CreateMenuCategoryData = Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMenuCategoryData = Partial<MenuCategory>
