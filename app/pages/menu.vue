<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Menu Management</h1>
        <p class="text-gray-600">Create categories and add items quickly in one place.</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <svg class="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <div v-else class="space-y-3">
      <div class="mb-4 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search categories or menu items..."
            class="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="selectedCategoryId"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option v-for="category in sortedCategories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div v-if="menuCategories.length === 0" class="rounded-lg bg-white p-8 text-center shadow-sm">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">No categories yet</h3>
        <p class="text-sm text-gray-500">Create your first category to start adding menu items.</p>
      </div>

      <div v-else-if="filteredCategories.length === 0" class="rounded-lg bg-white p-8 text-center shadow-sm">
        <h3 class="mb-2 text-lg font-semibold text-gray-900">No matching results</h3>
        <p class="text-sm text-gray-500">Try a different keyword or clear filters.</p>
      </div>

      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
          @click="toggleCategory(category.id!)"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div class="h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              <img
                v-if="category.imageUrl"
                :src="category.thumbnailUrl || category.imageUrl"
                :alt="category.name"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M7 3v4m10-4v4M6 21h12a2 2 0 002-2V7H4v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="min-w-0">
              <p class="truncate text-base font-semibold text-gray-900">{{ category.name }}</p>
              <p class="truncate text-sm text-gray-500">{{ getVisibleCategoryItems(category.id!).length }} items</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
              title="Edit category"
              @click.stop
              @click="openEditCategoryModal(category)"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6a2 2 0 012.828 2.828l-6 6a2 2 0 01-2.828-2.828z" />
              </svg>
            </button>
            <button
              type="button"
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              title="Delete category"
              @click.stop
              @click="openDeleteCategoryModal(category)"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <svg
              class="h-5 w-5 text-gray-500 transition-transform"
              :class="isCategoryOpen(category.id!) ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <div v-if="isCategoryOpen(category.id!)" class="border-t border-gray-100 px-4 py-4">
          <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-gray-600">Add and manage items inside {{ category.name }}.</p>
            <button
              type="button"
              class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              @click="openAddItemModal(category.id!)"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Menu Item
            </button>
          </div>

          <div v-if="getVisibleCategoryItems(category.id!).length === 0" class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p class="text-sm text-gray-500">No items in this category yet.</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="item in getVisibleCategoryItems(category.id!)"
              :key="item.id"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3"
            >
              <div class="flex min-w-0 items-center gap-3 pr-3">
                <div class="h-11 w-11 overflow-hidden rounded border border-gray-200 bg-gray-100">
                  <img
                    v-if="item.imageUrl"
                    :src="item.thumbnailUrl || item.imageUrl"
                    :alt="item.name"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M7 3v4m10-4v4M6 21h12a2 2 0 002-2V7H4v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-900">{{ item.name }}</p>
                  <p class="truncate text-xs text-gray-500">{{ item.description || 'No description' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div v-if="item.sizes && item.sizes.length > 0" class="flex flex-wrap items-center justify-end gap-1">
                  <span
                    v-for="(size, index) in item.sizes"
                    :key="`${item.id || item.name}-${size.name}-${index}`"
                    class="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700"
                  >
                    {{ size.name }}: {{ formatCurrency(size.price) }}
                  </span>
                </div>
                <span v-else class="text-sm font-semibold text-gray-900">{{ formatCurrency(item.price) }}</span>
                <button
                  type="button"
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                  title="Edit item"
                  @click="openEditItemModal(item)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 11l6-6a2 2 0 012.828 2.828l-6 6a2 2 0 01-2.828-2.828z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  title="Delete item"
                  @click="openDeleteItemModal(item)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-3">
        <button
          type="button"
          class="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          @click="openCreateCategoryModal"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Category
        </button>
      </div>
    </div>

    <MenuFormModal
      v-model="showItemModal"
      :menu-item="editingMenuItem"
      @saved="handleItemSaved"
    />

    <MenuCategoryFormModal
      v-model="showCategoryModal"
      :category="editingCategory"
      @saved="handleCategorySaved"
    />

    <DeleteConfirmModal
      v-model="showDeleteItemModal"
      :item-id="itemToDelete?.id || null"
      :item-name="itemToDelete?.name || ''"
      item-type="Menu Item"
      @confirm="handleItemDeleted"
    />

    <DeleteConfirmModal
      v-model="showDeleteCategoryModal"
      :item-id="categoryToDelete?.id || null"
      :item-name="categoryToDelete?.name || ''"
      item-type="Menu Category"
      @confirm="handleCategoryDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuCategory, MenuItem } from '~/types/menu.types'
import { useMenu } from '~/composables/restaurant/useMenu'
import { useRestaurantSettings } from '~/composables/useRestaurantSettings'

useHead({
  title: 'Menu Management - Admin Panel',
})

const {
  menuItems,
  menuCategories,
  loading,
  fetchMenuItems,
  fetchMenuCategories,
  deleteMenuItem,
  deleteMenuCategory,
} = useMenu()

const { formatCurrency, loadRestaurantSettings } = useRestaurantSettings()

const showCategoryModal = ref(false)
const showItemModal = ref(false)
const showDeleteItemModal = ref(false)
const showDeleteCategoryModal = ref(false)

const editingCategory = ref<MenuCategory | null>(null)
const editingMenuItem = ref<MenuItem | null>(null)
const itemToDelete = ref<MenuItem | null>(null)
const categoryToDelete = ref<MenuCategory | null>(null)
const searchTerm = ref('')
const selectedCategoryId = ref('')

const openCategoryIds = ref<string[]>([])

const sortedCategories = computed(() => {
  return [...menuCategories.value].sort((a, b) => a.name.localeCompare(b.name))
})

const filteredCategories = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()

  return sortedCategories.value.filter((category) => {
    if (selectedCategoryId.value && category.id !== selectedCategoryId.value) {
      return false
    }

    if (!search) {
      return true
    }

    const categoryMatches =
      category.name.toLowerCase().includes(search) ||
      (category.description || '').toLowerCase().includes(search)

    if (categoryMatches) {
      return true
    }

    return menuItems.value.some((item) => {
      if (item.categoryId !== category.id) {
        return false
      }

      return (
        item.name.toLowerCase().includes(search) ||
        (item.description || '').toLowerCase().includes(search)
      )
    })
  })
})

