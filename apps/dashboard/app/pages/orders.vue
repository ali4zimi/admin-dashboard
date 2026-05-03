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

    <BaseDataTable
      :columns="columns"
      :data="filteredOrders"
      :loading="loading"
      :row-key="(o) => o.id ?? ''"
      empty-title="No orders found"
      empty-description="Adjust the filter or add your first order."
    />

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
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useOrders } from '~/composables/restaurant/useOrders'
import { useRestaurantSettings } from '~/composables/useRestaurantSettings'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'
import OrderFormModal from '~/components/restaurant/OrderFormModal.vue'
import BaseBadge from '~/components/base/BaseBadge.vue'
import IconButton from '~/components/base/IconButton.vue'
import { Icon } from '#components'

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
const toast = useToast()

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
    const label = orderToDelete.value.orderNumber || orderToDelete.value.table?.name || 'Order'
    try {
      await deleteOrder(orderToDelete.value.id)
      await fetchOrders()
      toast.success(`Order ${label} deleted`)
    } catch (e) {
      toast.error('Failed to delete order', e instanceof Error ? e.message : undefined)
    }
  }
  orderToDelete.value = null
}
const handleOrderCreated = async () => {
  await fetchOrders()
  toast.success(editingOrder.value?.id ? 'Order updated' : 'Order created')
}
const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order #',
    cell: ({ getValue }) => h('span', { class: 'text-sm font-medium text-blue-600' }, String(getValue() || 'N/A')),
  },
  {
    id: 'table',
    header: 'Table',
    accessorFn: (row) => row.table?.name ?? '',
    cell: ({ row }) => h('span', { class: 'text-sm font-medium text-gray-900' }, row.original.table?.name || 'N/A'),
  },
  {
    accessorKey: 'orderType',
    header: 'Type',
    cell: ({ getValue }) => h('span', { class: 'text-sm text-gray-500' }, String(getValue() || '')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        BaseBadge as any,
        { color: orderStatusColor(row.original.status) },
        () => row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1),
      ),
  },
  {
    id: 'items',
    header: 'Items',
    enableSorting: false,
    cell: ({ row }) => {
      const items = row.original.items
      if (!items?.length) return h('span', { class: 'text-sm text-gray-400 italic' }, 'No items')
      return h(
        'div',
        { class: 'flex flex-wrap gap-2' },
        items.map((item: any, idx: number) =>
          h(
            'div',
            {
              key: `item-${item.itemId || idx}-${idx}`,
              class: 'inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700',
            },
            `${item.quantity} x ${item.name || 'Unknown item'}`,
          ),
        ),
      )
    },
  },
  {
    id: 'total',
    header: 'Total',
    accessorFn: (row) => getOrderTotal(row),
    cell: ({ row }) => h('span', { class: 'text-sm font-medium text-gray-900' }, formatCurrency(getOrderTotal(row.original))),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { align: 'right' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end space-x-2' }, [
        h(
          IconButton as any,
          { label: 'Edit order', tone: 'primary', onClick: () => openEditModal(row.original) },
          () => h(Icon as any, { name: 'lucide:pencil', class: 'h-5 w-5' }),
        ),
        h(
          IconButton as any,
          { label: 'Delete order', tone: 'danger', onClick: () => openDeleteModal(row.original) },
          () => h(Icon as any, { name: 'lucide:trash-2', class: 'h-5 w-5' }),
        ),
      ]),
  },
]

onMounted(async () => {
  await loadRestaurantSettings()
  await fetchOrders()
})
</script>
