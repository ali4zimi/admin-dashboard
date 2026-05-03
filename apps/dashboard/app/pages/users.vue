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

    <BaseDataTable
      :columns="columns"
      :data="users"
      :loading="loading"
      :row-key="(u) => u.id ?? ''"
      empty-title="No users found"
      empty-description="Try adjusting your filters or add a new user."
    />

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
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { UserData } from '@restaurant-platform/types/user.types'
import BaseBadge from '~/components/base/BaseBadge.vue'
import IconButton from '~/components/base/IconButton.vue'
import { Icon } from '#components'

useHead({ title: 'User Management - Admin Panel' })

const { users, loading, fetchUsers, searchUsers, deleteUser } = useUsers()
const { isAdmin, currentUserProfile } = useAuth()
const toast = useToast()

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

const handleUserSaved = () => {
  toast.success(selectedUser.value ? 'User updated' : 'User created')
}

const handleUserDeleted = async () => {
  const name = userToDelete.value?.displayName || userToDelete.value?.email || 'User'
  if (userToDelete.value?.id) {
    try {
      await deleteUser(userToDelete.value.id)
      toast.success(`${name} deleted`)
    } catch (e) {
      toast.error('Failed to delete user', e instanceof Error ? e.message : undefined)
    }
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

const dateValue = (date: any): number => {
  if (!date) return 0
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

const columns: ColumnDef<UserData, any>[] = [
  {
    accessorFn: (row) => userLabel(row),
    id: 'name',
    header: 'User',
    cell: ({ row }) => {
      const label = userLabel(row.original)
      return h('div', { class: 'flex items-center' }, [
        h(
          'div',
          {
            class: ['flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white', avatarColor(label)],
            'aria-hidden': 'true',
          },
          initials(label),
        ),
        h('div', { class: 'ml-4 text-sm font-medium text-gray-900' }, label),
      ])
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => h('span', { class: 'text-sm text-gray-500' }, String(getValue() ?? '')),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) =>
      h(
        BaseBadge as any,
        { color: row.original.role === 'admin' ? 'purple' : 'gray' },
        () => (row.original.role === 'admin' ? 'Admin' : 'User'),
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        BaseBadge as any,
        { color: row.original.status === 'active' ? 'green' : 'red' },
        () => (row.original.status === 'active' ? 'Active' : 'Inactive'),
      ),
  },
  {
    id: 'createdAt',
    header: 'Joined',
    accessorFn: (row) => dateValue(row.createdAt),
    cell: ({ row }) => h('span', { class: 'text-sm text-gray-500' }, formatDate(row.original.createdAt)),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { align: 'right' },
    cell: ({ row }) => {
      const user = row.original
      const buttons = []
      if (isAdmin.value) {
        buttons.push(
          h(
            IconButton as any,
            {
              label: 'Edit user',
              tone: 'success',
              onClick: () => openEditModal(user),
            },
            () => h(Icon as any, { name: 'lucide:pencil', class: 'h-5 w-5' }),
          ),
        )
      }
      if (isAdmin.value && user.id !== currentUserProfile.value?.id) {
        buttons.push(
          h(
            IconButton as any,
            {
              label: 'Delete user',
              tone: 'danger',
              onClick: () => openDeleteModal(user),
            },
            () => h(Icon as any, { name: 'lucide:trash-2', class: 'h-5 w-5' }),
          ),
        )
      }
      return h('div', { class: 'flex justify-end space-x-2' }, buttons)
    },
  },
]

onMounted(() => {
  fetchUsers()
})
</script>
