<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reservation Management</h1>
        <p class="text-gray-600">Manage reservations for your restaurant.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="openAddModal"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Reservation
        </button>
      </div>
    </div>

    <!-- Filter/Search -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-2">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search reservations..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="seated">Seated</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-show</option>
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
    <div v-else-if="filteredReservations.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-gray-900">No reservations found</h3>
      <p class="mb-4 text-sm text-gray-500">Add your first reservation to get started.</p>
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openAddModal"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Reservation
      </button>
    </div>

    <!-- Reservation list view -->
    <!-- Menu list view -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Table</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="reservation in filteredReservations" :key="reservation.id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span class="ml-3 text-sm font-medium text-gray-900">{{ reservation.customerName }}</span>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ reservation.customerName }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                <div v-if="reservation.tableIds && reservation.tableIds.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="tableName in getReservationTableNames(reservation.tableIds)"
                    :key="`${reservation.id}-${tableName}`"
                    class="inline-flex items-center rounded px-2 py-0.5 font-semibold bg-blue-100 text-blue-800"
                  >
                    {{ tableName }}
                  </span>
                </div>
                <span v-else class="text-gray-400 italic">No table assigned</span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <div class="flex justify-end space-x-2">
                <button
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                  @click="openEditModal(reservation)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6a2 2 0 012.828 2.828l-6 6a2 2 0 01-2.828-2.828z" />
                  </svg>
                </button>
                <button
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  @click="openDeleteModal(reservation)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    <!-- Results info -->
    <div v-if="filteredReservations.length > 0" class="mt-6 text-center">
      <p class="text-sm text-gray-500">Showing {{ filteredReservations.length }} reservations</p>
    </div>

    <!-- Reservation Modal -->
    <ReservationFormModal
      v-model="showReservationModal"
      :reservation="editingReservation"
      @saved="handleReservationCreated"
    />

    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="reservationToDelete?.id || null"
      :item-name="reservationToDelete?.customerName || ''"
      item-type="Reservation"
      @confirm="handleReservationDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { useReservations } from '~/composables/restaurant/useReservations'
import { useTables } from '~/composables/restaurant/useTables'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'
import ReservationFormModal from '~/components/ReservationFormModal.vue'

useHead({
  title: 'Reservation Management - Admin Panel'
})

const {
  reservations,
  loading,
  fetchReservations,
  deleteReservation,
} = useReservations()

const {
  tables,
  fetchTables,
} = useTables()

const searchTerm = ref('')
const filterStatus = ref('')
const showReservationModal = ref(false)
const showDeleteModal = ref(false)
const reservationToDelete = ref<any | null>(null)
const editingReservation = ref<any | null>(null)

const filteredReservations = computed(() => {
  let items = reservations.value
  if (searchTerm.value) {
    const lowerTerm = searchTerm.value.toLowerCase()
    items = items.filter(reservation =>
      reservation.customerName.toLowerCase().includes(lowerTerm) ||
      reservation.phone.toLowerCase().includes(lowerTerm)
    )
  }
  if (filterStatus.value) {
    items = items.filter(reservation => reservation.status === filterStatus.value)
  }
  return items
})

const tableNameById = computed(() => {
  return tables.value.reduce((acc, table) => {
    if (table.id) {
      acc[table.id] = table.name
    }
    return acc
  }, {} as Record<string, string>)
})

const getReservationTableNames = (tableIds: string[] = []) => {
  return tableIds
    .map((tableId) => tableNameById.value[tableId] || tableId)
}

const formatDate = (date: any) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const openDeleteModal = (reservation: any) => {
  reservationToDelete.value = reservation
  showDeleteModal.value = true
}
const openEditModal = (reservation: any) => {
  editingReservation.value = { ...reservation }
  showReservationModal.value = true
}
const openAddModal = () => {
  editingReservation.value = null
  showReservationModal.value = true
}
const handleReservationDeleted = async () => {
  if (reservationToDelete.value) {
    await deleteReservation(reservationToDelete.value.id)
    await fetchReservations()
  }
  reservationToDelete.value = null
}
const handleReservationCreated = async () => {
  await fetchReservations()
}
onMounted(async () => {
  await Promise.all([fetchReservations(), fetchTables()])
})
</script>
