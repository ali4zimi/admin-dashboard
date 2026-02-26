<template>
  <BaseModal v-model="isOpen" :title="isEditing ? 'Edit Table' : 'Add Table'">
    <form id="table-form" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Name</label>
          <input v-model="form.name" type="text" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Capacity</label>
          <input v-model.number="form.capacity" type="number" min="1" required class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Status</label>
          <select v-model="form.status" required class="w-full rounded border px-3 py-2">
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Current Order ID</label>
          <input v-model="form.currentOrderId" type="text" class="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1 font-medium">Current Reservation ID</label>
          <input v-model="form.currentReservationId" type="text" class="w-full rounded border px-3 py-2" />
        </div>
      </div>
    </form>
    <template #footer>
      <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50" @click="isOpen = false">Cancel</button>
      <button type="submit" form="table-form" :disabled="loading" class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEditing ? 'Update Table' : 'Create Table' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useTables } from '~/composables/restaurant/useTables'
import BaseModal from './BaseModal.vue'

const props = defineProps<{ modelValue: boolean, table?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createTable, updateTable } = useTables()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.table?.id)

const form = ref({
  name: '',
  capacity: 1,
  status: 'available',
  currentOrderId: '',
  currentReservationId: '',
})

watch(
  () => [props.modelValue, props.table],
  () => {
    if (props.modelValue && props.table) {
      form.value = {
        name: props.table.name,
        capacity: props.table.capacity || 1,
        status: props.table.status || 'available',
        currentOrderId: props.table.currentOrderId || '',
        currentReservationId: props.table.currentReservationId || '',
      }
    } else if (props.modelValue) {
      form.value = {
        name: '',
        capacity: 1,
        status: 'available',
        currentOrderId: '',
        currentReservationId: '',
      }
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditing.value && props.table?.id) {
      await updateTable(props.table.id, form.value)
    } else {
      await createTable(form.value)
    }
    emit('saved')
    isOpen.value = false
  } catch (e) {
    console.error('Error saving table:', e)
  } finally {
    loading.value = false
  }
}
</script>
