
/**
 * Files Composable - Thin wrapper around Files Store
 */

import { storeToRefs } from 'pinia'
import { useFilesStore } from '~/stores/files.store'

export const useFiles = () => {
  const store = useFilesStore()
  const { files, loading, uploading, uploadProgress, storageStats } = storeToRefs(store)

  return {
    files,
    loading,
    uploading,
    uploadProgress,
    storageStats,
    fetchFiles: (path = '') => store.fetchFiles(path),
    uploadFiles: (fileList: FileList | File[], path = 'uploads') => store.uploadFiles(fileList, path),
    deleteFile: (file: import('@restaurant-platform/types/file.types').FileData) => store.deleteFile(file),
    downloadFile: (file: import('@restaurant-platform/types/file.types').FileData) => store.downloadFile(file),
    searchFiles: (term: string, typeFilter: string = 'All Types') => store.searchFiles(term, typeFilter),
    formatFileSize: (bytes: number) => store.formatFileSize(bytes),
    resetUploadState: () => store.resetUploadState(),
    clearStore: () => store.clearStore(),
  }
}
