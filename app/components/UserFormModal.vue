<template>
  <BaseModal v-model="isOpen" :title="isEditing ? 'Edit User' : 'Add New User'" size="md">
    <form id="user-form" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter full name"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>

        <!-- Role -->
        <div>
          <label for="role" class="mb-1 block text-sm font-medium text-gray-700">Role</label>
          <select
            id="role"
            v-model="form.role"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="User">User</option>
            <option value="Editor">Editor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label for="status" class="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            v-model="form.status"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="isOpen = false"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="user-form"
        :disabled="loading"
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEditing ? 'Update User' : 'Add User' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { UserData } from '~/types/user.types'

interface Props {
  modelValue: boolean
  user?: UserData | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': [user: UserData]
}>()

const { createUser, updateUser } = useUsers()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.user?.id)

const form = ref({
  name: '',
  email: '',
  role: 'User' as 'Admin' | 'Editor' | 'User',
  status: 'Active' as 'Active' | 'Inactive',
})

// Reset form when modal opens/closes or user changes
watch(
  () => [props.modelValue, props.user],
  () => {
    if (props.modelValue && props.user) {
      form.value = {
        name: props.user.name,
        email: props.user.email,
        role: props.user.role,
        status: props.user.status,
      }
    } else if (props.modelValue) {
      form.value = {
        name: '',
        email: '',
        role: 'User',
        status: 'Active',
      }
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  loading.value = true

  try {
    let savedUser: UserData

    if (isEditing.value && props.user?.id) {
      savedUser = (await updateUser(props.user.id, form.value)) as UserData
    } else {
      savedUser = await createUser(form.value)
    }

    emit('saved', savedUser)
    isOpen.value = false
  } catch (e) {
    console.error('Error saving user:', e)
  } finally {
    loading.value = false
  }
}
</script>
