/**
 * Menu Service - Raw Firebase operations for menu items and categories
 * 
 * This service contains only Firebase CRUD operations.
 * No state management, no activity logging - those belong in the store.
 */

import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  documentId,
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
const MENU_COLLECTION = 'menu'
const LEGACY_CATEGORIES_COLLECTION = 'menuCategories'
const ITEMS_SUBCOLLECTION = 'items'

const timestampToMillis = (value: unknown): number => {
  if (!value) {
    return 0
  }

  if (typeof (value as any).toDate === 'function') {
    return (value as any).toDate().getTime()
  }

  const date = new Date(value as any)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const mapNestedItemDoc = (docItem: any): MenuItem => {
  const categoryId = docItem.ref.parent.parent?.id || ''
  const data = docItem.data()

  return {
    id: docItem.id,
    ...data,
    categoryId: data.categoryId || categoryId,
  } as MenuItem
}

const findNestedItemById = async (id: string) => {
  const firestore = getFirestore()
  const itemsGroup = collectionGroup(firestore, ITEMS_SUBCOLLECTION)
  const itemQuery = query(itemsGroup, where(documentId(), '==', id), limit(1))
  const snapshot = await getDocs(itemQuery)

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0]!
}

// ==================== Menu Items ====================

/**
 * Fetch all menu items ordered by creation date
 */
export const fetchAllMenuItems = async (): Promise<MenuItem[]> => {
  const firestore = getFirestore()

  // New structure: menu/{categoryId}/items/{itemId}
  // Compatibility structure: menuCategories/{categoryId}/items/{itemId}
  const [menuSnapshot, legacyMenuSnapshot] = await Promise.all([
    getDocs(collection(firestore, MENU_COLLECTION)),
    getDocs(collection(firestore, LEGACY_CATEGORIES_COLLECTION)),
  ])

  const readNestedItems = async (collectionName: string, categoryId: string) => {
    const itemsRef = collection(firestore, collectionName, categoryId, ITEMS_SUBCOLLECTION)
    const itemsSnapshot = await getDocs(query(itemsRef, orderBy('createdAt', 'desc')))
    return itemsSnapshot.docs.map((docItem) => mapNestedItemDoc(docItem))
  }

  const nestedItemGroups = await Promise.all([
    ...menuSnapshot.docs.map((categoryDoc) => readNestedItems(MENU_COLLECTION, categoryDoc.id)),
    ...legacyMenuSnapshot.docs.map((categoryDoc) => readNestedItems(LEGACY_CATEGORIES_COLLECTION, categoryDoc.id)),
  ])

  const nestedItems = nestedItemGroups.flat()

  // Backward compatibility: also read legacy top-level collection during transition.
  const legacyRef = collection(firestore, ITEMS_COLLECTION)
  const legacySnapshot = await getDocs(query(legacyRef, orderBy('createdAt', 'desc')))
  const legacyItems = legacySnapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as MenuItem[]

  const deduped = new Map<string, MenuItem>()
  legacyItems.forEach((item) => {
    if (item.id) {
      deduped.set(item.id, item)
    }
  })
  nestedItems.forEach((item) => {
    if (item.id) {
      deduped.set(item.id, item)
    }
  })

  return Array.from(deduped.values()).sort(
    (a, b) => timestampToMillis((b as any).createdAt) - timestampToMillis((a as any).createdAt)
  )
}

/**
 * Fetch a single menu item by ID
 */
