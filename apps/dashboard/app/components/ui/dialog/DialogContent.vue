<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import { DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui'
import DialogOverlay from './DialogOverlay.vue'
import { cn } from '@/lib/utils'

type Placement = 'right' | 'left' | 'center'
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const props = defineProps<
  DialogContentProps & { class?: string; placement?: Placement; size?: Size }
>()
const emits = defineEmits<DialogContentEmits>()

const forwarded = useForwardPropsEmits(
  computed(() => {
    const { class: _c, placement: _p, size: _z, ...rest } = props
    return rest
  }),
  emits,
)

const placement = computed<Placement>(() => props.placement ?? 'right')
const size = computed<Size>(() => props.size ?? 'md')

const drawerSizeClasses: Record<Size, string> = {
  sm: 'lg:w-[400px]',
  md: 'lg:w-[480px]',
  lg: 'lg:w-[640px]',
  xl: 'lg:w-[800px]',
  full: 'lg:w-[960px]',
}

const centerSizeClasses: Record<Size, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
  full: 'sm:max-w-4xl',
}

const layoutClasses = computed(() => {
  if (placement.value === 'center') {
    return cn(
      'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
      'w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] rounded-lg',
      centerSizeClasses[size.value],
      'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    )
  }

  const isRight = placement.value === 'right'
  return cn(
    'h-full w-full',
    isRight ? 'inset-y-0 right-0' : 'inset-y-0 left-0',
    isRight
      ? 'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right'
      : 'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
    drawerSizeClasses[size.value],
  )
})
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      v-bind="forwarded"
      :class="cn(
        'fixed z-50 flex flex-col bg-white shadow-2xl outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200',
        layoutClasses,
        props.class,
      )"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
