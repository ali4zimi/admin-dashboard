<template>
  <div>
    <PageHeader title="User Management" description="Manage and monitor user accounts.">
      <template v-if="isAdmin" #actions>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </template>
          Add User
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="flex-1">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search users..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="debouncedSearch"
        />
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterRole"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option value="All Roles">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option value="All Status">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <BaseSpinner />
    </div>

    <!-- Empty state -->
    <EmptyState v-else-if="users.length === 0" title="No users found" description="Get started by adding your first user.">
      <template #icon>
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </template>
          Add User
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Users table -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center">
                  <img
                    :src="avatarUrl(user)"
                    :alt="userLabel(user)"
                    class="h-10 w-10 rounded-full"
                  />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ userLabel(user) }}</div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ user.email }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <BaseBadge :color="user.role === 'admin' ? 'purple' : 'gray'">
                  {{ user.role === 'admin' ? 'Admin' : 'User' }}
                </BaseBadge>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <BaseBadge :color="user.status === 'active' ? 'green' : 'red'">
                  {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                </BaseBadge>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ formatDate(user.createdAt) }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div class="flex justify-end space-x-2">
                  <IconButton
                    v-if="isAdmin"
                    label="Edit user"
                    tone="success"
                    @click="openEditModal(user)"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </IconButton>
                  <IconButton
                    v-if="isAdmin && user.id !== currentUserProfile?.id"
                    label="Delete user"
                    tone="danger"
                    @click="openDeleteModal(user)"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </IconButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Results info -->
      <div class="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <p class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ users.length }}</span> users
        </p>
      </div>
    </div>

    <!-- User Form Modal -->
    <UserFormModal
      v-model="showUserModal"
      :user="selectedUser"
      @saved="handleUserSaved"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="userToDelete?.id || null"
      :item-name="userToDelete?.displayName || ''"
      item-type="User"
      @confirm="handleUserDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import type { UserData } from '@restaurant-platform/types/user.types'

useHead({
  title: 'User Management - Admin Panel'
})

const { users, loading, fetchUsers, searchUsers, deleteUser } = useUsers()
const { isAdmin, currentUserProfile } = useAuth()

// Search and filters
const searchTerm = ref('')
const filterRole = ref('All Roles')
const filterStatus = ref('All Status')

// Modal states
const showUserModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<UserData | null>(null)
const userToDelete = ref<UserData | null>(null)

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 300)
}

const handleSearch = () => {
  searchUsers(searchTerm.value, filterRole.value, filterStatus.value)
}

// Modal handlers
const openAddModal = () => {
  if (!isAdmin.value) return
  selectedUser.value = null
  showUserModal.value = true
}

const openEditModal = (user: UserData) => {
  if (!isAdmin.value) return
  selectedUser.value = user
  showUserModal.value = true
}

const openDeleteModal = (user: UserData) => {
  if (!isAdmin.value || currentUserProfile.value?.id === user.id) return
  userToDelete.value = user
  showDeleteModal.value = true
}

const handleUserSaved = () => {
  // Users list is automatically updated by the composable
}

const handleUserDeleted = async () => {
  if (userToDelete.value?.id) {
    await deleteUser(userToDelete.value.id)
  }
  userToDelete.value = null
}

const userLabel = (user: UserData): string => {
  return user.displayName?.trim() || user.email?.split('@')[0] || 'Unnamed user'
}

const avatarUrl = (user: UserData): string => {
  const encoded = encodeURIComponent(userLabel(user))
  return `https://ui-avatars.com/api/?name=${encoded}&background=random`
}

// Format date helper
const formatDate = (date: any) => {
  if (!date) return '-'
  
  // Handle Firestore Timestamp
  if (date?.toDate) {
    date = date.toDate()
  }
  
  // Handle Date object or string
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Fetch users on mount
onMounted(() => {
  fetchUsers()
})
</script>
