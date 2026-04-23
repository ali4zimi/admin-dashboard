<template>
  <BaseModal v-model="isOpen" :title="isEditing ? 'Edit Menu Category' : 'Add Menu Category'">
    <form id="category-form" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Name</label>
          <input v-model="form.name" type="text" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Description</label>
          <textarea v-model="form.description" class="w-full rounded border px-3 py-2" />
        </div>

        <div>
          <label class="mb-1 block font-medium">Category Image</label>
          <div class="flex items-center gap-4">
            <div v-if="form.imageUrl" class="relative h-20 w-32 overflow-hidden rounded border">
              <img :src="form.thumbnailUrl || form.imageUrl" alt="Category Image" class="h-full w-full object-cover" />
              <button
                type="button"
                class="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-gray-600 hover:text-red-600"
                @click="clearImageSelection"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <button
              v-if="!form.imageUrl"
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="showImageUpload = true"
            >
              Upload Image
            </button>
            <button
              v-if="!form.imageUrl"
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="openImagePicker"
            >
              Pick from Uploaded
            </button>
          </div>

          <FileUploadModal v-model="showImageUpload" @uploaded="handleImageUploaded" />

          <BaseModal v-model="showImagePicker" title="Select Image" size="lg">
            <div class="grid max-h-72 grid-cols-3 gap-4 overflow-y-auto p-2">
              <div
                v-for="img in imageFiles"
                :key="img.id"
                class="group relative cursor-pointer overflow-hidden rounded border"
                @click="selectImage(img)"
              >
                <img :src="img.thumbnailDownloadUrl || img.downloadUrl" :alt="img.name" class="h-24 w-full object-cover" />
                <div class="absolute inset-0 bg-black/10 transition group-hover:bg-blue-500/30"></div>
              </div>
              <div v-if="imageFiles.length === 0" class="col-span-3 py-8 text-center text-gray-500">No images found.</div>
            </div>
            <template #footer>
              <button
                type="button"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="showImagePicker = false"
              >
                Cancel
              </button>
            </template>
          </BaseModal>
        </div>
      </div>
    </form>
    <template #footer>
      <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50" @click="isOpen = false">Cancel</button>
      <button type="submit" form="category-form" :disabled="loading" class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEditing ? 'Update Category' : 'Create Category' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useMenu } from '~/composables/restaurant/useMenu'
import { useFiles } from '~/composables/useFiles'
import type { FileData } from '~/types/file.types'
import BaseModal from '../BaseModal.vue'
import FileUploadModal from '../FileUploadModal.vue'

const props = defineProps<{ modelValue: boolean, category?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createMenuCategory, updateMenuCategory } = useMenu()
const { files, fetchFiles } = useFiles()

const loading = ref(false)
const showImageUpload = ref(false)
const showImagePicker = ref(false)
const imageFiles = computed(() => files.value.filter((f) => f.type === 'Image'))

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.category?.id)

const form = ref({
  name: '',
  description: '',
  imageUrl: '',
  thumbnailUrl: '',
})

watch(
  () => [props.modelValue, props.category],
  () => {
    if (props.modelValue && props.category) {
      form.value = {
        name: props.category.name,
        description: props.category.description || '',
        imageUrl: props.category.imageUrl || '',
        thumbnailUrl: props.category.thumbnailUrl || '',
      }
    } else if (props.modelValue) {
      form.value = {
        name: '',
        description: '',
        imageUrl: '',
        thumbnailUrl: '',
      }
    }
  },
  { immediate: true }
)

const handleImageUploaded = async () => {
  await fetchFiles('uploads')
  const imageFile = files.value.find((f) => f.type === 'Image')
  if (imageFile) {
    form.value.imageUrl = imageFile.downloadUrl
    form.value.thumbnailUrl = imageFile.thumbnailDownloadUrl || imageFile.downloadUrl
  }
  showImageUpload.value = false
}

const openImagePicker = async () => {
  await fetchFiles('uploads')
  showImagePicker.value = true
}

const selectImage = (file: FileData) => {
  form.value.imageUrl = file.downloadUrl
  form.value.thumbnailUrl = file.thumbnailDownloadUrl || file.downloadUrl
  showImagePicker.value = false
}

const clearImageSelection = () => {
  form.value.imageUrl = ''
  form.value.thumbnailUrl = ''
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditing.value && props.category?.id) {
      await updateMenuCategory(props.category.id, form.value)
    } else {
      await createMenuCategory(form.value)
    }
    emit('saved')
    isOpen.value = false
  } catch (e) {
    console.error('Error saving menu category:', e)
  } finally {
    loading.value = false
  }
}
</script>
