/**
 * Files Service - Raw Firebase operations for file storage and metadata
 *
 * This service contains only Firebase operations.
 * No state management, no activity logging - those belong in the store.
 */

import {
  getDownloadURL,
  getMetadata,
  ref as storageRef,
  uploadBytesResumable,
  deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { getFirestore, getStorage } from './firebase'
import type { FileMetadataRecord } from '~/types/file.types'

const FILES_COLLECTION = 'files'

export const getFileType = (contentType: string): string => {
  if (contentType.startsWith('image/')) return 'Image'
  if (contentType.startsWith('video/')) return 'Video'
  if (contentType.startsWith('audio/')) return 'Audio'
  if (contentType === 'application/pdf') return 'PDF'
  if (contentType.includes('document') || contentType.includes('word') || contentType.includes('text')) return 'Document'
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) return 'Spreadsheet'
  if (contentType.includes('presentation') || contentType.includes('powerpoint')) return 'Presentation'
  return 'Other'
}

/**
 * Fetch all file metadata documents from Firestore.
 */
export const fetchAllFileMetadata = async (): Promise<FileMetadataRecord[]> => {
  const firestore = getFirestore()
  const filesRef = collection(firestore, FILES_COLLECTION)
  const q = query(filesRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => {
    const data = docItem.data()
    return {
      id: docItem.id,
      name: data.name,
      fullPath: data.fullPath,
      type: data.type,
      size: data.size,
      contentType: data.contentType,
      downloadUrl: data.downloadUrl,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
    } as FileMetadataRecord
  })
}

/**
 * Upload a single file to Firebase Storage.
 */
export const uploadFileToStorage = async (
  file: File,
  path: string,
  onProgress?: (progressPercent: number) => void
): Promise<{
  fullPath: string
  downloadUrl: string
  size: number
  contentType: string
  type: string
  createdAt: Date
  updatedAt: Date
}> => {
  const storage = getStorage()
  const fullPath = `${path}/${Date.now()}_${file.name}`
  const fileRef = storageRef(storage, fullPath)

  const uploadTask = uploadBytesResumable(fileRef, file, {
    customMetadata: {
      originalName: file.name,
    },
  })

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progressPercent)
      },
      (error) => reject(error),
      () => resolve()
    )
  })

  const [downloadUrl, metadata] = await Promise.all([
    getDownloadURL(uploadTask.snapshot.ref),
    getMetadata(uploadTask.snapshot.ref),
  ])

  return {
    fullPath,
    downloadUrl,
    size: metadata.size,
    contentType: metadata.contentType || file.type,
    type: getFileType(metadata.contentType || file.type),
    createdAt: new Date(metadata.timeCreated),
    updatedAt: new Date(metadata.updated),
  }
}

/**
 * Persist uploaded file metadata in Firestore.
 */
export const createFileMetadata = async (data: {
  name: string
  fullPath: string
  type: string
  size: number
  contentType: string
  downloadUrl: string
}): Promise<string> => {
  const firestore = getFirestore()
  const docRef = await addDoc(collection(firestore, FILES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

/**
 * Delete a Storage file by full path.
 */
export const deleteFileFromStorage = async (fullPath: string): Promise<void> => {
  const storage = getStorage()
  const fileRef = storageRef(storage, fullPath)
  await deleteObject(fileRef)
}

/**
 * Delete Firestore metadata docs for a file by full path.
 * Returns deleted doc IDs.
 */
export const deleteFileMetadataByFullPath = async (fullPath: string): Promise<string[]> => {
  const firestore = getFirestore()
  const q = query(collection(firestore, FILES_COLLECTION), where('fullPath', '==', fullPath))
  const snapshot = await getDocs(q)

  const deletedIds: string[] = []
  for (const docItem of snapshot.docs) {
    await deleteDoc(doc(firestore, FILES_COLLECTION, docItem.id))
    deletedIds.push(docItem.id)
  }

  return deletedIds
}
