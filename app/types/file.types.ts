export type UploadStatus = 'uploading' | 'completed' | 'error'

export interface FileData {
  id: string
  name: string
  fullPath: string
  type: string
  size: number
  sizeFormatted: string
  contentType: string
  downloadUrl: string
  createdAt: Date
  updatedAt: Date
}

export interface UploadProgress {
  fileName: string
  progress: number
  status: UploadStatus
  error?: string
}

export interface StorageCategoryStats {
  count: number
  size: number
}

export interface StorageStats {
  totalFiles: number
  images: StorageCategoryStats
  documents: StorageCategoryStats
  videos: StorageCategoryStats
  others: StorageCategoryStats
}

export interface FileMetadataRecord {
  id: string
  name: string
  fullPath: string
  type: string
  size: number
  contentType: string
  downloadUrl: string
  createdAt?: Date
  updatedAt?: Date
}
