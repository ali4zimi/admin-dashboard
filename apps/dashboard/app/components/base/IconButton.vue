<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    :class="classes"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
type Tone = 'neutral' | 'primary' | 'success' | 'danger'

interface Props {
  label: string
  tone?: Tone
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'neutral',
  disabled: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const toneClasses: Record<Tone, string> = {
  neutral: 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
  primary: 'text-gray-400 hover:bg-gray-100 hover:text-blue-600',
  success: 'text-gray-400 hover:bg-gray-100 hover:text-green-600',
  danger: 'text-gray-400 hover:bg-gray-100 hover:text-red-600',
}

const classes = computed(() => [
  'rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
  'disabled:cursor-not-allowed disabled:opacity-50',
  toneClasses[props.tone],
])
</script>
