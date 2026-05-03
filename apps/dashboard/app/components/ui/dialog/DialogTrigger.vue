<script setup lang="ts">
import type { DialogTriggerProps } from 'reka-ui'
import { DialogTrigger, useForwardProps } from 'reka-ui'

const props = defineProps<DialogTriggerProps & { class?: string }>()
const forwarded = useForwardProps(props)
</script>

<template>
  <DialogTrigger v-bind="forwarded" :class="props.class">
    <slot />
  </DialogTrigger>
</template>
