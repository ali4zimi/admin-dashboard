/**
 * Menu Service - Read-only Firestore operations for menu items and categories.
 * All paths are scoped to clients/{clientId} via the helpers in ./firebase.
 */

import {
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'
import { clientCol } from './firebase'
import type { MenuItem, MenuCategory } from '@restaurant-platform/types'

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
