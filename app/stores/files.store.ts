/**
 * Files Store - Global state management for files
 *
 * Uses FilesService for Firebase operations.
 * Handles uploading, metadata, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as FilesService from '~/services/files.service'
import type {
  FileData,
  FileMetadataRecord,
  StorageStats,
  UploadProgress,
} from '~/types/file.types'

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const createEmptyStats = (): StorageStats => ({
  totalFiles: 0,
  images: { count: 0, size: 0 },
  documents: { count: 0, size: 0 },
  videos: { count: 0, size: 0 },
  others: { count: 0, size: 0 },
})

const toFileData = (record: FileMetadataRecord): FileData => ({
  id: record.id,
  name: record.name,
  fullPath: record.fullPath,
  type: record.type,
  size: record.size,
  sizeFormatted: formatFileSize(record.size),
  contentType: record.contentType,
  downloadUrl: record.downloadUrl,
  createdAt: record.createdAt || new Date(),
  updatedAt: record.updatedAt || new Date(),
})

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as FileData[],
    loading: false,
    uploading: false,
    error: null as string | null,
    uploadProgress: [] as UploadProgress[],
    storageStats: createEmptyStats(),
  }),

  getters: {
    searchFiles: (state) => (term: string, typeFilter: string = 'All Types') => {
      let filtered = state.files

      if (term) {
        const searchLower = term.toLowerCase()
        filtered = filtered.filter((file) => file.name.toLowerCase().includes(searchLower))
      }

      if (typeFilter && typeFilter !== 'All Types') {
        const typeMap: Record<string, string[]> = {
          Images: ['Image'],
          Documents: ['Document', 'PDF', 'Spreadsheet', 'Presentation'],
          Videos: ['Video'],
          Audio: ['Audio'],
        }
        const types = typeMap[typeFilter] || [typeFilter]
        filtered = filtered.filter((file) => types.includes(file.type))
      }

      return filtered
    },
  },

  actions: {
    recalculateStats() {
      const stats = createEmptyStats()
      stats.totalFiles = this.files.length

      this.files.forEach((file) => {
        switch (file.type) {
          case 'Image':
            stats.images.count++
            stats.images.size += file.size
            break
          case 'Video':
            stats.videos.count++
            stats.videos.size += file.size
            break
          case 'Document':
          case 'PDF':
          case 'Spreadsheet':
          case 'Presentation':
            stats.documents.count++
            stats.documents.size += file.size
            break
          default:
            stats.others.count++
            stats.others.size += file.size
        }
      })

      this.storageStats = stats
    },

    async fetchFiles(_path = '') {
      this.loading = true
      this.error = null

      try {
        const records = await FilesService.fetchAllFileMetadata()
        this.files = records.map(toFileData)
        this.recalculateStats()
        return this.files
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch files'
        return []
      } finally {
        this.loading = false
      }
    },

    async uploadFiles(fileList: FileList | File[], path = 'uploads') {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      if (!fileList || fileList.length === 0) {
        return []
      }

      this.uploading = true
      this.error = null
      this.uploadProgress = []

      try {
        const uploads = Array.from(fileList).map(async (file) => {
          const progressItem: UploadProgress = {
            fileName: file.name,
            progress: 0,
            status: 'uploading',
          }
          this.uploadProgress.push(progressItem)

          try {
            const uploadResult = await FilesService.uploadFileToStorage(file, path, (progressPercent) => {
              progressItem.progress = progressPercent
            })

            const docId = await FilesService.createFileMetadata({
              name: file.name,
              fullPath: uploadResult.fullPath,
              type: uploadResult.type,
              size: uploadResult.size,
              contentType: uploadResult.contentType,
              downloadUrl: uploadResult.downloadUrl,
            })

            const newFile: FileData = {
              id: docId,
              name: file.name,
              fullPath: uploadResult.fullPath,
              type: uploadResult.type,
              size: uploadResult.size,
              sizeFormatted: formatFileSize(uploadResult.size),
              contentType: uploadResult.contentType,
              downloadUrl: uploadResult.downloadUrl,
              createdAt: uploadResult.createdAt,
              updatedAt: uploadResult.updatedAt,
            }

            this.files = [newFile, ...this.files]
            progressItem.status = 'completed'
            progressItem.progress = 100

            await logActivity({
              action: 'file.upload',
              actorId: actorUser?.uid || '',
              actorType: actorUser?.role || 'user',
              targetType: 'file',
              targetId: newFile.fullPath,
              status: 'success',
              severity: 'info',
              message: `${actorUser?.displayName || actorUser?.email || 'User'} uploaded file "${newFile.name}"`,
              changes: { before: null, after: { ...newFile } },
              metadata: {
                fileName: newFile.name,
                fileType: newFile.type,
                fileSize: newFile.size,
              },
            })

            return newFile
          } catch (err: any) {
            progressItem.status = 'error'
            progressItem.error = err?.message || 'Upload failed'
            return null
          }
        })

        const results = await Promise.all(uploads)
        this.recalculateStats()
        return results.filter((item): item is FileData => item !== null)
      } catch (e: any) {
        this.error = e.message || 'Failed to upload files'
        return []
      } finally {
        this.uploading = false
      }
    },

    async deleteFile(file: FileData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.error = null

      try {
        await FilesService.deleteFileFromStorage(file.fullPath)
        await FilesService.deleteFileMetadataByFullPath(file.fullPath)

        this.files = this.files.filter((existingFile) => existingFile.fullPath !== file.fullPath)
        this.recalculateStats()

        await logActivity({
          action: 'file.delete',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'file',
          targetId: file.fullPath,
          status: 'success',
          severity: 'info',
          message: `${actorUser?.displayName || actorUser?.email || 'User'} deleted file "${file.name}"`,
          changes: { before: file, after: null },
          metadata: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        })

        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete file'
        throw e
      }
    },

    downloadFile(file: FileData) {
      const link = document.createElement('a')
      link.href = file.downloadUrl
      link.target = '_blank'
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    formatFileSize(bytes: number) {
      return formatFileSize(bytes)
    },

    clearStore() {
      this.files = []
      this.error = null
      this.uploadProgress = []
      this.storageStats = createEmptyStats()
    },
  },
})
