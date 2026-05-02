<template>
  <div>
    <PageHeader title="Order Management" description="Manage restaurant orders and their items.">
      <template #actions>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </template>
          Add Order
        </BaseButton>
      </template>
    </PageHeader>

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
      <BaseSpinner />
    </div>

    <!-- Empty state -->
    <EmptyState v-else-if="filteredOrders.length === 0" title="No orders found" description="Add your first order to get started.">
      <template #icon>
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
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
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6a2 2 0 012.828 2.828l-6 6a2 2 0 01-2.828-2.828z" />
                    </svg>
                  </IconButton>
                  <IconButton label="Delete order" tone="danger" @click="openDeleteModal(order)">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
