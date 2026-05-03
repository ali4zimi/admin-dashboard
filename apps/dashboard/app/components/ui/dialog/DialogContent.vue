<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import { DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui'
import DialogOverlay from './DialogOverlay.vue'
import { cn } from '@/lib/utils'

type Side = 'right' | 'left'
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const props = defineProps<
  DialogContentProps & { class?: string; side?: Side; size?: Size }
>()
const emits = defineEmits<DialogContentEmits>()

const forwarded = useForwardPropsEmits(
  computed(() => {
    const { class: _c, side: _s, size: _z, ...rest } = props
    return rest
  }),
  emits,
)

const side = computed<Side>(() => props.side ?? 'right')
const size = computed<Size>(() => props.size ?? 'md')

const sizeClasses: Record<Size, string> = {
  sm: 'lg:w-[400px]',
  md: 'lg:w-[480px]',
  lg: 'lg:w-[640px]',
  xl: 'lg:w-[800px]',
  full: 'lg:w-[960px]',
}

const sideClasses = computed(() => {
  const isRight = side.value === 'right'
  const enter = isRight
    ? 'data-[state=open]:slide-in-from-right'
    : 'data-[state=open]:slide-in-from-left'
  const exit = isRight
    ? 'data-[state=closed]:slide-out-to-right'
    : 'data-[state=closed]:slide-out-to-left'
  const position = isRight ? 'inset-y-0 right-0' : 'inset-y-0 left-0'
  return `${position} ${enter} ${exit}`
})
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      v-bind="forwarded"
      :class="cn(
        'fixed z-50 flex h-full w-full flex-col bg-white shadow-2xl outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200',
        sideClasses,
        sizeClasses[size],
        props.class,
      )"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
