<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tables</h1>
      <p class="text-gray-600">Real-time table status and floor overview.</p>
    </div>

    <!-- Status summary + Add button -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-4 text-sm">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-2 py-1 transition-colors"
          :class="filterStatus === 'available' ? 'bg-green-100' : 'hover:bg-gray-100'"
          @click="toggleFilter('available')"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
          <span class="text-gray-700">Available</span>
          <span class="font-semibold text-gray-900">({{ statusCounts.available }})</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-2 py-1 transition-colors"
          :class="filterStatus === 'occupied' ? 'bg-orange-100' : 'hover:bg-gray-100'"
          @click="toggleFilter('occupied')"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
          <span class="text-gray-700">Occupied</span>
          <span class="font-semibold text-gray-900">({{ statusCounts.occupied }})</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-2 py-1 transition-colors"
          :class="filterStatus === 'reserved' ? 'bg-blue-100' : 'hover:bg-gray-100'"
          @click="toggleFilter('reserved')"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          <span class="text-gray-700">Reserved</span>
          <span class="font-semibold text-gray-900">({{ statusCounts.reserved }})</span>
        </button>
        <button
          v-if="statusCounts.blocked > 0"
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-2 py-1 transition-colors"
          :class="filterStatus === 'blocked' ? 'bg-red-100' : 'hover:bg-gray-100'"
          @click="toggleFilter('blocked')"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
          <span class="text-gray-700">Blocked</span>
          <span class="font-semibold text-gray-900">({{ statusCounts.blocked }})</span>
        </button>
      </div>

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
        @click="openAddModal"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Table
      </button>
    </div>

    <!-- Table grid view -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="table in filteredTables"
        :key="table.id"
        class="group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md"
        :class="cardClass(table.status)"
      >
        <!-- Status dot (top right) -->
        <span
          class="absolute right-4 top-4 h-2.5 w-2.5 rounded-full"
          :class="statusDotClass(table.status)"
        ></span>

        <!-- Hover actions -->
        <div class="absolute right-3 top-8 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            class="inline-flex h-7 w-7 items-center justify-center rounded bg-white/80 text-gray-600 shadow-sm hover:bg-white hover:text-blue-600"
            @click="openEditModal(table)"
            aria-label="Edit table"
            title="Edit"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6a2 2 0 112.828 2.828l-6 6a2 2 0 01-2.828-2.828z" />
            </svg>
          </button>
          <button
            class="inline-flex h-7 w-7 items-center justify-center rounded bg-white/80 text-gray-600 shadow-sm hover:bg-white hover:text-red-600"
            @click="openDeleteModal(table)"
            aria-label="Delete table"
            title="Delete"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Card content -->
        <h3 class="pr-6 text-lg font-bold text-gray-900">{{ table.name }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ table.capacity }} {{ table.capacity === 1 ? 'seat' : 'seats' }}</p>

        <!-- Order chip (occupied) -->
        <div
          v-if="table.status === 'occupied' && orderLabel(table)"
          class="mt-4 flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-gray-700"
        >
          <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="font-medium">{{ orderLabel(table) }}</span>
        </div>

        <!-- Reservation chip (reserved) -->
        <div
          v-if="table.status === 'reserved' && reservationLabel(table)"
          class="mt-4 flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-gray-700"
        >
          <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-medium">{{ reservationLabel(table) }}</span>
        </div>
      </div>
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
import { useOrders } from '~/composables/restaurant/useOrders'
import { useReservations } from '~/composables/restaurant/useReservations'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'
import TableFormModal from '~/components/restaurant/TableFormModal.vue'
import type { Table, TableStatus } from '~/types/table.types'

useHead({
  title: 'Tables - Admin Panel'
})

const {
  tables,
  loading,
  fetchTables,
  deleteTable,
} = useTables()

const { orders, fetchOrders, getOrderById } = useOrders()
const { reservations, fetchReservations, getReservationById } = useReservations()

const filterStatus = ref<TableStatus | ''>('')
const showTableModal = ref(false)
const showDeleteModal = ref(false)
const tableToDelete = ref<Table | null>(null)
const editingTable = ref<Table | null>(null)

const statusCounts = computed(() => {
  const counts = { available: 0, occupied: 0, reserved: 0, blocked: 0 }
  for (const t of tables.value) {
    if (t.status in counts) counts[t.status as keyof typeof counts]++
  }
  return counts
})

const filteredTables = computed(() => {
  if (!filterStatus.value) return tables.value
  return tables.value.filter(t => t.status === filterStatus.value)
})

const toggleFilter = (status: TableStatus) => {
  filterStatus.value = filterStatus.value === status ? '' : status
}

const openDeleteModal = (table: Table) => {
  tableToDelete.value = table
  showDeleteModal.value = true
}
const openEditModal = (table: Table) => {
  editingTable.value = { ...table }
  showTableModal.value = true
}
const openAddModal = () => {
  editingTable.value = null
  showTableModal.value = true
}
const handleTableDeleted = async () => {
  if (tableToDelete.value?.id) {
    await deleteTable(tableToDelete.value.id)
  }
  tableToDelete.value = null
}
const handleTableCreated = async () => {}

onMounted(async () => {
  await Promise.all([
    fetchTables(),
    fetchOrders(),
    fetchReservations(),
  ])
})

// Labels for order / reservation chips
const orderLabel = (table: Table): string | null => {
  if (!table.currentOrderId) return null
  const order = getOrderById(table.currentOrderId) || orders.value.find(o => o.id === table.currentOrderId)
  if (!order) return `#${table.currentOrderId.slice(0, 6).toUpperCase()}`
  return order.orderNumber ? `#${order.orderNumber}` : `#${(order.id || '').slice(0, 6).toUpperCase()}`
}

const reservationLabel = (table: Table): string | null => {
  if (!table.currentReservationId) return null
  const res = getReservationById(table.currentReservationId) || reservations.value.find(r => r.id === table.currentReservationId)
  if (!res) return null
  return `${res.customerName}, ${formatReservationTime(res.startTime)}`
}

function formatReservationTime(value: any): string {
  if (!value) return ''
  let date: Date
  if (value?.toDate) date = value.toDate()
  else if (value instanceof Date) date = value
  else date = new Date(value)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// Card / status styling
function cardClass(status: string) {
  switch (status) {
    case 'available':
      return 'border-green-300 bg-green-50'
    case 'occupied':
      return 'border-orange-300 bg-orange-50'
    case 'reserved':
      return 'border-blue-300 bg-blue-50'
    case 'blocked':
      return 'border-red-300 bg-red-50'
    default:
      return 'border-gray-200 bg-white'
  }
}

function statusDotClass(status: string) {
  switch (status) {
    case 'available':
      return 'bg-green-500'
    case 'occupied':
      return 'bg-orange-500'
    case 'reserved':
      return 'bg-blue-500'
    case 'blocked':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}
</script>
