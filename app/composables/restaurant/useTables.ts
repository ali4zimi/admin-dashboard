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

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'blocked'

export interface Table {
  id?: string
  name: string
  capacity: number
  status: TableStatus
  currentOrderId?: string
  currentReservationId?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export const useTables = () => {
  const { firestore } = useFirebase()
  const { user } = useAuth()
  const { logActivity } = useActivityLog()
  const tables = useState<Table[]>('tables', () => [])
  const loading = useState<boolean>('tables-loading', () => false)
  const error = useState<string | null>('tables-error', () => null)

  const TABLE_COLLECTION = 'tables'

  // CRUD for Tables
  const fetchTables = async () => {
    if (!firestore) return []
    loading.value = true
    error.value = null
    try {
      const tablesRef = collection(firestore, TABLE_COLLECTION)
      const q = query(tablesRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      tables.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Table[]
      return tables.value
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch tables'
      return []
    } finally {
      loading.value = false
    }
  }

  const getTable = async (id: string) => {
    if (!firestore) return null
    try {
      const docRef = doc(firestore, TABLE_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Table
      }
      return null
    } catch (e: any) {
      error.value = e.message || 'Failed to get table'
      return null
    }
  }

  const createTable = async (tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const tablesRef = collection(firestore, TABLE_COLLECTION)
      const newTableData = {
        ...tableData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(tablesRef, newTableData)
      const newTable: Table = { id: docRef.id, ...tableData }
      tables.value = [newTable, ...tables.value]
      await logActivity({
        action: 'table.create',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'table',
        targetId: docRef.id,
        status: 'success',
        severity: 'info',
        message: `Created table "${tableData.name}"`,
        changes: { before: null, after: { ...newTable } },
        metadata: { name: tableData.name },
      })
      return newTable
    } catch (e: any) {
      error.value = e.message || 'Failed to create table'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateTable = async (id: string, tableData: Partial<Table>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, TABLE_COLLECTION, id)
      await updateDoc(docRef, { ...tableData, updatedAt: serverTimestamp() })
      tables.value = tables.value.map(table => table.id === id ? { ...table, ...tableData } : table)
      const affectedTable = tables.value.find(table => table.id === id)
      await logActivity({
        action: 'table.update',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'table',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Updated table "${tableData.name || affectedTable?.name || ''}"`,
        changes: { before: affectedTable, after: { ...affectedTable, ...tableData } },
        metadata: { name: tableData.name || affectedTable?.name || '' },
      })
      return { id, ...tableData }
    } catch (e: any) {
      error.value = e.message || 'Failed to update table'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTable = async (id: string) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, TABLE_COLLECTION, id)
      await deleteDoc(docRef)
      const deletedTable = tables.value.find(table => table.id === id)
      await logActivity({
        action: 'table.delete',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'table',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Deleted table "${deletedTable?.name || ''}"`,
        changes: { before: deletedTable, after: null },
        metadata: { name: deletedTable?.name || '' },
      })
      tables.value = tables.value.filter(table => table.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete table'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    tables,
    loading,
    error,
    fetchTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
  }
}
