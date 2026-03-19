<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Order Management</h1>
        <p class="text-gray-600">Manage restaurant orders and their items.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="openAddModal"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Order
        </button>
      </div>
    </div>

    <!-- Filter/Search -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-2">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search orders..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="served">Served</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
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
    <div v-else-if="filteredOrders.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-gray-900">No orders found</h3>
      <p class="mb-4 text-sm text-gray-500">Add your first order to get started.</p>
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openAddModal"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Order
      </button>
    </div>

    <!-- Order grid view -->
    <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="p-3">
          <p class="truncate text-sm font-medium text-gray-900">Table: {{ order.table.name }}</p>
          <div class="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Type: {{ order.orderType }}</span>
            <span>Status: {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Total: {{ formatCurrency(order.totalAmount) }}</span>
            <span>Items: {{ order.items?.length || 0 }}</span>
          </div>
          <div class="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="flex-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
              @click="openEditModal(order)"
            >
              Edit
            </button>
            <button
              class="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
              @click="openDeleteModal(order)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results info -->
    <div v-if="filteredOrders.length > 0" class="mt-6 text-center">
      <p class="text-sm text-gray-500">Showing {{ filteredOrders.length }} orders</p>
    </div>

    <!-- Order Modal -->
    <OrderFormModal
      v-model="showOrderModal"
      :order="editingOrder"
      @saved="handleOrderCreated"
    />

    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="orderToDelete?.id || null"
      :item-name="orderToDelete?.table?.name || ''"
      item-type="Order"
      @confirm="handleOrderDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { useOrders } from '~/composables/restaurant/useOrders'
import { useRestaurantSettings } from '~/composables/useRestaurantSettings'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'
import OrderFormModal from '~/components/OrderFormModal.vue'

useHead({
  title: 'Order Management - Admin Panel'
})

const {
  orders,
  loading,
  fetchOrders,
  deleteOrder,
} = useOrders()

const { formatCurrency, loadRestaurantSettings } = useRestaurantSettings()

const searchTerm = ref('')
const filterStatus = ref('')
const showOrderModal = ref(false)
const showDeleteModal = ref(false)
const orderToDelete = ref<any | null>(null)
const editingOrder = ref<any | null>(null)

const filteredOrders = computed(() => {
  let items = orders.value
  if (searchTerm.value) {
    const lowerTerm = searchTerm.value.toLowerCase()
    items = items.filter(order =>
      (order.table?.name || '').toLowerCase().includes(lowerTerm)
    )
  }
  if (filterStatus.value) {
    items = items.filter(order => order.status === filterStatus.value)
  }
  return items
})

const openDeleteModal = (order: any) => {
  orderToDelete.value = order
  showDeleteModal.value = true
}
const openEditModal = (order: any) => {
  editingOrder.value = { ...order }
  showOrderModal.value = true
}
const openAddModal = () => {
  editingOrder.value = null
  showOrderModal.value = true
}
const handleOrderDeleted = async () => {
  if (orderToDelete.value) {
    await deleteOrder(orderToDelete.value.id)
    await fetchOrders()
  }
  orderToDelete.value = null
}
const handleOrderCreated = async () => {
  await fetchOrders()
}
onMounted(async () => {
  await loadRestaurantSettings()
  await fetchOrders()
})
</script>
