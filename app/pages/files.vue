<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">File Management</h1>
        <p class="text-gray-600">Upload and organize your files.</p>
      </div>
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="showUploadModal = true"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload Files
      </button>
    </div>

    <!-- Storage overview -->
    <div class="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Storage Overview</h2>
        <span class="text-sm text-gray-500">{{ storageStats.totalFiles }} files</span>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="flex items-center space-x-3">
          <div class="rounded-lg bg-blue-100 p-2">
            <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Images</p>
            <p class="text-xs text-gray-500">{{ storageStats.images.count }} files ({{ formatFileSize(storageStats.images.size) }})</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="rounded-lg bg-green-100 p-2">
            <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Documents</p>
            <p class="text-xs text-gray-500">{{ storageStats.documents.count }} files ({{ formatFileSize(storageStats.documents.size) }})</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="rounded-lg bg-purple-100 p-2">
            <svg class="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Videos</p>
            <p class="text-xs text-gray-500">{{ storageStats.videos.count }} files ({{ formatFileSize(storageStats.videos.size) }})</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="rounded-lg bg-orange-100 p-2">
            <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Others</p>
            <p class="text-xs text-gray-500">{{ storageStats.others.count }} files ({{ formatFileSize(storageStats.others.size) }})</p>
          </div>
        </div>
      </div>
    </div>

    <!-- View toggle and filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-2">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search files..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="handleSearch"
        />
        <select
          v-model="filterType"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option>All Types</option>
          <option>Images</option>
          <option>Documents</option>
          <option>Videos</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button
          :class="[
            'rounded-lg p-2 transition-colors',
            viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
          ]"
          @click="viewMode = 'grid'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          :class="[
            'rounded-lg p-2 transition-colors',
            viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
          ]"
          @click="viewMode = 'list'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <svg class="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredFiles.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-gray-900">No files found</h3>
      <p class="mb-4 text-sm text-gray-500">Upload your first file to get started.</p>
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="showUploadModal = true"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload Files
      </button>
    </div>

    <!-- Files grid view -->
    <div v-else-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div
        v-for="file in filteredFiles"
        :key="file.id"
        class="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
        @click="openFileViewer(file)"
      >
        <!-- Image preview or icon -->
        <div
          v-if="file.type === 'Image'"
          class="h-32 bg-cover bg-center"
          :style="{ backgroundImage: `url(${file.downloadUrl})` }"
        ></div>
        <div v-else class="flex h-32 items-center justify-center" :class="getFileBgColor(file.type)">
          <svg class="h-12 w-12" :class="getFileIconColor(file.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="file.type === 'Video'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path v-else-if="file.type === 'PDF'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="p-3">
          <p class="truncate text-sm font-medium text-gray-900">{{ file.name }}</p>
          <div class="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{{ file.sizeFormatted }}</span>
            <span>{{ formatDate(file.updatedAt) }}</span>
          </div>
          <div class="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="flex-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
              @click.stop="downloadFile(file)"
            >
              Download
            </button>
            <button
              class="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
              @click.stop="openDeleteModal(file)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Files list view -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Size</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Modified</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="file in filteredFiles" :key="file.id" class="hover:bg-gray-50" @click="openFileViewer(file)" style="cursor: pointer;">
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="getFileBgColor(file.type)">
                  <svg class="h-5 w-5" :class="getFileIconColor(file.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="file.type === 'Image'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    <path v-else-if="file.type === 'Video'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <path v-else-if="file.type === 'PDF'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span class="ml-3 text-sm font-medium text-gray-900">{{ file.name }}</span>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ file.type }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ file.sizeFormatted }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ formatDate(file.updatedAt) }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <div class="flex justify-end space-x-2">
                <button
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                  @click.stop="downloadFile(file)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  @click.stop="openDeleteModal(file)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Results info -->
    <div v-if="filteredFiles.length > 0" class="mt-6 text-center">
      <p class="text-sm text-gray-500">Showing {{ filteredFiles.length }} files</p>
    </div>

    <!-- Upload Modal -->
    <FileUploadModal
      v-model="showUploadModal"
      @uploaded="handleUploadComplete"
    />

    <!-- File Viewer Modal -->
    <FileViewerModal
      v-model="showFileViewer"
      :file="fileToView || undefined"
      @download="downloadFile"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="fileToDelete?.id || null"
      :item-name="fileToDelete?.name || ''"
      item-type="File"
      @confirm="handleFileDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import type { FileData } from '~/types/file.types'

useHead({
  title: 'File Management - Admin Panel'
})

const { files, loading, storageStats, fetchFiles, deleteFile, downloadFile, searchFiles, formatFileSize } = useFiles()

const viewMode = ref<'grid' | 'list'>('grid')
const searchTerm = ref('')
const filterType = ref('All Types')
const showUploadModal = ref(false)
const showDeleteModal = ref(false)
const fileToDelete = ref<FileData | null>(null)

// Filtered files based on search and type
const filteredFiles = computed(() => {
  return searchFiles(searchTerm.value, filterType.value)
})

const handleSearch = () => {
  // Search is reactive through computed
}

const getFileBgColor = (type: string) => {
  switch (type) {
    case 'Image': return 'bg-blue-50'
    case 'Video': return 'bg-purple-50'
    case 'PDF': return 'bg-red-50'
    case 'Document': return 'bg-orange-50'
    default: return 'bg-gray-50'
  }
}

const getFileIconColor = (type: string) => {
  switch (type) {
    case 'Image': return 'text-blue-500'
    case 'Video': return 'text-purple-500'
    case 'PDF': return 'text-red-500'
    case 'Document': return 'text-orange-500'
    default: return 'text-gray-500'
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const openDeleteModal = (file: FileData) => {
  fileToDelete.value = file
  showDeleteModal.value = true
}

const handleFileDeleted = async () => {
  if (fileToDelete.value) {
    await deleteFile(fileToDelete.value)
  }
  fileToDelete.value = null
}

const showFileViewer = ref(false)
const fileToView = ref<FileData | null>(null)

const openFileViewer = (file: FileData) => {
  console.log('Opening file viewer for:', file)
  fileToView.value = file
  showFileViewer.value = true
}

const handleUploadComplete = () => {
  // Files are automatically added by the composable
}

// Fetch files on mount
onMounted(() => {
  fetchFiles('')
})
</script>
