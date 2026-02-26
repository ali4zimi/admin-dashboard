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
  type Timestamp,
} from 'firebase/firestore'
import { useActivityLog } from '~/composables/useActivityLog'

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

export const useMenu = () => {
  const { firestore } = useFirebase()
  const { user } = useAuth()
  const { logActivity } = useActivityLog()
  const menuItems = useState<MenuItem[]>('menu-items', () => [])
  const menuCategories = useState<MenuCategory[]>('menu-categories', () => [])
  const loading = useState<boolean>('menu-loading', () => false)
  const error = useState<string | null>('menu-error', () => null)

  const ITEM_COLLECTION = 'menuItems'
  const CATEGORY_COLLECTION = 'menuCategories'

  // CRUD for Menu Items
  const fetchMenuItems = async () => {
    if (!firestore) return []
    loading.value = true
    error.value = null
    try {
      const itemsRef = collection(firestore, ITEM_COLLECTION)
      const q = query(itemsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      menuItems.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[]
      return menuItems.value
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch menu items'
      return []
    } finally {
      loading.value = false
    }
  }

  const getMenuItem = async (id: string) => {
    if (!firestore) return null
    try {
      const docRef = doc(firestore, ITEM_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MenuItem
      }
      return null
    } catch (e: any) {
      error.value = e.message || 'Failed to get menu item'
      return null
    }
  }

  const createMenuItem = async (itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const itemsRef = collection(firestore, ITEM_COLLECTION)
      const newItemData = {
        ...itemData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(itemsRef, newItemData)
      const newItem: MenuItem = { id: docRef.id, ...itemData }
      menuItems.value = [newItem, ...menuItems.value]
      await logActivity({
        action: 'menuItem.create',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'menuItem',
        targetId: docRef.id,
        status: 'success',
        severity: 'info',
        message: `Created menu item "${itemData.name}"`,
        changes: { before: null, after: { ...newItem } },
        metadata: { name: itemData.name },
      })
      return newItem
    } catch (e: any) {
      error.value = e.message || 'Failed to create menu item'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateMenuItem = async (id: string, itemData: Partial<MenuItem>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, ITEM_COLLECTION, id)
      await updateDoc(docRef, { ...itemData, updatedAt: serverTimestamp() })
      menuItems.value = menuItems.value.map(item => item.id === id ? { ...item, ...itemData } : item)
      const affectedItem = menuItems.value.find(item => item.id === id)
      await logActivity({
        action: 'menuItem.update',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'menuItem',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Updated menu item "${itemData.name || affectedItem?.name || ''}"`,
        changes: { before: affectedItem, after: { ...affectedItem, ...itemData } },
        metadata: { name: itemData.name || affectedItem?.name || '' },
      })
      return { id, ...itemData }
    } catch (e: any) {
      error.value = e.message || 'Failed to update menu item'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteMenuItem = async (id: string) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, ITEM_COLLECTION, id)
      await deleteDoc(docRef)
      const deletedItem = menuItems.value.find(item => item.id === id)
      await logActivity({
        action: 'menuItem.delete',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'menuItem',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Deleted menu item "${deletedItem?.name || ''}"`,
        changes: { before: deletedItem, after: null },
        metadata: { name: deletedItem?.name || '' },
      })
      menuItems.value = menuItems.value.filter(item => item.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete menu item'
      throw e
    } finally {
      loading.value = false
    }
  }

	const searchMenuItems = (term: string) => {
		if (!term) return menuItems.value
		const lowerTerm = term.toLowerCase()
		return menuItems.value.filter(item =>
			item.name.toLowerCase().includes(lowerTerm) ||
			(item.description && item.description.toLowerCase().includes(lowerTerm))
		)
	}

  // CRUD for Menu Categories
  const fetchMenuCategories = async () => {
    if (!firestore) return []
    loading.value = true
    error.value = null
    try {
      const categoriesRef = collection(firestore, CATEGORY_COLLECTION)
      const q = query(categoriesRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      menuCategories.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuCategory[]
      return menuCategories.value
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch menu categories'
      return []
    } finally {
      loading.value = false
    }
  }

  const getMenuCategory = async (id: string) => {
    if (!firestore) return null
    try {
      const docRef = doc(firestore, CATEGORY_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MenuCategory
      }
      return null
    } catch (e: any) {
      error.value = e.message || 'Failed to get menu category'
      return null
    }
  }

  const createMenuCategory = async (categoryData: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const categoriesRef = collection(firestore, CATEGORY_COLLECTION)
      const newCategoryData = {
        ...categoryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(categoriesRef, newCategoryData)
      const newCategory: MenuCategory = { id: docRef.id, ...categoryData }
      menuCategories.value = [newCategory, ...menuCategories.value]
      await logActivity({
        action: 'menuCategory.create',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'menuCategory',
        targetId: docRef.id,
        status: 'success',
        severity: 'info',
        message: `Created menu category "${categoryData.name}"`,
        changes: { before: null, after: { ...newCategory } },
        metadata: { name: categoryData.name },
      })
      return newCategory
    } catch (e: any) {
      error.value = e.message || 'Failed to create menu category'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateMenuCategory = async (id: string, categoryData: Partial<MenuCategory>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, CATEGORY_COLLECTION, id)
      await updateDoc(docRef, { ...categoryData, updatedAt: serverTimestamp() })
      menuCategories.value = menuCategories.value.map(cat => cat.id === id ? { ...cat, ...categoryData } : cat)
      const affectedCategory = menuCategories.value.find(cat => cat.id === id)
      await logActivity({
        action: 'menuCategory.update',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'menuCategory',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Updated menu category "${categoryData.name || affectedCategory?.name || ''}"`,
        changes: { before: affectedCategory, after: { ...affectedCategory, ...categoryData } },
        metadata: { name: categoryData.name || affectedCategory?.name || '' },
      })
      return { id, ...categoryData }
    } catch (e: any) {
      error.value = e.message || 'Failed to update menu category'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteMenuCategory = async (id: string) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, CATEGORY_COLLECTION, id)
      await deleteDoc(docRef)
      const deletedCategory = menuCategories.value.find(cat => cat.id === id)
      await logActivity({
        action: 'menuCategory.delete',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'menuCategory',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Deleted menu category "${deletedCategory?.name || ''}"`,
        changes: { before: deletedCategory, after: null },
        metadata: { name: deletedCategory?.name || '' },
      })
      menuCategories.value = menuCategories.value.filter(cat => cat.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete menu category'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    menuItems,
    menuCategories,
    loading,
    error,
    fetchMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
		searchMenuItems,
    fetchMenuCategories,
    getMenuCategory,
    createMenuCategory,
    updateMenuCategory,
    deleteMenuCategory,
  }
}
