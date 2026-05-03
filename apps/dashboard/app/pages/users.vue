<template>
  <div>
    <PageHeader title="User Management" description="Manage and monitor user accounts.">
      <template v-if="isAdmin" #actions>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          </template>
          Add User
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <label for="users-search" class="sr-only">Search users</label>
        <input
          id="users-search"
          v-model="searchTerm"
          type="text"
          placeholder="Search users..."
          class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="debouncedSearch"
        />
        <button
          v-if="searchTerm"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterRole"
          aria-label="Filter by role"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option value="All Roles">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select
          v-model="filterStatus"
          aria-label="Filter by status"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option value="All Status">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <BaseButton v-if="hasActiveFilters" variant="ghost" size="sm" @click="resetFilters">
          Clear
        </BaseButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <BaseSpinner />
    </div>

    <!-- Empty state -->
    <EmptyState v-else-if="users.length === 0" title="No users found" description="Get started by adding your first user.">
      <template #icon>
        <Icon name="lucide:user-plus" class="h-6 w-6 text-gray-400" />
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
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
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    :class="avatarColor(userLabel(user))"
                    aria-hidden="true"
                  >
                    {{ initials(userLabel(user)) }}
                  </div>
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
                    <Icon name="lucide:pencil" class="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    v-if="isAdmin && user.id !== currentUserProfile?.id"
                    label="Delete user"
                    tone="danger"
                    @click="openDeleteModal(user)"
                  >
                    <Icon name="lucide:trash-2" class="h-5 w-5" />
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

    <UserFormModal
      v-model="showUserModal"
      :user="selectedUser"
      @saved="handleUserSaved"
    />

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

useHead({ title: 'User Management - Admin Panel' })

const { users, loading, fetchUsers, searchUsers, deleteUser } = useUsers()
const { isAdmin, currentUserProfile } = useAuth()

const searchTerm = ref('')
const filterRole = ref('All Roles')
const filterStatus = ref('All Status')

const showUserModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<UserData | null>(null)
const userToDelete = ref<UserData | null>(null)

const hasActiveFilters = computed(() =>
  searchTerm.value !== '' || filterRole.value !== 'All Roles' || filterStatus.value !== 'All Status'
)

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(handleSearch, 300)
}

const handleSearch = () => {
  searchUsers(searchTerm.value, filterRole.value, filterStatus.value)
}

const clearSearch = () => {
  searchTerm.value = ''
  handleSearch()
}

const resetFilters = () => {
  searchTerm.value = ''
  filterRole.value = 'All Roles'
  filterStatus.value = 'All Status'
  handleSearch()
}

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

const handleUserSaved = () => {}

const handleUserDeleted = async () => {
  if (userToDelete.value?.id) {
    await deleteUser(userToDelete.value.id)
  }
  userToDelete.value = null
}

const userLabel = (user: UserData): string => {
  return user.displayName?.trim() || user.email?.split('@')[0] || 'Unnamed user'
}

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  const last = parts[parts.length - 1]
  if (!first) return '?'
  if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase()
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
}

const avatarPalette = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-orange-500',
]

const avatarColor = (name: string): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return avatarPalette[Math.abs(hash) % avatarPalette.length] ?? avatarPalette[0]!
}

const formatDate = (date: any) => {
  if (!date) return '-'
  if (date?.toDate) date = date.toDate()
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchUsers()
})
</script>
