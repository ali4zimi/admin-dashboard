/**
 * Menu Service - Raw Firebase operations for menu items and categories.
 * All paths are scoped to clients/{clientId} via the helpers in ./firebase.
 */

import {
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { clientCol, clientDoc, getFirestore } from './firebase'
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
  const [menuSnapshot, legacyMenuSnapshot] = await Promise.all([
    getDocs(clientCol(MENU_COLLECTION)),
    getDocs(clientCol(LEGACY_CATEGORIES_COLLECTION)),
  ])

  const categoryRefs = [
    ...menuSnapshot.docs.map((categoryDoc) => ({
      collectionName: MENU_COLLECTION,
      categoryId: categoryDoc.id,
    })),
    ...legacyMenuSnapshot.docs.map((categoryDoc) => ({
      collectionName: LEGACY_CATEGORIES_COLLECTION,
      categoryId: categoryDoc.id,
    })),
  ]

  for (const categoryRef of categoryRefs) {
    const nestedRef = clientDoc(
      categoryRef.collectionName,
      categoryRef.categoryId,
      ITEMS_SUBCOLLECTION,
      id
    )
    const nestedSnap = await getDoc(nestedRef)

    if (nestedSnap.exists()) {
      return nestedSnap
    }
  }

  return null
}

// ==================== Menu Items ====================

export const fetchAllMenuItems = async (): Promise<MenuItem[]> => {
  // New structure: menu/{categoryId}/items/{itemId}
  // Compatibility structure: menuCategories/{categoryId}/items/{itemId}
  const [menuSnapshot, legacyMenuSnapshot] = await Promise.all([
    getDocs(clientCol(MENU_COLLECTION)),
    getDocs(clientCol(LEGACY_CATEGORIES_COLLECTION)),
  ])

  const readNestedItems = async (collectionName: string, categoryId: string) => {
    const itemsRef = clientCol(collectionName, categoryId, ITEMS_SUBCOLLECTION)
    const itemsSnapshot = await getDocs(query(itemsRef, orderBy('createdAt', 'desc')))
    return itemsSnapshot.docs.map((docItem) => mapNestedItemDoc(docItem))
  }

  const nestedItemGroups = await Promise.all([
    ...menuSnapshot.docs.map((categoryDoc) => readNestedItems(MENU_COLLECTION, categoryDoc.id)),
    ...legacyMenuSnapshot.docs.map((categoryDoc) => readNestedItems(LEGACY_CATEGORIES_COLLECTION, categoryDoc.id)),
  ])

  const nestedItems = nestedItemGroups.flat()

  // Backward compatibility: also read legacy top-level collection during transition.
  const legacyRef = clientCol(ITEMS_COLLECTION)
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

export const fetchMenuItemById = async (id: string): Promise<MenuItem | null> => {
  const nestedDoc = await findNestedItemById(id)
  if (nestedDoc) {
    return mapNestedItemDoc(nestedDoc)
  }

  // Fallback for legacy top-level items.
  const docRef = clientDoc(ITEMS_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MenuItem
  }
  return null
}

export const createMenuItem = async (itemData: CreateMenuItemData): Promise<MenuItem> => {
  if (!itemData.categoryId) {
    throw new Error('Menu item category is required')
  }

  const itemsRef = clientCol(MENU_COLLECTION, itemData.categoryId, ITEMS_SUBCOLLECTION)

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

export const updateMenuItem = async (id: string, itemData: UpdateMenuItemData): Promise<void> => {
  const nestedDoc = await findNestedItemById(id)
  if (nestedDoc) {
    const currentCategoryId = nestedDoc.ref.parent.parent?.id
    const targetCategoryId = itemData.categoryId || currentCategoryId

    if (targetCategoryId && currentCategoryId && targetCategoryId !== currentCategoryId) {
      const movedRef = clientDoc(
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
  const legacyRef = clientDoc(ITEMS_COLLECTION, id)
  const legacySnap = await getDoc(legacyRef)

  if (legacySnap.exists() && itemData.categoryId) {
    const migratedRef = clientDoc(
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

export const deleteMenuItem = async (id: string): Promise<void> => {
  const nestedDoc = await findNestedItemById(id)
  if (nestedDoc) {
    await deleteDoc(nestedDoc.ref)
    return
  }

  // Legacy fallback
  const docRef = clientDoc(ITEMS_COLLECTION, id)
  await deleteDoc(docRef)
}

// ==================== Menu Categories ====================

export const fetchAllMenuCategories = async (): Promise<MenuCategory[]> => {
  const [menuSnapshot, legacySnapshot] = await Promise.all([
    getDocs(query(clientCol(MENU_COLLECTION), orderBy('createdAt', 'desc'))),
    getDocs(query(clientCol(LEGACY_CATEGORIES_COLLECTION), orderBy('createdAt', 'desc'))),
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

export const fetchMenuCategoryById = async (id: string): Promise<MenuCategory | null> => {
  const docRef = clientDoc(MENU_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MenuCategory
  }

  const legacyRef = clientDoc(LEGACY_CATEGORIES_COLLECTION, id)
  const legacySnap = await getDoc(legacyRef)

  if (legacySnap.exists()) {
    return { id: legacySnap.id, ...legacySnap.data() } as MenuCategory
  }

  return null
}

export const createMenuCategory = async (categoryData: CreateMenuCategoryData): Promise<MenuCategory> => {
  const categoriesRef = clientCol(MENU_COLLECTION)

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

export const updateMenuCategory = async (id: string, categoryData: UpdateMenuCategoryData): Promise<void> => {
  const docRef = clientDoc(MENU_COLLECTION, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    })
    return
  }

  const legacyRef = clientDoc(LEGACY_CATEGORIES_COLLECTION, id)
  await updateDoc(legacyRef, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  })
}

export const deleteMenuCategory = async (id: string): Promise<void> => {
  // Delete nested child items first.
  const [itemsSnapshot, legacyItemsSnapshot] = await Promise.all([
    getDocs(clientCol(MENU_COLLECTION, id, ITEMS_SUBCOLLECTION)),
    getDocs(clientCol(LEGACY_CATEGORIES_COLLECTION, id, ITEMS_SUBCOLLECTION)),
  ])

  await Promise.all([
    ...itemsSnapshot.docs.map((docItem) => deleteDoc(docItem.ref)),
    ...legacyItemsSnapshot.docs.map((docItem) => deleteDoc(docItem.ref)),
  ])

  await Promise.all([
    deleteDoc(clientDoc(MENU_COLLECTION, id)),
    deleteDoc(clientDoc(LEGACY_CATEGORIES_COLLECTION, id)),
  ])
}

export const updateMenuCategoryOrders = async (
  orders: Array<{ id: string; order: number }>
): Promise<void> => {
  const batch = writeBatch(getFirestore())

  for (const { id, order } of orders) {
    const docRef = clientDoc(MENU_COLLECTION, id)
    batch.update(docRef, { order, updatedAt: serverTimestamp() })
  }

  await batch.commit()
}

export const updateMenuItemOrders = async (
  categoryId: string,
  orders: Array<{ id: string; order: number }>
): Promise<void> => {
  const batch = writeBatch(getFirestore())

  for (const { id, order } of orders) {
    const docRef = clientDoc(MENU_COLLECTION, categoryId, ITEMS_SUBCOLLECTION, id)
    batch.update(docRef, { order, updatedAt: serverTimestamp() })
  }

  await batch.commit()
}
