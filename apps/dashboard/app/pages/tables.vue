<template>
  <div>
    <PageHeader title="Tables" description="Real-time table status and floor overview." class="mb-6" />

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

      <BaseButton variant="primary" @click="openAddModal">
        <template #icon-left>
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        </template>
        Add Table
      </BaseButton>
    </div>

    <!-- Loading skeleton -->
    <CardGridSkeleton v-if="loading" :count="8" :cols="4" />

    <!-- Empty state -->
    <EmptyState v-else-if="filteredTables.length === 0" title="No tables found" description="Add your first table to get started.">
      <template #icon>
        <Icon name="lucide:armchair" class="h-6 w-6 text-gray-400" />
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          </template>
          Add Table
        </BaseButton>
      </template>
    </EmptyState>

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
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded bg-white/80 text-gray-600 shadow-sm hover:bg-white hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Edit table"
            @click="openEditModal(table)"
          >
            <Icon name="lucide:pencil" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded bg-white/80 text-gray-600 shadow-sm hover:bg-white hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Delete table"
            @click="openDeleteModal(table)"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" />
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
          <Icon name="lucide:receipt" class="h-4 w-4 text-gray-500" />
          <span class="font-medium">{{ orderLabel(table) }}</span>
        </div>

        <!-- Reservation chip (reserved) -->
        <div
          v-if="table.status === 'reserved' && reservationLabel(table)"
          class="mt-4 flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-gray-700"
        >
          <Icon name="lucide:calendar" class="h-4 w-4 text-gray-500" />
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
import type { Table, TableStatus } from '@restaurant-platform/types/table.types'

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
const toast = useToast()

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
    const name = tableToDelete.value.name || 'Table'
    try {
      await deleteTable(tableToDelete.value.id)
      toast.success(`${name} deleted`)
    } catch (e) {
      toast.error('Failed to delete table', e instanceof Error ? e.message : undefined)
    }
  }
  tableToDelete.value = null
}
const handleTableCreated = () => {
  toast.success(editingTable.value?.id ? 'Table updated' : 'Table created')
}

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
