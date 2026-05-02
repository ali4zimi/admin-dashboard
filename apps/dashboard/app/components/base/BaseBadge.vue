<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<script setup lang="ts">
type Color = 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'

interface Props {
  color?: Color
  pill?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray',
  pill: true,
})

const colorClasses: Record<Color, string> = {
  gray: 'bg-gray-100 text-gray-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
}

const classes = computed(() => [
  'inline-flex items-center px-2 py-1 text-xs font-semibold',
  props.pill ? 'rounded-full' : 'rounded',
  colorClasses[props.color],
])
</script>
