/**
 * Files Service - Raw Firebase operations for file storage and metadata.
 * Firestore docs live under clients/{clientId}/files.
 * Storage objects live under clients/{clientId}/<caller-supplied path>.
 */

import {
  getDownloadURL,
  getMetadata,
  ref as storageRef,
  uploadBytesResumable,
  uploadBytes,
  deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage'
import {
  addDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { clientCol, clientDoc, clientStoragePath, getStorage } from './firebase'
import type { FileMetadataRecord } from '@restaurant-platform/types/file.types'

const FILES_COLLECTION = 'files'
const MAX_THUMBNAIL_DIMENSION = 360
const THUMBNAIL_QUALITY = 0.8

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

const isImageFile = (contentType: string): boolean => contentType.startsWith('image/')

const loadImageElement = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for thumbnail generation'))
    }
    img.src = objectUrl
  })
}

const buildThumbnailBlob = async (file: File): Promise<Blob | null> => {
  if (typeof document === 'undefined') {
    return null
  }

  const img = await loadImageElement(file)
  const sourceWidth = img.naturalWidth || img.width
  const sourceHeight = img.naturalHeight || img.height

  if (!sourceWidth || !sourceHeight) {
    return null
  }

  const scale = Math.min(MAX_THUMBNAIL_DIMENSION / sourceWidth, MAX_THUMBNAIL_DIMENSION / sourceHeight, 1)
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale))
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d')
  if (!context) {
    return null
  }

  context.drawImage(img, 0, 0, targetWidth, targetHeight)

  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', THUMBNAIL_QUALITY)
  })
}

export const fetchAllFileMetadata = async (): Promise<FileMetadataRecord[]> => {
  const filesRef = clientCol(FILES_COLLECTION)
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
      thumbnailFullPath: data.thumbnailFullPath,
      thumbnailDownloadUrl: data.thumbnailDownloadUrl,
      thumbnailSize: data.thumbnailSize,
      thumbnailContentType: data.thumbnailContentType,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
    } as FileMetadataRecord
  })
}

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
  thumbnailFullPath?: string
  thumbnailDownloadUrl?: string
  thumbnailSize?: number
  thumbnailContentType?: string
  createdAt: Date
  updatedAt: Date
}> => {
  const storage = getStorage()
  const scopedPath = clientStoragePath(path)
  const fullPath = `${scopedPath}/${Date.now()}_${file.name}`
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

  let thumbnailData: {
    thumbnailFullPath?: string
    thumbnailDownloadUrl?: string
    thumbnailSize?: number
    thumbnailContentType?: string
  } = {}

  const resolvedContentType = metadata.contentType || file.type
  if (isImageFile(resolvedContentType)) {
    const thumbnailBlob = await buildThumbnailBlob(file)

    if (thumbnailBlob) {
      const thumbnailFullPath = `${scopedPath}/thumbnails/${Date.now()}_thumb_${file.name.replace(/\.[^/.]+$/, '')}.jpg`
      const thumbnailRef = storageRef(storage, thumbnailFullPath)

      const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailBlob, {
        contentType: 'image/jpeg',
        customMetadata: {
          originalName: file.name,
          variant: 'thumbnail',
        },
      })

      const [thumbnailDownloadUrl, thumbnailMetadata] = await Promise.all([
        getDownloadURL(thumbnailRef),
        getMetadata(thumbnailSnapshot.ref),
      ])

      thumbnailData = {
        thumbnailFullPath,
        thumbnailDownloadUrl,
        thumbnailSize: thumbnailMetadata.size,
        thumbnailContentType: thumbnailMetadata.contentType || 'image/jpeg',
      }
    }
  }

  return {
    fullPath,
    downloadUrl,
    size: metadata.size,
    contentType: resolvedContentType,
    type: getFileType(resolvedContentType),
    ...thumbnailData,
    createdAt: new Date(metadata.timeCreated),
    updatedAt: new Date(metadata.updated),
  }
}

export const createFileMetadata = async (data: {
  name: string
  fullPath: string
  type: string
  size: number
  contentType: string
  downloadUrl: string
  thumbnailFullPath?: string
  thumbnailDownloadUrl?: string
  thumbnailSize?: number
  thumbnailContentType?: string
}): Promise<string> => {
  const docRef = await addDoc(clientCol(FILES_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export const deleteFileFromStorage = async (fullPath: string): Promise<void> => {
  const storage = getStorage()
  const fileRef = storageRef(storage, fullPath)
  await deleteObject(fileRef)
}

export const deleteThumbnailFromStorage = async (fullPath?: string): Promise<void> => {
  if (!fullPath) {
    return
  }

  const storage = getStorage()
  const fileRef = storageRef(storage, fullPath)

  try {
    await deleteObject(fileRef)
  } catch (error: any) {
    // Ignore not-found errors so deleting older records without thumbnails still succeeds.
    if (error?.code !== 'storage/object-not-found') {
      throw error
    }
  }
}

export const deleteFileMetadataByFullPath = async (fullPath: string): Promise<string[]> => {
  const q = query(clientCol(FILES_COLLECTION), where('fullPath', '==', fullPath))
  const snapshot = await getDocs(q)

  const deletedIds: string[] = []
  for (const docItem of snapshot.docs) {
    await deleteDoc(clientDoc(FILES_COLLECTION, docItem.id))
    deletedIds.push(docItem.id)
  }

  return deletedIds
}
