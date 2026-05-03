<template>
  <Dialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <DialogContent :size="size" class="flex flex-col">
      <DialogHeader class="flex-row items-center justify-between gap-4">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogClose
          aria-label="Close dialog"
          class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Icon name="lucide:x" class="h-5 w-5" />
        </DialogClose>
      </DialogHeader>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-6">
        <slot />
      </div>

      <DialogFooter v-if="$slots.footer">
        <slot name="footer" />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
