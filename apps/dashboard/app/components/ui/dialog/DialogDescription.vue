<script setup lang="ts">
import type { DialogDescriptionProps } from 'reka-ui'
import { DialogDescription, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogDescriptionProps & { class?: string }>()

const forwarded = useForwardProps(
  computed(() => {
    const { class: _c, ...rest } = props
    return rest
  }),
)
</script>

<template>
  <DialogDescription v-bind="forwarded" :class="cn('text-sm text-gray-500', props.class)">
    <slot />
  </DialogDescription>
</template>
