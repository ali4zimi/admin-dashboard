<template>
  <BaseModal :model-value="modelValue" title="Manage Categories" @update:modelValue="$emit('update:modelValue', $event)">
    <div class="mb-4">
      <button class="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700" @click="openAddModal">Add Category</button>
    </div>
    <ul class="divide-y divide-gray-200">
      <li v-for="cat in categories" :key="cat.id" class="flex items-center justify-between py-2">
        <div>
          <span class="font-medium">{{ cat.name }}</span>
          <span v-if="cat.description" class="ml-2 text-xs text-gray-500">{{ cat.description }}</span>
        </div>
        <div class="flex gap-2">
          <button class="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100" @click="openEditModal(cat)">Edit</button>
          <button class="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100" @click="openDeleteModal(cat)">Delete</button>
        </div>
      </li>
    </ul>
    <MenuCategoryFormModal
      v-model="showCategoryForm"
      :category="editingCategory"
      @created="handleCreated"
      @updated="handleUpdated"
    />
    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="deletingCategory?.id || null"
      :item-name="deletingCategory?.name || ''"
      item-type="Menu Category"
      @confirm="handleDeleted"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '~/components/BaseModal.vue'
import MenuCategoryFormModal from '~/components/restaurant/MenuCategoryFormModal.vue'
import DeleteConfirmModal from '~/components/DeleteConfirmModal.vue'
import { useMenu } from '~/composables/restaurant/useMenu'
import type { MenuCategory } from '@restaurant-platform/types/menu.types'

defineProps<{
  modelValue: boolean
  categories: MenuCategory[]
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [category: MenuCategory]
  updated: [category: MenuCategory]
  deleted: [category: MenuCategory]
}>()

const showCategoryForm = ref(false)
const editingCategory = ref<MenuCategory | null>(null)
const showDeleteModal = ref(false)
const deletingCategory = ref<MenuCategory | null>(null)

const { deleteMenuCategory } = useMenu()

function openAddModal() {
  editingCategory.value = null
  showCategoryForm.value = true
}
function openEditModal(cat: MenuCategory) {
  editingCategory.value = { ...cat }
  showCategoryForm.value = true
}
function openDeleteModal(cat: MenuCategory) {
  deletingCategory.value = cat
  showDeleteModal.value = true
}
async function handleCreated(category: MenuCategory) {
  emit('created', category)
  showCategoryForm.value = false
}
async function handleUpdated(category: MenuCategory) {
  emit('updated', category)
  showCategoryForm.value = false
}
async function handleDeleted() {
  if (deletingCategory.value?.id) {
    await deleteMenuCategory(deletingCategory.value.id)
    emit('deleted', deletingCategory.value)
    deletingCategory.value = null
  }
  showDeleteModal.value = false
}
</script>
