<template>
  <BaseModal v-model="isOpen" :title="isEditing ? 'Edit Menu Item' : 'Add Menu Item'">
    <form id="menu-form" @submit.prevent="handleSubmit">
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
          <label class="block mb-1 font-medium">Price</label>
          <input v-model.number="form.price" type="number" min="0" step="0.01" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Category</label>
          <select v-model="form.categoryId" required class="w-full rounded border px-3 py-2">
            <option v-for="cat in menuCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <!-- Image Upload/Picker -->
        <div>
          <label class="block mb-1 font-medium">Image</label>
          <div class="flex items-center gap-4">
            <div v-if="form.imageUrl" class="relative h-20 w-32 rounded overflow-hidden border">
              <img :src="form.imageUrl" alt="Image Preview" class="object-cover w-full h-full" />
              <button type="button" class="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-gray-600 hover:text-red-600" @click="form.imageUrl = ''">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <button type="button" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="showImageUpload = true" v-if="!form.imageUrl">
              Upload Image
            </button>
            <button type="button" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="openImagePicker" v-if="!form.imageUrl">
              Pick from Uploaded
            </button>
          </div>
          <FileUploadModal v-model="showImageUpload" @uploaded="handleImageUploaded" />
          <!-- Image Picker Modal -->
          <BaseModal v-model="showImagePicker" title="Select Image" size="lg">
            <div class="grid grid-cols-3 gap-4 max-h-72 overflow-y-auto p-2">
              <div v-for="img in imageFiles" :key="img.id" class="relative group cursor-pointer border rounded overflow-hidden" @click="selectImage(img.downloadUrl)">
                <img :src="img.downloadUrl" :alt="img.name" class="object-cover w-full h-24" />
                <div class="absolute inset-0 bg-black/10 group-hover:bg-blue-500/30 transition"></div>
              </div>
              <div v-if="imageFiles.length === 0" class="col-span-3 text-center text-gray-500 py-8">No images found.</div>
            </div>
            <template #footer>
              <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="showImagePicker = false">Cancel</button>
            </template>
          </BaseModal>
        </div>
      </div>
    </form>
    <template #footer>
      <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50" @click="isOpen = false">Cancel</button>
      <button type="submit" form="menu-form" :disabled="loading" class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEditing ? 'Update Menu Item' : 'Create Menu Item' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useMenu } from '~/composables/restaurant/useMenu'
import { useFiles } from '~/composables/useFiles'
import BaseModal from './BaseModal.vue'
import FileUploadModal from './FileUploadModal.vue'

const props = defineProps<{ modelValue: boolean, menuItem?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { menuCategories, createMenuItem, updateMenuItem, fetchMenuCategories } = useMenu()
const { files, fetchFiles } = useFiles()

const loading = ref(false)
const showImageUpload = ref(false)
const showImagePicker = ref(false)
const imageFiles = computed(() => files.value.filter(f => f.type === 'Image'))

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.menuItem?.id)

const form = ref({
  name: '',
  description: '',
  price: 0,
  categoryId: '',
  imageUrl: '',
})

watch(
  () => [props.modelValue, props.menuItem],
  () => {
    if (props.modelValue && props.menuItem) {
      form.value = {
        name: props.menuItem.name,
        description: props.menuItem.description || '',
        price: props.menuItem.price || 0,
        categoryId: props.menuItem.categoryId || '',
        imageUrl: props.menuItem.imageUrl || '',
      }
    } else if (props.modelValue) {
      form.value = {
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        imageUrl: '',
      }
    }
  },
  { immediate: true }
)

const handleImageUploaded = async () => {
  await fetchFiles('uploads')
  const imageFile = files.value.find(f => f.type === 'Image')
  if (imageFile) {
    form.value.imageUrl = imageFile.downloadUrl
  }
  showImageUpload.value = false
}

const openImagePicker = async () => {
  await fetchFiles('uploads')
  showImagePicker.value = true
}

const selectImage = (url: string) => {
  form.value.imageUrl = url
  showImagePicker.value = false
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditing.value && props.menuItem?.id) {
      await updateMenuItem(props.menuItem.id, form.value)
    } else {
      await createMenuItem(form.value)
    }
    emit('saved')
    isOpen.value = false
  } catch (e) {
    console.error('Error saving menu item:', e)
  } finally {
    loading.value = false
  }
}

fetchMenuCategories()
</script>
