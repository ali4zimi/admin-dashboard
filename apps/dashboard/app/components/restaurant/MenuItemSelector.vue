<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm"
      :class="modelValue ? 'text-gray-900' : 'text-gray-400'"
      @click="isOpen = !isOpen"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="isOpen" class="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
      <div class="border-b border-gray-100 p-2">
        <input
          v-model="search"
          type="text"
          placeholder="Search menu item..."
          class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div class="max-h-56 overflow-y-auto p-1">
        <button
          v-for="item in filteredItems"
          :key="item.id"
          type="button"
          class="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-gray-100"
          @click="selectItem(item.id || '')"
        >
          <span class="truncate text-gray-700">{{ item.name }}</span>
          <span class="ml-2 whitespace-nowrap text-xs text-gray-500">{{ formatCurrency(item.price) }}</span>
        </button>
        <p v-if="filteredItems.length === 0" class="px-2 py-3 text-sm text-gray-500">No items found.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@restaurant-platform/types/menu.types'
import { useRestaurantSettings } from '~/composables/useRestaurantSettings'

interface Props {
  modelValue: string
  items: MenuItem[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select menu item',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { formatCurrency } = useRestaurantSettings()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const search = ref('')

const selectedItem = computed(() => props.items.find((item) => item.id === props.modelValue))

const selectedLabel = computed(() => {
  if (!props.modelValue) return props.placeholder
  if (!selectedItem.value) return props.placeholder
  return `${selectedItem.value.name} (${formatCurrency(selectedItem.value.price)})`
})

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.items

  return props.items.filter((item) => {
    return item.name.toLowerCase().includes(q)
  })
})

const selectItem = (id: string) => {
  emit('update:modelValue', id)
  isOpen.value = false
}

const handleOutsideClick = (event: MouseEvent) => {
  if (!rootRef.value) return

  const target = event.target as Node
  if (!rootRef.value.contains(target)) {
    isOpen.value = false
  }
}

watch(isOpen, (value) => {
  if (value) {
    search.value = ''
  }
})

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>
