<template>
  <BaseModal v-model="isOpen" title="Confirm Delete" size="sm">
    <div class="text-center">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h4 class="mb-2 text-lg font-medium text-gray-900">Delete User</h4>
      <p class="text-sm text-gray-500">
        Are you sure you want to delete <span class="font-medium">{{ userName }}</span>? This action cannot be undone.
      </p>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="isOpen = false"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="loading"
        class="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleDelete"
      >
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Delete
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  userId: string | null
  userName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'deleted': []
}>()

const { deleteUser } = useUsers()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleDelete = async () => {
  if (!props.userId) return

  loading.value = true

  try {
    await deleteUser(props.userId)
    emit('deleted')
    isOpen.value = false
  } catch (e) {
    console.error('Error deleting user:', e)
  } finally {
    loading.value = false
  }
}
</script>
