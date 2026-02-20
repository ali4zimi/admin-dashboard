import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  type UploadTaskSnapshot,
} from 'firebase/storage'

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
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper to get file type category
const getFileType = (contentType: string): string => {
  if (contentType.startsWith('image/')) return 'Image'
  if (contentType.startsWith('video/')) return 'Video'
  if (contentType.startsWith('audio/')) return 'Audio'
  if (contentType === 'application/pdf') return 'PDF'
  if (contentType.includes('document') || contentType.includes('word') || contentType.includes('text')) return 'Document'
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) return 'Spreadsheet'
  if (contentType.includes('presentation') || contentType.includes('powerpoint')) return 'Presentation'
  return 'Other'
}

// Global state
const files = ref<FileData[]>([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref<UploadProgress[]>([])
const storageStats = ref({
  totalFiles: 0,
  images: { count: 0, size: 0 },
  documents: { count: 0, size: 0 },
  videos: { count: 0, size: 0 },
  others: { count: 0, size: 0 },
})

export const useFiles = () => {
  const { storage } = useFirebase()

  // Fetch all files from a path
  const fetchFiles = async (path: string = 'uploads') => {
    if (!storage) return

    loading.value = true
    try {
      const listRef = storageRef(storage, path)
      const result = await listAll(listRef)

      const filePromises = result.items.map(async (itemRef) => {
        const metadata = await getMetadata(itemRef)
        const downloadUrl = await getDownloadURL(itemRef)

        // Use original filename from custom metadata if available, otherwise strip timestamp prefix
        let displayName = itemRef.name
        if (metadata.customMetadata?.originalName) {
          displayName = metadata.customMetadata.originalName
        } else {
          // Strip timestamp prefix (format: timestamp_filename)
          const underscoreIndex = displayName.indexOf('_')
          if (underscoreIndex > 0 && /^\d+$/.test(displayName.substring(0, underscoreIndex))) {
            displayName = displayName.substring(underscoreIndex + 1)
          }
        }

        return {
          id: itemRef.fullPath,
          name: displayName,
          fullPath: itemRef.fullPath,
          type: getFileType(metadata.contentType || 'application/octet-stream'),
          size: metadata.size,
          sizeFormatted: formatFileSize(metadata.size),
          contentType: metadata.contentType || 'application/octet-stream',
          downloadUrl,
          createdAt: new Date(metadata.timeCreated),
          updatedAt: new Date(metadata.updated),
        } as FileData
      })

      files.value = await Promise.all(filePromises)

      // Sort by date (newest first)
      files.value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      // Calculate storage stats
      calculateStats()
    } catch (e) {
      console.error('Error fetching files:', e)
    } finally {
      loading.value = false
    }
  }

  // Calculate storage statistics
  const calculateStats = () => {
    const stats = {
      totalFiles: files.value.length,
      images: { count: 0, size: 0 },
      documents: { count: 0, size: 0 },
      videos: { count: 0, size: 0 },
      others: { count: 0, size: 0 },
    }

    files.value.forEach((file) => {
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

    storageStats.value = stats
  }

  // Upload files
  const uploadFiles = async (fileList: FileList | File[], path: string = 'uploads') => {
    if (!storage || fileList.length === 0) return

    uploading.value = true
    uploadProgress.value = []

    const uploadPromises = Array.from(fileList).map((file) => {
      return new Promise<FileData | null>((resolve) => {
        const fileRef = storageRef(storage, `${path}/${Date.now()}_${file.name}`)
        // Store original filename in custom metadata
        const uploadMetadata = {
          customMetadata: {
            originalName: file.name,
          },
        }
        const uploadTask = uploadBytesResumable(fileRef, file, uploadMetadata)

        // Track progress for this file
        const progressItem: UploadProgress = {
          fileName: file.name,
          progress: 0,
          status: 'uploading',
        }
        uploadProgress.value.push(progressItem)

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            progressItem.progress = progress
          },
          (error) => {
            console.error('Upload error:', error)
            progressItem.status = 'error'
            progressItem.error = error.message
            resolve(null)
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
              const metadata = await getMetadata(uploadTask.snapshot.ref)

              progressItem.status = 'completed'
              progressItem.progress = 100

              const newFile: FileData = {
                id: fileRef.fullPath,
                name: file.name,
                fullPath: fileRef.fullPath,
                type: getFileType(metadata.contentType || file.type),
                size: metadata.size,
                sizeFormatted: formatFileSize(metadata.size),
                contentType: metadata.contentType || file.type,
                downloadUrl,
                createdAt: new Date(metadata.timeCreated),
                updatedAt: new Date(metadata.updated),
              }

              // Add to files array
              files.value.unshift(newFile)
              resolve(newFile)
            } catch (e) {
              console.error('Error getting download URL:', e)
              resolve(null)
            }
          }
        )
      })
    })

    await Promise.all(uploadPromises)
    calculateStats()
    uploading.value = false
  }

  // Delete a file
  const deleteFile = async (file: FileData) => {
    if (!storage) return

    try {
      const fileRef = storageRef(storage, file.fullPath)
      await deleteObject(fileRef)

      // Remove from local array
      const index = files.value.findIndex((f) => f.id === file.id)
      if (index !== -1) {
        files.value.splice(index, 1)
      }

      calculateStats()
    } catch (e) {
      console.error('Error deleting file:', e)
      throw e
    }
  }

  // Download a file (opens in new tab or triggers download)
  const downloadFile = (file: FileData) => {
    const link = document.createElement('a')
    link.href = file.downloadUrl
    link.target = '_blank'
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Search files
  const searchFiles = (term: string, typeFilter: string = 'All Types') => {
    let filtered = files.value

    if (term) {
      const searchLower = term.toLowerCase()
      filtered = filtered.filter((file) => file.name.toLowerCase().includes(searchLower))
    }

    if (typeFilter && typeFilter !== 'All Types') {
      const typeMap: Record<string, string[]> = {
        'Images': ['Image'],
        'Documents': ['Document', 'PDF', 'Spreadsheet', 'Presentation'],
        'Videos': ['Video'],
        'Audio': ['Audio'],
      }
      const types = typeMap[typeFilter] || [typeFilter]
      filtered = filtered.filter((file) => types.includes(file.type))
    }

    return filtered
  }

  return {
    files,
    loading,
    uploading,
    uploadProgress,
    storageStats,
    fetchFiles,
    uploadFiles,
    deleteFile,
    downloadFile,
    searchFiles,
    formatFileSize,
  }
}
