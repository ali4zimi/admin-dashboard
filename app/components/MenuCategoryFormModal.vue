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
import BaseModal from './BaseModal.vue'

const props = defineProps<{ modelValue: boolean, category?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createMenuCategory, updateMenuCategory } = useMenu()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.category?.id)

const form = ref({
  name: '',
  description: '',
})

watch(
  () => [props.modelValue, props.category],
  () => {
    if (props.modelValue && props.category) {
      form.value = {
        name: props.category.name,
        description: props.category.description || '',
      }
    } else if (props.modelValue) {
      form.value = {
        name: '',
        description: '',
      }
    }
  },
  { immediate: true }
)

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
