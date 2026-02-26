<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Menu Management</h1>
        <p class="text-gray-600">Manage menu items and categories.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="showItemModal = true"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Menu Item
        </button>
        <button
          class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          @click="showCategoryManager = true"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Manage Categories
        </button>
      </div>
    </div>

    <!-- Category filter -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-2">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search menu items..."
          class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="handleSearch"
        />
        <select
          v-model="filterCategory"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option value="">All Categories</option>
          <option v-for="cat in menuCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button
          :class="['rounded-lg p-2 transition-colors', viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100']"
          @click="viewMode = 'grid'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          :class="['rounded-lg p-2 transition-colors', viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100']"
          @click="viewMode = 'list'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
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
    <div v-else-if="filteredMenuItems.length === 0" class="rounded-lg bg-white p-12 text-center shadow-sm">
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-gray-900">No menu items found</h3>
      <p class="mb-4 text-sm text-gray-500">Add your first menu item to get started.</p>
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="showItemModal = true"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Menu Item
      </button>
    </div>

    <!-- Menu grid view -->
    <div v-else-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <div
        v-for="item in filteredMenuItems"
        :key="item.id"
        class="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div v-if="item.imageUrl" class="h-32 bg-cover bg-center" :style="{ backgroundImage: `url(${item.imageUrl})` }"></div>
        <div v-else class="flex h-32 items-center justify-center bg-gray-50">
          <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div class="p-3">
          <p class="truncate text-sm font-medium text-gray-900">{{ item.name }}</p>
          <div class="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{{ item.price | currency }}</span>
            <span>{{ formatDate(item.updatedAt) }}</span>
          </div>
          <div class="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="flex-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
              @click="openEditModal(item)"
            >
              Edit
            </button>
            <button
              class="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
              @click="openDeleteModal(item)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu list view -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Modified</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="item in filteredMenuItems" :key="item.id" class="hover:bg-gray-50">
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span class="ml-3 text-sm font-medium text-gray-900">{{ item.name }}</span>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ getCategoryName(item.categoryId) }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ item.price | currency }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ formatDate(item.updatedAt) }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <div class="flex justify-end space-x-2">
                <button
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                  @click="openEditModal(item)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6a2 2 0 012.828 2.828l-6 6a2 2 0 01-2.828-2.828z" />
                  </svg>
                </button>
                <button
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  @click="openDeleteModal(item)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Results info -->
    <div v-if="filteredMenuItems.length > 0" class="mt-6 text-center">
      <p class="text-sm text-gray-500">Showing {{ filteredMenuItems.length }} menu items</p>
    </div>

    <!-- Item Modal -->
    <MenuFormModal
      v-model="showItemModal"
      :menu-item="editingMenuItem"
      @saved="handleItemCreated"
    />
    <CategoryManagerModal
      v-model="showCategoryManager"
      :categories="menuCategories"
      @created="handleCategoryCreated"
      @updated="handleCategoryUpdated"
      @deleted="handleCategoryDeleted"
    />
    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="itemToDelete?.id || null"
      :item-name="itemToDelete?.name || ''"
      item-type="Menu Item"
      @confirm="handleItemDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { useMenu } from '~/composables/restaurant/useMenu'
import MenuFormModal from '~/components/MenuFormModal.vue'
import CategoryManagerModal from '~/components/CategoryManagerModal.vue'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'

useHead({
  title: 'Menu Management - Admin Panel'
})

const {
  menuItems,
  menuCategories,
  loading,
  fetchMenuItems,
  fetchMenuCategories,
  deleteMenuItem,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} = useMenu()

const viewMode = ref<'grid' | 'list'>('grid')
const searchTerm = ref('')
const filterCategory = ref('')
const showItemModal = ref(false)
const showCategoryManager = ref(false)
const showDeleteModal = ref(false)
const itemToDelete = ref<any | null>(null)
const editingMenuItem = ref<any | null>(null)

const filteredMenuItems = computed(() => {
  let items = menuItems.value
  if (searchTerm.value) {
    const lowerTerm = searchTerm.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(lowerTerm) ||
      (item.description && item.description.toLowerCase().includes(lowerTerm))
    )
  }
  if (filterCategory.value) {
    items = items.filter(item => item.categoryId === filterCategory.value)
  }
  return items
})

const handleSearch = () => {}
const formatDate = (date: any) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
const getCategoryName = (categoryId: string) => {
  const cat = menuCategories.value.find(c => c.id === categoryId)
  return cat ? cat.name : 'Uncategorized'
}
const openDeleteModal = (item: any) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}
const openEditModal = (item: any) => {
  editingMenuItem.value = { ...item }
  showItemModal.value = true
}
const handleItemDeleted = async () => {
  if (itemToDelete.value) {
    await deleteMenuItem(itemToDelete.value.id)
    await fetchMenuItems()
  }
  itemToDelete.value = null
}
const handleItemCreated = async () => {
  await fetchMenuItems()
}
const handleItemUpdated = async () => {
  await fetchMenuItems()
}
const handleCategoryCreated = async () => {
  await fetchMenuCategories()
}
const handleCategoryUpdated = async () => {
  await fetchMenuCategories()
}
const handleCategoryDeleted = async () => {
  await fetchMenuCategories()
}
onMounted(async () => {
  await fetchMenuCategories()
  await fetchMenuItems()
})
</script>

<!-- Add a currency filter for price formatting -->
<script lang="ts">
import { defineNuxtPlugin } from '#app'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$filters = {
    currency(value: number) {
      if (typeof value !== 'number') return value
      return '$' + value.toFixed(2)
    }
  }
})
</script>