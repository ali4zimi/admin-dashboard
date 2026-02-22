
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  type UploadTaskSnapshot,
} from 'firebase/storage'
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore'

import { useActivityLog } from '~/composables/useActivityLog'
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
  const { storage, firestore } = useFirebase()
  const { logActivity } = useActivityLog()
  const { user } = useAuth ? useAuth() : { user: { value: null } }

  // Fetch all files from Firestore (not storage)
  const fetchFiles = async (p0: string) => {
    if (!firestore) return

    loading.value = true
    try {
      const q = query(collection(firestore, 'files'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      files.value = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          fullPath: data.fullPath,
          type: data.type,
          size: data.size,
          sizeFormatted: formatFileSize(data.size),
          contentType: data.contentType,
          downloadUrl: data.downloadUrl,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as FileData
      })
      calculateStats()
    } catch (e) {
      console.error('Error fetching files from Firestore:', e)
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

              // Store metadata in Firestore
              if (firestore) {
                try {
                  await addDoc(collection(firestore, 'files'), {
                    name: newFile.name,
                    fullPath: newFile.fullPath,
                    type: newFile.type,
                    size: newFile.size,
                    contentType: newFile.contentType,
                    downloadUrl: newFile.downloadUrl,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  })
                  // Log activity in activityLog collection
                  await logActivity({
                    action: 'file.upload',
                    actorId: user?.value?.uid || '',
                    actorType: user?.value?.role || 'user',
                    targetType: 'file',
                    targetId: newFile.fullPath,
                    status: 'success',
                    severity: 'info',
                    message: `${user?.value?.displayName || user?.value?.email || 'User'} uploaded file "${newFile.name}"`,
                    changes: { before: null, after: { ...newFile } },
                    metadata: {
                      fileName: newFile.name,
                      fileType: newFile.type,
                      fileSize: newFile.size,
                    },
                  })
                } catch (err) {
                  console.error('Error saving file metadata or activity log to Firestore:', err)
                }
              }
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
    if (!storage || !firestore) return

    try {
      const fileRef = storageRef(storage, file.fullPath)
      await deleteObject(fileRef)

      // Remove from Firestore
      try {
        // If file.id is a Firestore doc id, use it; otherwise, try to find by fullPath
        let docId = file.id
        // If id looks like a path, try to find the Firestore doc by fullPath
        if (docId.includes('/')) {
          // Find the Firestore doc with matching fullPath
          const { getDocs, collection, query, where, deleteDoc, doc, addDoc, serverTimestamp } = await import('firebase/firestore')
          const q = query(collection(firestore, 'files'), where('fullPath', '==', file.fullPath))
          const snapshot = await getDocs(q)
          snapshot.forEach(async (d) => {
            await deleteDoc(doc(firestore, 'files', d.id))
            // Log activity
            await logActivity({
              action: 'file.delete',
              actorId: user?.value?.uid || '',
              actorType: user?.value?.role || 'user',
              targetType: 'file',
              targetId: file.fullPath,
              status: 'success',
              severity: 'info',
              message: `${user?.value?.displayName || user?.value?.email || 'User'} deleted file "${file.name}"`,
              changes: { before: file, after: null },
              metadata: {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
              },
            })
          })
        } else {
          // Delete by doc id
          const { deleteDoc, doc, addDoc, collection, serverTimestamp } = await import('firebase/firestore')
          await deleteDoc(doc(firestore, 'files', docId))
          // Log activity
          await logActivity({
            action: 'file.delete',
            actorId: user?.value?.uid || '',
            actorType: user?.value?.role || 'user',
            targetType: 'file',
            targetId: file.fullPath,
            status: 'success',
            severity: 'info',
            message: `${user?.value?.displayName || user?.value?.email || 'User'} deleted file "${file.name}"`,
            changes: { before: file, after: null },
            metadata: {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            },
          })
        }
      } catch (err) {
        console.error('Error deleting file metadata from Firestore:', err)
      }

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
  // TODO: Implement Firestore-powered search and filter for files
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
