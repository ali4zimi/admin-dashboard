<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :title="file ? file.name : ''" size="lg">
    <div class="flex flex-col items-center">
      <template v-if="file && file.type === 'Image'">
        <img :src="file.downloadUrl" :alt="file.name" class="max-h-[60vh] max-w-full rounded shadow" />
      </template>
      <template v-else-if="file && file.type === 'Video'">
        <video :src="file.downloadUrl" controls class="max-h-[60vh] max-w-full rounded shadow" />
      </template>
      <template v-else>
        <div class="text-center">
          <p class="mb-2 text-lg font-semibold">Cannot preview this file type.</p>
          <button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" @click="$emit('download', file)">
            Download
          </button>
        </div>
      </template>
      <div class="mt-4 text-center">
        <p class="font-medium text-gray-900">{{ file?.name }}</p>
        <p class="text-xs text-gray-500">{{ file?.sizeFormatted }}</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/BaseModal.vue'
defineProps({
  modelValue: Boolean,
  file: Object
})
defineEmits(['update:modelValue', 'download'])
</script>
