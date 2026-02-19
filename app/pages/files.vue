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
        <span class="text-sm text-gray-500">45.2 GB of 100 GB used</span>
      </div>
      <div class="mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style="width: 45%"></div>
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
            <p class="text-xs text-gray-500">18.5 GB</p>
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
            <p class="text-xs text-gray-500">12.3 GB</p>
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
            <p class="text-xs text-gray-500">10.2 GB</p>
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
            <p class="text-xs text-gray-500">4.2 GB</p>
          </div>
        </div>
      </div>
    </div>

    <!-- View toggle and filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-2">
        <input
          type="text"
          placeholder="Search files..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
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

    <!-- Files grid view -->
    <div v-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div
        v-for="file in files"
        :key="file.id"
        class="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="flex h-32 items-center justify-center" :class="file.bgColor">
          <component :is="file.icon" class="h-12 w-12" :class="file.iconColor" />
        </div>
        <div class="p-3">
          <p class="truncate text-sm font-medium text-gray-900">{{ file.name }}</p>
          <div class="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{{ file.size }}</span>
            <span>{{ file.date }}</span>
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
          <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="file.bgColor">
                  <component :is="file.icon" class="h-5 w-5" :class="file.iconColor" />
                </div>
                <span class="ml-3 text-sm font-medium text-gray-900">{{ file.name }}</span>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ file.type }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ file.size }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ file.date }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <div class="flex justify-end space-x-2">
                <button class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600">
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
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'File Management - Admin Panel'
})

const viewMode = ref<'grid' | 'list'>('grid')

// Icon components
const ImageIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
}

const DocumentIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`
}

const VideoIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`
}

const PdfIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`
}

const files = ref([
  { id: 1, name: 'project-banner.png', type: 'Image', size: '2.4 MB', date: 'Feb 18, 2026', icon: ImageIcon, bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
  { id: 2, name: 'report-2026.pdf', type: 'PDF', size: '1.8 MB', date: 'Feb 17, 2026', icon: PdfIcon, bgColor: 'bg-red-50', iconColor: 'text-red-500' },
  { id: 3, name: 'presentation.pptx', type: 'Document', size: '5.2 MB', date: 'Feb 16, 2026', icon: DocumentIcon, bgColor: 'bg-orange-50', iconColor: 'text-orange-500' },
  { id: 4, name: 'product-demo.mp4', type: 'Video', size: '24.5 MB', date: 'Feb 15, 2026', icon: VideoIcon, bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
  { id: 5, name: 'team-photo.jpg', type: 'Image', size: '3.1 MB', date: 'Feb 14, 2026', icon: ImageIcon, bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
  { id: 6, name: 'contract.docx', type: 'Document', size: '856 KB', date: 'Feb 13, 2026', icon: DocumentIcon, bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
  { id: 7, name: 'invoice-001.pdf', type: 'PDF', size: '245 KB', date: 'Feb 12, 2026', icon: PdfIcon, bgColor: 'bg-red-50', iconColor: 'text-red-500' },
  { id: 8, name: 'logo.svg', type: 'Image', size: '12 KB', date: 'Feb 11, 2026', icon: ImageIcon, bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
  { id: 9, name: 'tutorial.mp4', type: 'Video', size: '156 MB', date: 'Feb 10, 2026', icon: VideoIcon, bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
  { id: 10, name: 'meeting-notes.txt', type: 'Document', size: '4 KB', date: 'Feb 09, 2026', icon: DocumentIcon, bgColor: 'bg-gray-50', iconColor: 'text-gray-500' },
])
</script>
