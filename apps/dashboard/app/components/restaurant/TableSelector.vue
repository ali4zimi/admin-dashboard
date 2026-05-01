<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm"
      :class="hasSelection ? 'text-gray-900' : 'text-gray-400'"
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
          placeholder="Search table..."
          class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div class="max-h-56 overflow-y-auto p-1">
        <button
          v-for="table in filteredItems"
          :key="table.id"
          type="button"
          class="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-gray-100"
          @click="toggleItem(table.id || '')"
        >
          <div class="flex min-w-0 items-center gap-2">
            <input
              v-if="multiple"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600"
              :checked="selectedIdSet.has(table.id || '')"
              @click.stop
              @change="toggleItem(table.id || '')"
            />
            <span class="truncate text-gray-700">{{ table.name }}</span>
          </div>
          <span class="ml-2 whitespace-nowrap text-xs text-gray-500">{{ table.capacity }} seats</span>
        </button>
        <p v-if="filteredItems.length === 0" class="px-2 py-3 text-sm text-gray-500">No tables found.</p>
      </div>

      <div v-if="multiple" class="border-t border-gray-100 p-2 text-right">
        <button type="button" class="text-xs font-medium text-blue-600 hover:text-blue-700" @click="isOpen = false">
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Table } from '@restaurant-platform/types/table.types'

interface Props {
  modelValue: string | string[]
  items: Table[]
  placeholder?: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select table',
  multiple: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const search = ref('')

const multiple = computed(() => props.multiple)

const selectedIds = computed<string[]>(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.filter(Boolean)
  }
  return props.modelValue ? [props.modelValue] : []
})

const selectedIdSet = computed(() => new Set(selectedIds.value))

const hasSelection = computed(() => selectedIds.value.length > 0)

const selectedItems = computed(() =>
  props.items.filter((table) => table.id && selectedIdSet.value.has(table.id))
)

const selectedLabel = computed(() => {
  if (selectedItems.value.length === 0) return props.placeholder

  if (!multiple.value) {
    const first = selectedItems.value[0]
    if (!first) return props.placeholder
    return `${first.name} (${first.capacity} seats)`
  }

  if (selectedItems.value.length === 1) {
    const first = selectedItems.value[0]
    if (!first) return props.placeholder
    return `${first.name} (${first.capacity} seats)`
  }

  return `${selectedItems.value.length} tables selected`
})

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.items

  return props.items.filter((table) => {
    return (
      table.name.toLowerCase().includes(q) ||
      String(table.capacity).includes(q) ||
      table.status.toLowerCase().includes(q)
    )
  })
})

const toggleItem = (id: string) => {
  if (!id) return

  if (!multiple.value) {
    emit('update:modelValue', id)
    isOpen.value = false
    return
  }

  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  emit('update:modelValue', Array.from(next))
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
