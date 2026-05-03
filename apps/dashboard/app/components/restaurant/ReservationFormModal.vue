<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/60" @click="isOpen = false"></div>

        <Transition name="drawer-slide">
          <aside
            v-if="isOpen"
            class="absolute inset-0 h-full w-full bg-white shadow-2xl lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[640px]"
          >
            <div class="flex h-full flex-col">
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 lg:px-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ isEditing ? 'Edit Reservation' : 'New Reservation' }}</h3>
                  <p v-if="isEditing && props.reservation?.customerName" class="text-sm text-gray-500">{{ props.reservation.customerName }}</p>
                </div>
                <button
                  type="button"
                  class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  @click="isOpen = false"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form id="reservation-form" class="flex min-h-0 flex-1 flex-col" @submit.prevent="handleSubmit">
                <div class="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 lg:px-6">

                  <!-- Section: Customer -->
                  <section class="space-y-4">
                    <div>
                      <h4 class="text-base font-semibold text-gray-900">Customer</h4>
                      <p class="text-sm text-gray-500">Contact details for this reservation.</p>
                    </div>

                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Customer Name <span class="text-red-500">*</span></label>
                      <input
                        v-model="form.customerName"
                        type="text"
                        required
                        placeholder="Enter customer name"
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Phone Number <span class="text-red-500">*</span></label>
                        <input
                          v-model="form.phone"
                          type="tel"
                          required
                          placeholder="Enter phone number"
                          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Party Size <span class="text-red-500">*</span></label>
                        <input
                          v-model.number="form.partySize"
                          type="number"
                          min="1"
                          required
                          placeholder="Number of guests"
                          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </section>

                  <!-- Section: Details -->
                  <section class="space-y-4 border-t border-gray-100 pt-6">
                    <div>
                      <h4 class="text-base font-semibold text-gray-900">Reservation Details</h4>
                      <p class="text-sm text-gray-500">Select tables and time for this reservation.</p>
                    </div>

                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Table(s)</label>
                      <TableSelector
                        v-model="form.tableIds"
                        :items="availableTableOptions"
                        multiple
                        placeholder="Select table(s)"
                      />
                      <p class="mt-1 text-xs text-gray-500">Select one or more tables.</p>
                      <p v-if="availableTableOptions.length === 0" class="mt-1 text-xs text-amber-600">
                        No available tables found.
                      </p>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Start Time <span class="text-red-500">*</span></label>
                        <input
                          v-model="form.startTime"
                          type="datetime-local"
                          required
                          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">End Time <span class="text-red-500">*</span></label>
                        <input
                          v-model="form.endTime"
                          type="datetime-local"
                          required
                          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </section>

                  <!-- Section: Status & Payment -->
                  <section class="space-y-4 border-t border-gray-100 pt-6">
                    <div>
                      <h4 class="text-base font-semibold text-gray-900">Status & Payment</h4>
                      <p class="text-sm text-gray-500">Reservation status and deposit information.</p>
                    </div>

                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Status <span class="text-red-500">*</span></label>
                      <select
                        v-model="form.status"
                        required
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="seated">Seated</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-show</option>
                      </select>
                    </div>

                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Deposit Amount</label>
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            v-model.number="form.depositAmount"
                            type="number"
                            min="0"
                            placeholder="0.00"
                            class="w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label class="mb-1 block text-sm font-medium text-gray-700">Deposit Paid</label>
                        <select
                          v-model="form.depositPaid"
                          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option :value="true">Yes</option>
                          <option :value="false">No</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        v-model="form.notes"
                        rows="3"
                        placeholder="Any special requests or notes..."
                        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </section>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 lg:px-6">
                  <button
                    type="button"
                    class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    @click="isOpen = false"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading || !isFormValid"
                    class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {{ isEditing ? 'Update Reservation' : 'Create Reservation' }}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useReservations } from '~/composables/restaurant/useReservations'
import { useTablesStore } from '~/stores/tables.store'
import TableSelector from './TableSelector.vue'
import type { ReservationStatus } from '@restaurant-platform/types/reservation.types'

const props = defineProps<{ modelValue: boolean, reservation?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createReservation, updateReservation } = useReservations()
const tablesStore = useTablesStore()
const { tables } = storeToRefs(tablesStore)

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.reservation?.id)

const availableTableOptions = computed(() => {
  const selectedTableIds = new Set(form.value.tableIds)

  return tables.value
    .filter((table) => table.id && (table.status === 'available' || selectedTableIds.has(table.id)))
    .map((table) => ({
      id: table.id as string,
      name: table.name,
      capacity: table.capacity,
      status: table.status,
    }))
})

const normalizeTableIds = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((id) => String(id).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((id) => id.trim()).filter(Boolean)
  }
  return []
}

const form = ref({
  customerName: '',
  phone: '',
  partySize: 1,
  tableIds: [] as string[],
  startTime: '',
  endTime: '',
  status: 'pending' as ReservationStatus,
  depositAmount: 0,
  depositPaid: false,
  notes: '',
})

const isFormValid = computed(() => {
  return !!(
    form.value.customerName.trim() &&
    form.value.phone.trim() &&
    form.value.partySize >= 1 &&
    form.value.startTime &&
    form.value.endTime &&
    form.value.status
  )
})

watch(
  () => [props.modelValue, props.reservation],
  async () => {
    if (props.modelValue) {
      await tablesStore.fetchTables()
    }

    if (props.modelValue && props.reservation) {
      form.value = {
        customerName: props.reservation.customerName,
        phone: props.reservation.phone || '',
        partySize: props.reservation.partySize || 1,
        tableIds: normalizeTableIds(props.reservation.tableIds),
        startTime: props.reservation.startTime || '',
        endTime: props.reservation.endTime || '',
        status: props.reservation.status || 'pending',
        depositAmount: props.reservation.depositAmount || 0,
        depositPaid: props.reservation.depositPaid || false,
        notes: props.reservation.notes || '',
      }
    } else if (props.modelValue) {
      form.value = {
        customerName: '',
        phone: '',
        partySize: 1,
        tableIds: [],
        startTime: '',
        endTime: '',
        status: 'pending',
        depositAmount: 0,
        depositPaid: false,
        notes: '',
      }
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!isFormValid.value) return
  loading.value = true
  try {
    const reservationData = {
      ...form.value,
      tableIds: [...form.value.tableIds],
    }

    if (isEditing.value && props.reservation?.id) {
      await updateReservation(props.reservation.id, reservationData)
    } else {
      await createReservation(reservationData)
    }
    emit('saved')
    isOpen.value = false
  } catch (e) {
    console.error('Error saving reservation:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
