/**
 * Tables Service - Raw Firebase operations for tables
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
  deleteField,
} from 'firebase/firestore'
import { getFirestore } from './firebase'
import type { Table, CreateTableData, UpdateTableData } from '~/types/table.types'

const COLLECTION_NAME = 'tables'

/**
 * Fetch all tables ordered by creation date
 */
export const fetchAllTables = async (): Promise<Table[]> => {
  const firestore = getFirestore()
  const tablesRef = collection(firestore, COLLECTION_NAME)
  const q = query(tablesRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Table[]
}

/**
 * Fetch a single table by ID
 */
export const fetchTableById = async (id: string): Promise<Table | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Table
  }
  return null
}

/**
 * Create a new table
 * Returns the created table with its ID
 */
export const createTable = async (tableData: CreateTableData): Promise<Table> => {
  const firestore = getFirestore()
  const tablesRef = collection(firestore, COLLECTION_NAME)
  
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

/**
 * Update an existing table
 */
export const updateTable = async (id: string, tableData: UpdateTableData): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  
  await updateDoc(docRef, { 
    ...tableData, 
    updatedAt: serverTimestamp() 
  })
}

/**
 * Delete a table by ID
 */
export const deleteTable = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

/**
 * Update multiple tables with occupied status and current order ID
 */
export const updateTablesForOrder = async (tableIds: string[], orderNumber: string): Promise<void> => {
  const firestore = getFirestore()
  
  const updatePromises = tableIds.map(tableId => {
    const docRef = doc(firestore, COLLECTION_NAME, tableId)
    return updateDoc(docRef, {
      status: 'occupied' as const,
      currentOrderId: orderNumber,
      updatedAt: serverTimestamp(),
    })
  })
  
  await Promise.all(updatePromises)
}

/**
 * Release tables by setting status back to available
 */
export const releaseTablesForOrder = async (tableIds: string[]): Promise<void> => {
  const firestore = getFirestore()
  
  const updatePromises = tableIds.map(tableId => {
    const docRef = doc(firestore, COLLECTION_NAME, tableId)
    return updateDoc(docRef, {
      status: 'available' as const,
      currentOrderId: deleteField(),
      updatedAt: serverTimestamp(),
    })
  })
  
  await Promise.all(updatePromises)
}
