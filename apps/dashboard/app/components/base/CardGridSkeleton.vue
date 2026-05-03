<template>
  <div :class="['grid gap-4', gridClass]">
    <div
      v-for="i in count"
      :key="i"
      class="overflow-hidden rounded-lg bg-white p-4 shadow-sm"
    >
      <Skeleton class="mb-3 h-32 w-full" />
      <Skeleton class="mb-2 h-4 w-3/4" />
      <Skeleton class="mb-4 h-3 w-1/2" />
      <div class="flex gap-2">
        <Skeleton class="h-8 flex-1" />
        <Skeleton class="h-8 w-10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number; cols?: number }>(), {
  count: 6,
  cols: 3,
})

const gridClass = computed(() => {
  const map: Record<number, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }
  return map[props.cols] ?? map[3]
})
</script>
