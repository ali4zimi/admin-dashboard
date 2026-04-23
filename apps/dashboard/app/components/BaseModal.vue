<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60"
          @click="$emit('update:modelValue', false)"
        ></div>

        <Transition name="drawer-slide">
          <aside
            v-if="modelValue"
            class="absolute inset-0 h-full w-full bg-white shadow-2xl lg:inset-y-0 lg:right-0 lg:left-auto"
            :class="sizeClasses"
          >
            <div class="flex h-full flex-col">
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 lg:px-6">
                <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                <button
                  type="button"
                  class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  @click="$emit('update:modelValue', false)"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-6">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 lg:px-6">
                <slot name="footer" />
              </div>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'lg:w-[400px]',
    md: 'lg:w-[480px]',
    lg: 'lg:w-[640px]',
    xl: 'lg:w-[800px]',
  }
  return sizes[props.size]
})
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.25s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
