<template>
  <div>
    <PageHeader title="Order Management" description="Manage restaurant orders and their items.">
      <template #actions>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          </template>
          Add Order
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Status filter chips -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        type="button"
        :aria-pressed="filterStatus === opt.value"
        :class="[
          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
          filterStatus === opt.value
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        ]"
        @click="filterStatus = opt.value"
      >
        <span v-if="opt.value" class="h-2 w-2 rounded-full" :class="opt.dot" />
        {{ opt.label }}
        <span class="text-xs text-gray-400">{{ statusCount(opt.value) }}</span>
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="relative flex-1">
        <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <label for="orders-search" class="sr-only">Search orders</label>
        <input
          id="orders-search"
          v-model="searchTerm"
          type="text"
          placeholder="Search by table or order #..."
          class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <BaseSpinner />
    </div>

    <!-- Empty state -->
    <EmptyState v-else-if="filteredOrders.length === 0" title="No orders found" description="Add your first order to get started.">
      <template #icon>
        <Icon name="lucide:shopping-bag" class="h-6 w-6 text-gray-400" />
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          </template>
          Add Order
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Order list view -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
        <table class="min-w-full table-fixed divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-24 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order #</th>
              <th class="w-28 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Table</th>
              <th class="w-24 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
              <th class="w-28 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="w-[38%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Items</th>
              <th class="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
              <th class="w-24 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 align-top">
                <span class="text-sm font-medium text-blue-600">{{ order.orderNumber || 'N/A' }}</span>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ order.table?.name || 'N/A' }}</span>
                </div>
              </td>
              <td class="px-4 py-4 align-top text-sm text-gray-500">{{ order.orderType }}</td>
              <td class="px-4 py-4 align-top">
                <BaseBadge :color="orderStatusColor(order.status)">
                  {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                </BaseBadge>
              </td>
              <td class="px-4 py-4 align-top text-sm text-gray-500">
                <div v-if="order.items && order.items.length > 0" class="flex flex-wrap gap-2">
                  <div
                    v-for="(item, index) in order.items"
                    :key="`${order.id || 'order'}-item-${item.itemId || index}-${index}`"
                    class="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    {{ item.quantity }} x {{ item.name || 'Unknown item' }}
                  </div>
                </div>
                <span v-else class="text-gray-400 italic">No items</span>
              </td>
              <td class="px-4 py-4 align-top text-sm font-medium text-gray-900">{{ formatCurrency(getOrderTotal(order)) }}</td>
              <td class="px-4 py-4 align-top text-right text-sm">
                <div class="flex justify-end space-x-2">
                  <IconButton label="Edit order" tone="primary" @click="openEditModal(order)">
                    <Icon name="lucide:pencil" class="h-5 w-5" />
                  </IconButton>
                  <IconButton label="Delete order" tone="danger" @click="openDeleteModal(order)">
                    <Icon name="lucide:trash-2" class="h-5 w-5" />
                  </IconButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
import OrderFormModal from '~/components/restaurant/OrderFormModal.vue'

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

const statusOptions: { value: string; label: string; dot: string }[] = [
  { value: '', label: 'All', dot: '' },
  { value: 'pending', label: 'Pending', dot: 'bg-yellow-500' },
  { value: 'preparing', label: 'Preparing', dot: 'bg-blue-500' },
  { value: 'served', label: 'Served', dot: 'bg-green-500' },
  { value: 'paid', label: 'Paid', dot: 'bg-purple-500' },
  { value: 'cancelled', label: 'Cancelled', dot: 'bg-red-500' },
]

const statusCount = (value: string) => {
  if (!value) return orders.value.length
  return orders.value.filter((o: any) => o.status === value).length
}

const orderStatusColor = (status: string) => {
  const map: Record<string, 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'gray'> = {
    pending: 'yellow',
    preparing: 'blue',
    served: 'green',
    paid: 'purple',
    cancelled: 'red',
  }
  return map[status] ?? 'gray'
}

const getOrderTotal = (order: any) => {
  if (order?.items && order.items.length > 0) {
    return order.items.reduce((sum: number, item: any) => {
      const price = Number(item?.price || 0)
      const qty = Number(item?.quantity || 0)
      return sum + price * qty
    }, 0)
  }

  return Number(order?.totalAmount || 0)
}

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