const isCategoryOpen = (categoryId: string) => openCategoryIds.value.includes(categoryId)

const toggleCategory = (categoryId: string) => {
  if (isCategoryOpen(categoryId)) {
    openCategoryIds.value = openCategoryIds.value.filter((id) => id !== categoryId)
    return
  }

  openCategoryIds.value = [...openCategoryIds.value, categoryId]
}

const getCategoryItems = (categoryId: string) => {
  return menuItems.value
    .filter((item) => item.categoryId === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name))
}

const getVisibleCategoryItems = (categoryId: string) => {
  const items = getCategoryItems(categoryId)
  const search = searchTerm.value.trim().toLowerCase()

  if (!search) {
    return items
  }

  return items.filter((item) => {
    return (
      item.name.toLowerCase().includes(search) ||
      (item.description || '').toLowerCase().includes(search)
    )
  })
}

const openCreateCategoryModal = () => {
  editingCategory.value = null
  showCategoryModal.value = true
}

const openEditCategoryModal = (category: MenuCategory) => {
  editingCategory.value = { ...category }
  showCategoryModal.value = true
}

const openDeleteCategoryModal = (category: MenuCategory) => {
  categoryToDelete.value = category
  showDeleteCategoryModal.value = true
}

const openAddItemModal = (categoryId: string) => {
  editingMenuItem.value = {
    name: '',
    description: '',
    price: 0,
    categoryId,
    imageUrl: '',
    thumbnailUrl: '',
  }
  showItemModal.value = true
}

const openEditItemModal = (item: MenuItem) => {
  editingMenuItem.value = { ...item }
  showItemModal.value = true
}

const openDeleteItemModal = (item: MenuItem) => {
  itemToDelete.value = item
  showDeleteItemModal.value = true
}

const handleCategorySaved = () => {
  showCategoryModal.value = false
  editingCategory.value = null
}

const handleItemSaved = () => {
  showItemModal.value = false
  editingMenuItem.value = null
}

const handleItemDeleted = async () => {
  if (!itemToDelete.value?.id) {
    return
  }

  await deleteMenuItem(itemToDelete.value.id)
  itemToDelete.value = null
}

const handleCategoryDeleted = async () => {
  if (!categoryToDelete.value?.id) {
    return
  }

  await deleteMenuCategory(categoryToDelete.value.id)
  openCategoryIds.value = openCategoryIds.value.filter((id) => id !== categoryToDelete.value?.id)
  categoryToDelete.value = null
}

onMounted(async () => {
  await loadRestaurantSettings()
  await fetchMenuCategories()
  await fetchMenuItems()
})
</script>