export const fetchMenuItemById = async (id: string): Promise<MenuItem | null> => {
  const firestore = getFirestore()

  const nestedDoc = await findNestedItemById(id)
  if (nestedDoc) {
    return mapNestedItemDoc(nestedDoc)
  }

  // Fallback for legacy top-level items.
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

  if (!itemData.categoryId) {
    throw new Error('Menu item category is required')
  }

  const itemsRef = collection(
    firestore,
    MENU_COLLECTION,
    itemData.categoryId,
    ITEMS_SUBCOLLECTION
  )
  
  const newItemData = {
    ...itemData,
    categoryId: itemData.categoryId,
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

  const nestedDoc = await findNestedItemById(id)
  if (nestedDoc) {
    const currentCategoryId = nestedDoc.ref.parent.parent?.id
    const targetCategoryId = itemData.categoryId || currentCategoryId

    if (targetCategoryId && currentCategoryId && targetCategoryId !== currentCategoryId) {
      const movedRef = doc(
        firestore,
        MENU_COLLECTION,
        targetCategoryId,
        ITEMS_SUBCOLLECTION,
        id
      )

      await setDoc(
        movedRef,
        {
          ...nestedDoc.data(),
          ...itemData,
          categoryId: targetCategoryId,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      await deleteDoc(nestedDoc.ref)
      return
    }

    await updateDoc(nestedDoc.ref, {
      ...itemData,
      ...(targetCategoryId ? { categoryId: targetCategoryId } : {}),
      updatedAt: serverTimestamp(),
    })
    return
  }

  // Legacy fallback: update top-level doc, or migrate to nested if category changed.
  const legacyRef = doc(firestore, ITEMS_COLLECTION, id)
  const legacySnap = await getDoc(legacyRef)

  if (legacySnap.exists() && itemData.categoryId) {
    const migratedRef = doc(
      firestore,
      MENU_COLLECTION,
      itemData.categoryId,
      ITEMS_SUBCOLLECTION,
      id
    )

    await setDoc(
      migratedRef,
      {
        ...legacySnap.data(),
        ...itemData,
        categoryId: itemData.categoryId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    await deleteDoc(legacyRef)
    return
  }

  await updateDoc(legacyRef, {
    ...itemData,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a menu item by ID
 */
export const deleteMenuItem = async (id: string): Promise<void> => {
  const firestore = getFirestore()

  const nestedDoc = await findNestedItemById(id)
  if (nestedDoc) {
    await deleteDoc(nestedDoc.ref)
    return
  }

  // Legacy fallback
  const docRef = doc(firestore, ITEMS_COLLECTION, id)
  await deleteDoc(docRef)
}

// ==================== Menu Categories ====================

/**
 * Fetch all menu categories ordered by creation date
 */
export const fetchAllMenuCategories = async (): Promise<MenuCategory[]> => {
  const firestore = getFirestore()
  const [menuSnapshot, legacySnapshot] = await Promise.all([
    getDocs(query(collection(firestore, MENU_COLLECTION), orderBy('createdAt', 'desc'))),
    getDocs(query(collection(firestore, LEGACY_CATEGORIES_COLLECTION), orderBy('createdAt', 'desc'))),
  ])

  const deduped = new Map<string, MenuCategory>()

  legacySnapshot.docs.forEach((docItem) => {
    deduped.set(docItem.id, {
      id: docItem.id,
      ...docItem.data(),
    } as MenuCategory)
  })

  menuSnapshot.docs.forEach((docItem) => {
    deduped.set(docItem.id, {
      id: docItem.id,
      ...docItem.data(),
    } as MenuCategory)
  })

  return Array.from(deduped.values()).sort(
    (a, b) => timestampToMillis((b as any).createdAt) - timestampToMillis((a as any).createdAt)
  )
}

/**
 * Fetch a single menu category by ID
 */
export const fetchMenuCategoryById = async (id: string): Promise<MenuCategory | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, MENU_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MenuCategory
  }

  const legacyRef = doc(firestore, LEGACY_CATEGORIES_COLLECTION, id)
  const legacySnap = await getDoc(legacyRef)

  if (legacySnap.exists()) {
    return { id: legacySnap.id, ...legacySnap.data() } as MenuCategory
  }

  return null
}

/**
 * Create a new menu category
 */
export const createMenuCategory = async (categoryData: CreateMenuCategoryData): Promise<MenuCategory> => {
  const firestore = getFirestore()
  const categoriesRef = collection(firestore, MENU_COLLECTION)
  
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
  const docRef = doc(firestore, MENU_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    })
    return
  }

  const legacyRef = doc(firestore, LEGACY_CATEGORIES_COLLECTION, id)
  await updateDoc(legacyRef, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a menu category by ID
 */
export const deleteMenuCategory = async (id: string): Promise<void> => {
  const firestore = getFirestore()

  // Delete nested child items first.
  const [itemsSnapshot, legacyItemsSnapshot] = await Promise.all([
    getDocs(collection(firestore, MENU_COLLECTION, id, ITEMS_SUBCOLLECTION)),
    getDocs(collection(firestore, LEGACY_CATEGORIES_COLLECTION, id, ITEMS_SUBCOLLECTION)),
  ])

  await Promise.all([
    ...itemsSnapshot.docs.map((docItem) => deleteDoc(docItem.ref)),
    ...legacyItemsSnapshot.docs.map((docItem) => deleteDoc(docItem.ref)),
  ])

  await Promise.all([
    deleteDoc(doc(firestore, MENU_COLLECTION, id)),
    deleteDoc(doc(firestore, LEGACY_CATEGORIES_COLLECTION, id)),
  ])
}
