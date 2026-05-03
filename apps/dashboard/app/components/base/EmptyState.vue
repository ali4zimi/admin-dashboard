<template>
  <div class="rounded-lg bg-white p-12 text-center shadow-sm">
    <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
      <slot name="icon">
        <Icon name="lucide:inbox" class="h-6 w-6 text-gray-400" />
      </slot>
    </div>
    <h3 class="mb-1 text-lg font-medium text-gray-900">{{ title }}</h3>
    <p v-if="description" class="mb-4 text-sm text-gray-500">{{ description }}</p>
    <div v-if="$slots.action" class="mt-2">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>
