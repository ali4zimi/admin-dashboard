<template>
  <BaseModal v-model="isOpen" title="Confirm Delete" size="sm">
    <div class="flex h-full flex-col items-center justify-center text-center">
      <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h4 class="mb-2 text-lg font-medium text-gray-900">Delete {{ itemType }}</h4>
      <p class="text-sm text-gray-500">
        Are you sure you want to delete <span class="font-medium">{{ itemName }}</span>? This action cannot be undone.
      </p>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="isOpen = false">Cancel</BaseButton>
      <BaseButton variant="danger" :loading="loading" @click="handleDelete">Delete</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  itemId: string | null
  itemName: string
  itemType?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'Item'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleDelete = async () => {
  if (!props.itemId) return

  loading.value = true

  try {
    emit('confirm')
    isOpen.value = false
  } catch (e) {
    console.error('Error during delete:', e)
  } finally {
    loading.value = false
  }
}
</script>
