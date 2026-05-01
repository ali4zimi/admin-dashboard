/**
 * Tables Service - Raw Firebase operations for tables.
 * All paths are scoped to clients/{clientId} via the helpers in ./firebase.
 */

import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore'
import { clientCol, clientDoc } from './firebase'
import type { Table, CreateTableData, UpdateTableData } from '@restaurant-platform/types/table.types'

const COLLECTION_NAME = 'tables'

export const fetchAllTables = async (): Promise<Table[]> => {
  const tablesRef = clientCol(COLLECTION_NAME)
  const q = query(tablesRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Table[]
}

export const fetchTableById = async (id: string): Promise<Table | null> => {
  const docRef = clientDoc(COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Table
  }
  return null
}

export const createTable = async (tableData: CreateTableData): Promise<Table> => {
  const tablesRef = clientCol(COLLECTION_NAME)

  const newTableData = {
    ...tableData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(tablesRef, newTableData)

  return {
    id: docRef.id,
    ...tableData
  }
}

export const updateTable = async (id: string, tableData: UpdateTableData): Promise<void> => {
  const docRef = clientDoc(COLLECTION_NAME, id)

  await updateDoc(docRef, {
    ...tableData,
    updatedAt: serverTimestamp()
  })
}

export const deleteTable = async (id: string): Promise<void> => {
  const docRef = clientDoc(COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

export const updateTablesForOrder = async (tableIds: string[], orderNumber: string): Promise<void> => {
  const updatePromises = tableIds.map(tableId => {
    const docRef = clientDoc(COLLECTION_NAME, tableId)
    return updateDoc(docRef, {
      status: 'occupied' as const,
      currentOrderId: orderNumber,
      updatedAt: serverTimestamp(),
    })
  })

  await Promise.all(updatePromises)
}

export const releaseTablesForOrder = async (tableIds: string[]): Promise<void> => {
  const updatePromises = tableIds.map(tableId => {
    const docRef = clientDoc(COLLECTION_NAME, tableId)
    return updateDoc(docRef, {
      status: 'available' as const,
      currentOrderId: deleteField(),
      updatedAt: serverTimestamp(),
    })
  })

  await Promise.all(updatePromises)
}
