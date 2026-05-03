<template>
  <div>
    <PageHeader title="Reservations" description="Manage reservations for your restaurant." class="mb-6" />

    <!-- Search + Add button -->
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-sm">
        <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search by name or phone..."
          class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          v-if="searchTerm"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Clear search"
          @click="searchTerm = ''"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>

      <BaseButton variant="primary" @click="openAddModal">
        <template #icon-left>
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        </template>
        New Reservation
      </BaseButton>
    </div>

    <!-- Filter tabs -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        class="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        :class="filterStatus === tab.value
          ? 'border-blue-300 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'"
        @click="filterStatus = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <BaseSpinner />
    </div>

    <!-- Empty state -->
    <EmptyState v-else-if="filteredReservations.length === 0" title="No reservations found" description="Add your first reservation to get started.">
      <template #icon>
        <Icon name="lucide:calendar-days" class="h-6 w-6 text-gray-400" />
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          </template>
          New Reservation
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Reservation table -->
    <div v-else class="overflow-hidden rounded-xl bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">When</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Table</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Party Size</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="reservation in filteredReservations"
              :key="reservation.id"
              class="hover:bg-gray-50"
            >
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    :class="avatarColor(reservation.customerName)"
                  >
                    {{ initials(reservation.customerName) }}
                  </div>
                  <span class="font-medium text-gray-900">{{ reservation.customerName }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {{ formatDateTime(reservation.startTime) }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                <div v-if="reservationTableNames(reservation).length" class="flex flex-wrap gap-1">
                  <span
                    v-for="name in reservationTableNames(reservation)"
                    :key="`${reservation.id}-${name}`"
                    class="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {{ name }}
                  </span>
                </div>
                <span v-else class="italic text-gray-400">—</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {{ reservation.partySize || '—' }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {{ reservation.phone || '—' }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="statusBadgeClass(reservation.status)"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass(reservation.status)"></span>
                  {{ formatStatus(reservation.status) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <IconButton label="Edit reservation" tone="primary" @click="openEditModal(reservation)">
                    <Icon name="lucide:pencil" class="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Delete reservation" tone="danger" @click="openDeleteModal(reservation)">
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </IconButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
import ReservationFormModal from '~/components/restaurant/ReservationFormModal.vue'
import type { Reservation, ReservationStatus } from '@restaurant-platform/types/reservation.types'

useHead({
  title: 'Reservations - Admin Panel'
})

const {
  reservations,
  loading,
  fetchReservations,
  deleteReservation,
} = useReservations()

const { tables, fetchTables } = useTables()

const filterStatus = ref<ReservationStatus | ''>('')
const searchTerm = ref('')
const showReservationModal = ref(false)
const showDeleteModal = ref(false)
const reservationToDelete = ref<Reservation | null>(null)
const editingReservation = ref<Reservation | null>(null)

const statusTabs: { label: string; value: ReservationStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Seated', value: 'seated' },
  { label: 'Completed', value: 'completed' },
]

const filteredReservations = computed(() => {
  let items = reservations.value
  if (filterStatus.value) {
    items = items.filter(r => r.status === filterStatus.value)
  }
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase().trim()
    items = items.filter(r =>
      r.customerName.toLowerCase().includes(term) ||
      r.phone.toLowerCase().includes(term)
    )
  }
  return items
})

const tableNameById = computed(() =>
  tables.value.reduce((acc, t) => {
    if (t.id) acc[t.id] = t.name
    return acc
  }, {} as Record<string, string>)
)

const openDeleteModal = (reservation: Reservation) => {
  reservationToDelete.value = reservation
  showDeleteModal.value = true
}
const openEditModal = (reservation: Reservation) => {
  editingReservation.value = { ...reservation }
  showReservationModal.value = true
}
const openAddModal = () => {
  editingReservation.value = null
  showReservationModal.value = true
}
const handleReservationDeleted = async () => {
  if (reservationToDelete.value?.id) {
    await deleteReservation(reservationToDelete.value.id)
  }
  reservationToDelete.value = null
}
const handleReservationCreated = async () => {}

onMounted(async () => {
  await Promise.all([fetchReservations(), fetchTables()])
})

function reservationTableNames(r: Reservation): string[] {
  return (r.tableIds || [])
    .map(id => tableNameById.value[id])
    .filter((name): name is string => Boolean(name))
}

function formatDateTime(value: any): string {
  if (!value) return ''
  let date: Date
  if (value?.toDate) date = value.toDate()
  else if (value instanceof Date) date = value
  else date = new Date(value)
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (isSameDay) return `Today, ${time}`
  if (isTomorrow) return `Tomorrow, ${time}`
  const datePart = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  return `${datePart}, ${time}`
}

// Avatar helpers
function initials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() || '').join('')
}

const avatarPalette = [
  'bg-orange-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
]

function avatarColor(name: string): string {
  if (!name) return 'bg-gray-400'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return avatarPalette[Math.abs(hash) % avatarPalette.length]!
}

// Status helpers
function formatStatus(status: string): string {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-green-50 text-green-700'
    case 'pending':   return 'bg-amber-50 text-amber-700'
    case 'seated':    return 'bg-blue-50 text-blue-700'
    case 'completed': return 'bg-gray-100 text-gray-700'
    case 'cancelled': return 'bg-red-50 text-red-700'
    case 'no-show':   return 'bg-orange-50 text-orange-700'
    default:          return 'bg-gray-100 text-gray-700'
  }
}

function statusDotClass(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-green-500'
    case 'pending':   return 'bg-amber-500'
    case 'seated':    return 'bg-blue-500'
    case 'completed': return 'bg-gray-400'
    case 'cancelled': return 'bg-red-500'
    case 'no-show':   return 'bg-orange-500'
    default:          return 'bg-gray-400'
  }
}
</script>
