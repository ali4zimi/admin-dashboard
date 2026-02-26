<template>
  <BaseModal v-model="isOpen" :title="isEditing ? 'Edit Reservation' : 'Add Reservation'">
    <form id="reservation-form" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Customer Name</label>
          <input v-model="form.customerName" type="text" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Phone</label>
          <input v-model="form.phone" type="text" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Party Size</label>
          <input v-model.number="form.partySize" type="number" min="1" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Table(s)</label>
          <input v-model="form.tableIds" type="text" placeholder="Comma separated table IDs" class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Start Time</label>
          <input v-model="form.startTime" type="datetime-local" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">End Time</label>
          <input v-model="form.endTime" type="datetime-local" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Status</label>
          <select v-model="form.status" required class="w-full rounded border px-3 py-2">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="seated">Seated</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-show</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Deposit Amount</label>
          <input v-model.number="form.depositAmount" type="number" min="0" class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Deposit Paid</label>
          <select v-model="form.depositPaid" class="w-full rounded border px-3 py-2">
            <option :value="true">Yes</option>
            <option :value="false">No</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Notes</label>
          <textarea v-model="form.notes" class="w-full rounded border px-3 py-2" />
        </div>
      </div>
    </form>
    <template #footer>
      <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50" @click="isOpen = false">Cancel</button>
      <button type="submit" form="reservation-form" :disabled="loading" class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEditing ? 'Update Reservation' : 'Create Reservation' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useReservations } from '~/composables/restaurant/useReservations'
import BaseModal from './BaseModal.vue'

const props = defineProps<{ modelValue: boolean, reservation?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createReservation, updateReservation } = useReservations()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.reservation?.id)

const form = ref({
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
})

watch(
  () => [props.modelValue, props.reservation],
  () => {
    if (props.modelValue && props.reservation) {
      form.value = {
        customerName: props.reservation.customerName,
        phone: props.reservation.phone || '',
        partySize: props.reservation.partySize || 1,
        tableIds: props.reservation.tableIds || [],
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
  loading.value = true
  try {
    // Convert tableIds from string to array if needed
    if (typeof form.value.tableIds === 'string') {
      form.value.tableIds = form.value.tableIds.split(',').map((id: string) => id.trim())
    }
    if (isEditing.value && props.reservation?.id) {
      await updateReservation(props.reservation.id, form.value)
    } else {
      await createReservation(form.value)
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
