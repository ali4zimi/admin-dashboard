<template>
  <BaseWizardModal
    v-model="isOpen"
    v-model:current-step="currentStep"
    :title="isEditing ? 'Edit Reservation' : 'Add Reservation'"
    :steps="wizardSteps"
    :loading="loading"
    :submit-label="isEditing ? 'Update Reservation' : 'Create Reservation'"
    :can-proceed="canProceedToNextStep"
    @submit="handleSubmit"
  >
    <!-- Step 1: Customer Information -->
    <template #step-0>
      <div class="space-y-4">
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900">Customer Information</h4>
          <p class="text-sm text-gray-500">Enter the customer's contact details.</p>
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
    </template>

    <!-- Step 2: Reservation Details -->
    <template #step-1>
      <div class="space-y-4">
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900">Reservation Details</h4>
          <p class="text-sm text-gray-500">Set the table and time for this reservation.</p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Table(s)</label>
          <input
            v-model="form.tableIds"
            type="text"
            placeholder="e.g., T1, T2 (comma separated)"
            class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">Enter table IDs separated by commas</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
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
      </div>
    </template>

    <!-- Step 3: Status & Payment -->
    <template #step-2>
      <div class="space-y-4">
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900">Status & Payment</h4>
          <p class="text-sm text-gray-500">Set the reservation status and deposit information.</p>
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

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Deposit Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                v-model.number="form.depositAmount"
                type="number"
                min="0"
                placeholder="0.00"
                class="w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      </div>
    </template>
  </BaseWizardModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useReservations } from '~/composables/restaurant/useReservations'
import BaseWizardModal from './BaseWizardModal.vue'
import type { WizardStep } from './BaseWizardModal.vue'

const props = defineProps<{ modelValue: boolean, reservation?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createReservation, updateReservation } = useReservations()

const loading = ref(false)
const currentStep = ref(0)

const wizardSteps: WizardStep[] = [
  { title: 'Customer', description: 'Customer information' },
  { title: 'Details', description: 'Reservation details' },
  { title: 'Status', description: 'Status & payment' },
]

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.reservation?.id)

// Validation for each step
const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 0:
      // Customer info: name, phone, party size required
      return !!(form.value.customerName.trim() && form.value.phone.trim() && form.value.partySize >= 1)
    case 1:
      // Reservation details: start and end time required
      return !!(form.value.startTime && form.value.endTime)
    case 2:
      // Status: status required (always has default)
      return !!form.value.status
    default:
      return true
  }
})

const form = ref({
  customerName: '',
  phone: '',
  partySize: 1,
  tableIds: '' as string,
  startTime: '',
  endTime: '',
  status: 'pending',
  depositAmount: 0,
  depositPaid: false,
  notes: '',
})

watch(
  () => [props.modelValue, props.reservation],
  () => {
    if (props.modelValue && props.reservation) {
      // Reset to first step when opening for edit
      currentStep.value = 0
      // Handle tableIds - convert array to comma-separated string for display
      const tableIdsValue = props.reservation.tableIds
      const tableIdsString = Array.isArray(tableIdsValue) ? tableIdsValue.join(', ') : (tableIdsValue || '')
      
      form.value = {
        customerName: props.reservation.customerName,
        phone: props.reservation.phone || '',
        partySize: props.reservation.partySize || 1,
        tableIds: tableIdsString,
        startTime: props.reservation.startTime || '',
        endTime: props.reservation.endTime || '',
        status: props.reservation.status || 'pending',
        depositAmount: props.reservation.depositAmount || 0,
        depositPaid: props.reservation.depositPaid || false,
        notes: props.reservation.notes || '',
      }
    } else if (props.modelValue) {
      // Reset to first step when opening for new
      currentStep.value = 0
      form.value = {
        customerName: '',
        phone: '',
        partySize: 1,
        tableIds: '',
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
  loading.value = true
  try {
    // Prepare data - convert tableIds string to array
    const tableIdsArray = form.value.tableIds
      ? form.value.tableIds.split(',').map((id: string) => id.trim()).filter(Boolean)
      : []
    
    const reservationData = {
      ...form.value,
      tableIds: tableIdsArray,
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
