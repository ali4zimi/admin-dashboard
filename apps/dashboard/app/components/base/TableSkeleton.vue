<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-sm">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th v-for="col in columns" :key="col" class="px-6 py-3 text-left">
            <Skeleton class="h-3 w-20" />
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr v-for="row in rows" :key="row">
          <td v-for="col in columns" :key="col" class="px-6 py-4">
            <Skeleton :class="row % 2 === 0 ? 'h-4 w-full' : 'h-4 w-3/4'" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ columns?: number; rows?: number }>(), {
  columns: 5,
  rows: 6,
})
</script>
