<script setup lang="ts">
import type { DialogTitleProps } from 'reka-ui'
import { DialogTitle, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogTitleProps & { class?: string }>()

const forwarded = useForwardProps(
  computed(() => {
    const { class: _c, ...rest } = props
    return rest
  }),
)
</script>

<template>
  <DialogTitle v-bind="forwarded" :class="cn('text-lg font-semibold text-gray-900', props.class)">
    <slot />
  </DialogTitle>
</template>
