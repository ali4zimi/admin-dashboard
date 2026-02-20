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
  where,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'

export interface UserData {
  id?: string
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'User'
  status: 'Active' | 'Inactive'
  joined?: Timestamp | Date
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

import { useActivityLog } from '~/composables/useActivityLog'

export const useUsers = () => {
  const { firestore } = useFirebase()
  const { logActivity } = useActivityLog()
  const users = useState<UserData[]>('users-list', () => [])
  const loading = useState<boolean>('users-loading', () => false)
  const error = useState<string | null>('users-error', () => null)

  const COLLECTION_NAME = 'users'

  const fetchUsers = async () => {
    if (!firestore) return []
    
    loading.value = true
    error.value = null

    try {
      const usersRef = collection(firestore, COLLECTION_NAME)
      const q = query(usersRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      users.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[]

      return users.value
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch users'
      console.error('Error fetching users:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  const getUser = async (id: string) => {
    if (!firestore) return null

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserData
      }
      return null
    } catch (e: any) {
      error.value = e.message || 'Failed to get user'
      console.error('Error getting user:', e)
      return null
    }
  }

  const createUser = async (userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firestore) throw new Error('Firestore not initialized')

    loading.value = true
    error.value = null

    try {
      const usersRef = collection(firestore, COLLECTION_NAME)
      const docRef = await addDoc(usersRef, {
        ...userData,
        joined: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const newUser: UserData = {
        id: docRef.id,
        ...userData,
        joined: new Date(),
      }

      users.value = [newUser, ...users.value]
      // Log activity
      await logActivity({
        action: 'create',
        entityType: 'user',
        entityId: docRef.id,
        entityName: userData.name,
      })
      return newUser
    } catch (e: any) {
      error.value = e.message || 'Failed to create user'
      console.error('Error creating user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, userData: Partial<UserData>) => {
    if (!firestore) throw new Error('Firestore not initialized')

    loading.value = true
    error.value = null

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      })

      users.value = users.value.map(user =>
        user.id === id ? { ...user, ...userData } : user
      )

      // Log activity
      await logActivity({
        action: 'update',
        entityType: 'user',
        entityId: id,
        entityName: userData.name || '',
      })
      return { id, ...userData }
    } catch (e: any) {
      error.value = e.message || 'Failed to update user'
      console.error('Error updating user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    if (!firestore) throw new Error('Firestore not initialized')

    loading.value = true
    error.value = null

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id)
      await deleteDoc(docRef)

      // Log activity
      await logActivity({
        action: 'delete',
        entityType: 'user',
        entityId: id,
      })
      users.value = users.value.filter(user => user.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete user'
      console.error('Error deleting user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const searchUsers = async (searchTerm: string, role?: string, status?: string) => {
    if (!firestore) return []

    loading.value = true
    error.value = null

    try {
      const usersRef = collection(firestore, COLLECTION_NAME)
      let q = query(usersRef, orderBy('createdAt', 'desc'))

      // Note: Firestore doesn't support full-text search
      // For production, consider using Algolia or similar
      const snapshot = await getDocs(q)
      
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[]

      // Client-side filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        results = results.filter(user =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        )
      }

      if (role && role !== 'All Roles') {
        results = results.filter(user => user.role === role)
      }

      if (status && status !== 'All Status') {
        results = results.filter(user => user.status === status)
      }

      users.value = results
      return results
    } catch (e: any) {
      error.value = e.message || 'Failed to search users'
      console.error('Error searching users:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
  }
}
