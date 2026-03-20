<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Table Management</h1>
        <p class="text-gray-600">Manage restaurant tables and their statuses.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="openAddModal"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Table
        </button>
      </div>
    </div>

    <!-- Filter/Search -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-2">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search tables..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <svg class="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredTables.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-gray-900">No tables found</h3>
      <p class="mb-4 text-sm text-gray-500">Add your first table to get started.</p>
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="showTableModal = true"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Table
      </button>
    </div>

    <!-- Table grid view -->
    <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div
        v-for="table in filteredTables"
        :key="table.id"
        class="group relative pt-4 cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="inline-flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            @click="openEditModal(table)"
            aria-label="Edit table"
            title="Edit"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6a2 2 0 112.828 2.828l-6 6a2 2 0 01-2.828-2.828z" />
            </svg>
          </button>
          <button
            class="inline-flex h-7 w-7 items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100"
            @click="openDeleteModal(table)"
            aria-label="Delete table"
            title="Delete"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div class="p-3">
          <p class="truncate text-sm font-medium text-gray-900">{{ table.name }}</p>
          <div class="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Capacity: {{ table.capacity }}</span>
            <span :class="['inline-flex items-center rounded px-2 py-0.5 font-semibold', statusColorClass(table.status)]">
              <span class="w-2 h-2 rounded-full mr-1" :class="statusDotClass(table.status)"></span>
              {{ table.status.charAt(0).toUpperCase() + table.status.slice(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results info -->
    <div v-if="filteredTables.length > 0" class="mt-6 text-center">
      <p class="text-sm text-gray-500">Showing {{ filteredTables.length }} tables</p>
    </div>

    <!-- Table Modal -->
     <TableFormModal
      v-model="showTableModal"
      :table="editingTable"
      @saved="handleTableCreated"
    />

    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="tableToDelete?.id || null"
      :item-name="tableToDelete?.name || ''"
      item-type="Table"
      @confirm="handleTableDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { useTables } from '~/composables/restaurant/useTables'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'

import TableFormModal from '~/components/TableFormModal.vue'

useHead({
  title: 'Table Management - Admin Panel'
})

const {
  tables,
  loading,
  fetchTables,
  deleteTable,
} = useTables()

const searchTerm = ref('')
const filterStatus = ref('')
const showTableModal = ref(false)
const showDeleteModal = ref(false)
const tableToDelete = ref<any | null>(null)
const editingTable = ref<any | null>(null)

const filteredTables = computed(() => {
  let items = tables.value
  if (searchTerm.value) {
    const lowerTerm = searchTerm.value.toLowerCase()
    items = items.filter(table =>
      table.name.toLowerCase().includes(lowerTerm)
    )
  }
  if (filterStatus.value) {
    items = items.filter(table => table.status === filterStatus.value)
  }
  return items
})

const openDeleteModal = (table: any) => {
  tableToDelete.value = table
  showDeleteModal.value = true
}
const openEditModal = (table: any) => {
  editingTable.value = { ...table }
  showTableModal.value = true
}

const openAddModal = () => {
  editingTable.value = null
  showTableModal.value = true
}
const handleTableDeleted = async () => {
  if (tableToDelete.value) {
    await deleteTable(tableToDelete.value.id)
    // No need to fetch - store updates local cache automatically
  }
  tableToDelete.value = null
}
const handleTableCreated = async () => {
  // No need to fetch - store updates local cache automatically
}
onMounted(async () => {
  await fetchTables()
})

// Status color helpers
function statusColorClass(status: string) {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-700';
    case 'occupied':
      return 'bg-yellow-100 text-yellow-700';
    case 'reserved':
      return 'bg-blue-100 text-blue-700';
    case 'blocked':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
function statusDotClass(status: string) {
  switch (status) {
    case 'available':
      return 'bg-green-500';
    case 'occupied':
      return 'bg-yellow-500';
    case 'reserved':
      return 'bg-blue-500';
    case 'blocked':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}
</script>
