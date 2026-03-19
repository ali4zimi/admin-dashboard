<template>
  <BaseModal v-model="isOpen" :title="isEditing ? 'Edit Order' : 'Add Order'">
    <form id="order-form" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block mb-1 font-medium">Table</label>
          <select v-model="form.table" required class="w-full rounded border px-3 py-2">
            <option value="" disabled>Select table</option>
            <option v-for="table in tables" :key="table.id" :value="table">
              {{ table.name }} (Capacity: {{ table.capacity }})
            </option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Order Type</label>
          <select v-model="form.orderType" required class="w-full rounded border px-3 py-2">
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Status</label>
          <select v-model="form.status" required class="w-full rounded border px-3 py-2">
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="served">Served</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Total Amount</label>
          <input v-model.number="form.totalAmount" type="number" min="0" required class="w-full rounded border px-3 py-2" />
        </div>
        <!-- Order Items (simple add/edit/remove) -->
        <div>
          <label class="block mb-1 font-medium">Order Items</label>
          <div v-for="(item, idx) in form.items" :key="idx" class="mb-2 flex flex-col gap-2 items-center">
            <div class="flex gap-2 items-center w-full">
              <select v-model="item.itemId" @change="onMenuItemChange(idx)" class="rounded border px-2 py-1 w-1/2">
                <option value="" disabled>Select menu item</option>
                <option v-for="menuItem in menuItems" :key="menuItem.id" :value="menuItem.id">
                  {{ menuItem.name }} ({{ formatCurrency(menuItem.price) }})
                </option>
              </select>
              <input v-model.number="item.quantity" type="number" min="1" placeholder="Qty" class="rounded border px-2 py-1 w-1/6" />
              <input v-model="item.notes" type="text" placeholder="Notes" class="rounded border px-2 py-1 w-1/4" />
              <select v-model="item.status" class="rounded border px-2 py-1 w-1/6">
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
              </select>
              <button type="button" class="text-red-500 hover:text-red-700" @click="removeItem(idx)">x</button>
            </div>
            <div class="flex gap-2 items-center w-full text-xs text-gray-500" v-if="item.name">
              <span>Name: {{ item.name }}</span>
              <span>Price: {{ formatCurrency(item.price) }}</span>
            </div>
          </div>
          <button type="button" class="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 mt-2" @click="addItem">Add Item</button>
        </div>
      </div>
    </form>
    <template #footer>
      <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50" @click="isOpen = false">Cancel</button>
      <button type="submit" form="order-form" :disabled="loading" class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEditing ? 'Update Order' : 'Create Order' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useOrders } from '~/composables/restaurant/useOrders'
import { useMenu } from '~/composables/restaurant/useMenu'
import { useRestaurantSettings } from '~/composables/useRestaurantSettings'
import { useTables, type Table } from '~/composables/restaurant/useTables'
const { tables, fetchTables } = useTables()
import BaseModal from './BaseModal.vue'

const props = defineProps<{ modelValue: boolean, order?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createOrder, updateOrder } = useOrders()
const { fetchMenuItems, menuItems } = useMenu()
const { formatCurrency, loadRestaurantSettings } = useRestaurantSettings()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.order?.id)

interface OrderItem {
  itemId: string
  name: string
  price: number
  quantity: number
  notes: string
  status: string
}

interface OrderForm {
  table: Table
  status: string
  orderType: string
  totalAmount: number
  items: OrderItem[]
}

const form = ref<OrderForm>({
  table: { id: '', name: '', capacity: 0, status: 'available', currentOrderId: '', currentReservationId: '' },
  status: 'pending',
  orderType: 'dine-in',
  totalAmount: 0,
  items: [],
})

watch(
  () => [props.modelValue, props.order],
  () => {
    if (props.modelValue && props.order) {
      form.value = {
        table: props.order.table,
        status: props.order.status || 'pending',
        orderType: props.order.orderType || 'dine-in',
        totalAmount: props.order.totalAmount || 0,
        items: props.order.items ? props.order.items.map((i: any) => ({ ...i })) : [],
      }
    } else if (props.modelValue) {
      form.value = {
        table: { id: '', name: '', capacity: 0, status: 'available', currentOrderId: '', currentReservationId: '' },
        status: 'pending',
        orderType: 'dine-in',
        totalAmount: 0,
        items: [],
      }
    }
  },
  { immediate: true }
)

const addItem = () => {
  form.value.items.push({
    itemId: '',
    name: '',
    price: 0,
    quantity: 1,
    notes: '',
    status: 'pending',
  })
}
const removeItem = (idx: number) => {
  form.value.items.splice(idx, 1)
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditing.value && props.order?.id) {
      await updateOrder(props.order.id, form.value)
    } else {
      await createOrder(form.value)
    }
    emit('saved')
    isOpen.value = false
  } catch (e) {
    console.error('Error saving order:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRestaurantSettings()
  fetchMenuItems()
  fetchTables()
})

const onMenuItemChange = (idx: number) => {
  const item = form.value.items[idx]
  const menuItem = menuItems.value.find(m => m.id === item.itemId)
  if (menuItem) {
    item.name = menuItem.name
    item.price = menuItem.price
  } else {
    item.name = ''
    item.price = 0
  }
}
</script>

