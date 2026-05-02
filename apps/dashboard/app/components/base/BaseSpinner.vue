<template>
  <svg
    :class="[sizeClass, colorClass, 'animate-spin']"
    viewBox="0 0 24 24"
    role="status"
    :aria-label="ariaLabel"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'current'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  ariaLabel: 'Loading',
})

const sizeClass = computed(() => ({
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}[props.size]))

const colorClass = computed(() => ({
  primary: 'text-blue-600',
  white: 'text-white',
  current: 'text-current',
}[props.color]))
</script>
