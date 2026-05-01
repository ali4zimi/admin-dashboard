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
              <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 lg:px-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ isEditing ? 'Edit Order' : 'Add Order' }}</h3>
                  <p v-if="isEditing && props.order?.orderNumber" class="text-sm text-gray-500">Order: {{ props.order.orderNumber }}</p>
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

              <form id="order-form" class="flex min-h-0 flex-1 flex-col" @submit.prevent="handleSubmit">
                <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 lg:px-6">
                  <div>
                    <label class="mb-1 block font-medium">Table</label>
                    <TableSelector v-model="selectedTableIds" :items="tables" multiple />
                  </div>

                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label class="mb-1 block font-medium">Order Type</label>
                      <select v-model="form.orderType" required class="w-full rounded border px-3 py-2">
                        <option value="dine-in">Dine-in</option>
                        <option value="takeaway">Takeaway</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>
                    <div>
                      <label class="mb-1 block font-medium">Status</label>
                      <select v-model="form.status" required class="w-full rounded border px-3 py-2">
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="served">Served</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div class="mb-2 flex items-center justify-between">
                      <label class="block font-medium">Order Items</label>
                    </div>

                    <p v-if="showItemsValidation" class="mb-2 text-sm text-red-600">
                      Add at least one item to place the order.
                    </p>

                    <div class="space-y-3">
                      <div v-for="(item, idx) in form.items" :key="idx" class="rounded-lg border border-gray-200 p-3">
                        <div class="grid grid-cols-1 gap-2 md:grid-cols-12">
                          <MenuItemSelector
                            v-model="item.itemId"
                            :items="menuItems"
                            class="md:col-span-5"
                            @update:modelValue="onMenuItemChange(idx, $event)"
                          />
                          <input v-model.number="item.quantity" type="number" min="1" placeholder="Qty" class="rounded border px-2 py-1 md:col-span-2" />
                          <input v-model="item.notes" type="text" placeholder="Notes" class="rounded border px-2 py-1 md:col-span-3" />
                          <select v-model="item.status" class="rounded border px-2 py-1 md:col-span-2">
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="served">Served</option>
                          </select>
                        </div>
                        <div class="mt-2 flex items-center justify-between">
                          <div v-if="item.name" class="text-xs text-gray-500">
                            <span>Name: {{ item.name }}</span>
                            <span class="ml-2">Price: {{ formatCurrency(item.price) }}</span>
                          </div>
                          <button type="button" class="ml-auto text-sm text-red-500 hover:text-red-700" @click="removeItem(idx)">Remove</button>
                        </div>
                      </div>

                      <p v-if="form.items.length === 0" class="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                        No items added yet.
                      </p>

                      <div class="pt-1">
                        <button type="button" class="rounded bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200" @click="addItem">
                          Add Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 lg:px-6">
                  <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50" @click="isOpen = false">Cancel</button>
                  <button type="submit" :disabled="loading || !hasAtLeastOneValidItem" class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {{ isEditing ? 'Update Order' : 'Create Order' }} · {{ formatCurrency(calculatedTotalAmount) }}
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
import { useOrders } from '~/composables/restaurant/useOrders'
import { useMenu } from '~/composables/restaurant/useMenu'
import { useRestaurantSettings } from '~/composables/useRestaurantSettings'
import { useTables, type Table } from '~/composables/restaurant/useTables'
import type {
  OrderItemStatus,
  OrderStatus,
  OrderType,
  CreateOrderData,
  UpdateOrderData,
} from '@restaurant-platform/types/order.types'
import MenuItemSelector from './MenuItemSelector.vue'
import TableSelector from './TableSelector.vue'
const { tables, fetchTables } = useTables()

const props = defineProps<{ modelValue: boolean, order?: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { createOrder, updateOrder } = useOrders()
const { fetchMenuItems, menuItems } = useMenu()
const { formatCurrency, loadRestaurantSettings } = useRestaurantSettings()

const loading = ref(false)
const showItemsValidation = ref(false)

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
  status: OrderItemStatus
}

interface OrderForm {
  table: Table
  tableIds?: string[]
  status: OrderStatus
  orderType: OrderType
  totalAmount: number
  items: OrderItem[]
}

const form = ref<OrderForm>({
  table: { id: '', name: '', capacity: 0, status: 'available', currentOrderId: '', currentReservationId: '' },
  tableIds: [],
  status: 'pending',
  orderType: 'dine-in',
  totalAmount: 0,
  items: [],
})

const emptyTable: Table = {
  id: '',
  name: '',
  capacity: 0,
  status: 'available',
  currentOrderId: '',
  currentReservationId: '',
}

const selectedTableIds = computed({
  get: () => form.value.tableIds || [],
  set: (tableIds: string[]) => {
    const filteredIds = tableIds.filter(Boolean)
    form.value.tableIds = filteredIds

    const primaryId = filteredIds[0]
    const selected = tables.value.find((table) => table.id === primaryId)
    form.value.table = selected ? { ...selected } : { ...emptyTable }
  },
})

const hasAtLeastOneValidItem = computed(() => {
  return form.value.items.some((item) => !!item.itemId && Number(item.quantity) > 0)
})

const calculatedTotalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    return sum + (quantity * price)
  }, 0)
})

watch(
  () => [props.modelValue, props.order],
  () => {
    showItemsValidation.value = false

    if (props.modelValue && props.order) {
      const existingTableIds = Array.isArray(props.order.tableIds)
        ? props.order.tableIds
        : props.order.table?.id
          ? [props.order.table.id]
          : []

      form.value = {
        table: props.order.table,
        tableIds: existingTableIds,
        status: props.order.status || 'pending',
        orderType: props.order.orderType || 'dine-in',
        totalAmount: props.order.totalAmount || 0,
        items: props.order.items ? props.order.items.map((i: any) => ({ ...i })) : [],
      }
    } else if (props.modelValue) {
      form.value = {
        table: { ...emptyTable },
        tableIds: [],
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
  showItemsValidation.value = false

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

  if (form.value.items.length > 0) {
    showItemsValidation.value = false
  }
}

const handleSubmit = async () => {
  if (!hasAtLeastOneValidItem.value) {
    showItemsValidation.value = true
    return
  }

  showItemsValidation.value = false
  loading.value = true

  try {
    const orderPayload = {
      ...form.value,
      totalAmount: calculatedTotalAmount.value,
      items: form.value.items,
    }

    if (isEditing.value && props.order?.id) {
      await updateOrder(props.order.id, orderPayload as UpdateOrderData)
    } else {
      await createOrder(orderPayload as CreateOrderData)
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

const onMenuItemChange = (idx: number, itemId?: string) => {
  const item = form.value.items[idx]
  if (!item) return

  if (itemId !== undefined) {
    item.itemId = itemId
  }

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

