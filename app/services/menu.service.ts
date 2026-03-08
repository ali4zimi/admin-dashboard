/**
 * Menu Service - Raw Firebase operations for menu items and categories
 * 
 * This service contains only Firebase CRUD operations.
 * No state management, no activity logging - those belong in the store.
 */

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
} from 'firebase/firestore'
import { getFirestore } from './firebase'
import type { 
  MenuItem, 
  MenuCategory,
  CreateMenuItemData, 
  UpdateMenuItemData,
  CreateMenuCategoryData,
  UpdateMenuCategoryData,
} from '~/types/menu.types'

const ITEMS_COLLECTION = 'menuItems'
const CATEGORIES_COLLECTION = 'menuCategories'

// ==================== Menu Items ====================

/**
 * Fetch all menu items ordered by creation date
 */
export const fetchAllMenuItems = async (): Promise<MenuItem[]> => {
  const firestore = getFirestore()
  const itemsRef = collection(firestore, ITEMS_COLLECTION)
  const q = query(itemsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as MenuItem[]
}

/**
 * Fetch a single menu item by ID
 */
export const fetchMenuItemById = async (id: string): Promise<MenuItem | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ITEMS_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MenuItem
  }
  return null
}

/**
 * Create a new menu item
 */
export const createMenuItem = async (itemData: CreateMenuItemData): Promise<MenuItem> => {
  const firestore = getFirestore()
  const itemsRef = collection(firestore, ITEMS_COLLECTION)
  
  const newItemData = {
    ...itemData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  
  const docRef = await addDoc(itemsRef, newItemData)
  
  return { 
    id: docRef.id, 
    ...itemData 
  }
}

/**
 * Update an existing menu item
 */
export const updateMenuItem = async (id: string, itemData: UpdateMenuItemData): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ITEMS_COLLECTION, id)
  
  await updateDoc(docRef, { 
    ...itemData, 
    updatedAt: serverTimestamp() 
  })
}

/**
 * Delete a menu item by ID
 */
export const deleteMenuItem = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, ITEMS_COLLECTION, id)
  await deleteDoc(docRef)
}

// ==================== Menu Categories ====================

/**
 * Fetch all menu categories ordered by creation date
 */
export const fetchAllMenuCategories = async (): Promise<MenuCategory[]> => {
  const firestore = getFirestore()
  const categoriesRef = collection(firestore, CATEGORIES_COLLECTION)
  const q = query(categoriesRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as MenuCategory[]
}

/**
 * Fetch a single menu category by ID
 */
export const fetchMenuCategoryById = async (id: string): Promise<MenuCategory | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, CATEGORIES_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MenuCategory
  }
  return null
}

/**
 * Create a new menu category
 */
export const createMenuCategory = async (categoryData: CreateMenuCategoryData): Promise<MenuCategory> => {
  const firestore = getFirestore()
  const categoriesRef = collection(firestore, CATEGORIES_COLLECTION)
  
  const newCategoryData = {
    ...categoryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  
  const docRef = await addDoc(categoriesRef, newCategoryData)
  
  return { 
    id: docRef.id, 
    ...categoryData 
  }
}

/**
 * Update an existing menu category
 */
export const updateMenuCategory = async (id: string, categoryData: UpdateMenuCategoryData): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, CATEGORIES_COLLECTION, id)
  
  await updateDoc(docRef, { 
    ...categoryData, 
    updatedAt: serverTimestamp() 
  })
}

/**
 * Delete a menu category by ID
 */
export const deleteMenuCategory = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, CATEGORIES_COLLECTION, id)
  await deleteDoc(docRef)
}
