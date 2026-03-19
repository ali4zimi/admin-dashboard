import type { Timestamp } from 'firebase/firestore'

export interface MenuCategory {
  id?: string
  name: string
  description?: string
  imageUrl?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface MenuItem {
  id?: string
  name: string
  description?: string
  price: number
  sizes?: MenuItemSize[]
  categoryId: string
  imageUrl?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface MenuItemSize {
  name: string
  price: number
}

export type CreateMenuItemData = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMenuItemData = Partial<MenuItem>
export type CreateMenuCategoryData = Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateMenuCategoryData = Partial<MenuCategory>
