<template>
  <BaseModal v-model="isOpen" title="Upload Files" size="lg">
    <div class="space-y-4">
      <!-- Drop zone -->
      <div
        class="relative rounded-lg border-2 border-dashed p-8 text-center transition-colors"
        :class="[
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          @change="handleFileSelect"
        />
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p class="mb-1 text-sm font-medium text-gray-900">
          <span class="text-blue-600">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">PNG, JPG, PDF, DOC, MP4 up to 50MB</p>
      </div>

      <!-- Selected files -->
      <div v-if="selectedFiles.length > 0" class="space-y-2">
        <h4 class="text-sm font-medium text-gray-900">Selected Files ({{ selectedFiles.length }})</h4>
        <div class="max-h-48 space-y-2 overflow-y-auto">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex items-center justify-between rounded-lg border border-gray-200 p-3"
          >
            <div class="flex items-center space-x-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="getFileIconBg(file.type)">
                <svg class="h-5 w-5" :class="getFileIconColor(file.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="file.type.startsWith('image/')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  <path v-else-if="file.type.startsWith('video/')" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path v-else-if="file.type === 'application/pdf'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 truncate max-w-xs">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
              </div>
            </div>
            <button
              type="button"
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              @click="removeFile(index)"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Upload progress -->
      <div v-if="uploading && uploadProgress.length > 0" class="space-y-2">
        <h4 class="text-sm font-medium text-gray-900">Upload Progress</h4>
        <div class="space-y-2">
          <div
            v-for="(progress, index) in uploadProgress"
            :key="index"
            class="rounded-lg border border-gray-200 p-3"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900 truncate max-w-xs">{{ progress.fileName }}</span>
              <span
                class="text-xs font-medium"
                :class="{
                  'text-blue-600': progress.status === 'uploading',
                  'text-green-600': progress.status === 'completed',
                  'text-red-600': progress.status === 'error'
                }"
              >
                {{ progress.status === 'completed' ? 'Done' : progress.status === 'error' ? 'Failed' : `${Math.round(progress.progress)}%` }}
              </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="{
                  'bg-blue-500': progress.status === 'uploading',
                  'bg-green-500': progress.status === 'completed',
                  'bg-red-500': progress.status === 'error'
                }"
                :style="{ width: `${progress.progress}%` }"
              ></div>
            </div>
            <p v-if="progress.error" class="mt-1 text-xs text-red-500">{{ progress.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="handleClose"
      >
        {{ uploading ? 'Close' : 'Cancel' }}
      </button>
      <button
        v-if="!allUploadsComplete"
        type="button"
        :disabled="uploading || selectedFiles.length === 0"
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleUpload"
      >
        <svg v-if="uploading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ uploading ? 'Uploading...' : 'Upload Files' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'uploaded': []
}>()

const { uploading, uploadProgress, uploadFiles, formatFileSize } = useFiles()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFiles = ref<File[]>([])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const allUploadsComplete = computed(() => {
  if (uploadProgress.value.length === 0) return false
  return uploadProgress.value.every(
    (p) => p.status === 'completed' || p.status === 'error'
  )
})

const getFileIconBg = (type: string) => {
  if (type.startsWith('image/')) return 'bg-blue-100'
  if (type.startsWith('video/')) return 'bg-purple-100'
  if (type === 'application/pdf') return 'bg-red-100'
  return 'bg-gray-100'
}

const getFileIconColor = (type: string) => {
  if (type.startsWith('image/')) return 'text-blue-600'
  if (type.startsWith('video/')) return 'text-purple-600'
  if (type === 'application/pdf') return 'text-red-600'
  return 'text-gray-600'
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)]
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(event.dataTransfer.files)]
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return
  await uploadFiles(selectedFiles.value)
  emit('uploaded')
  // Auto-close modal after successful upload
  setTimeout(() => {
    selectedFiles.value = []
    isOpen.value = false
  }, 1000)
}

const handleClose = () => {
  if (!uploading.value) {
    selectedFiles.value = []
  }
  isOpen.value = false
}

// Reset state when modal opens
watch(isOpen, (value) => {
  if (value) {
    selectedFiles.value = []
  }
})
</script>
