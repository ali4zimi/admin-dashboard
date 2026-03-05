<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 transition-opacity"
          style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(2px);"
          @click="handleBackdropClick"
        ></div>

        <!-- Modal content -->
        <div
          class="relative w-full max-w-2xl rounded-lg bg-white shadow-xl transition-all"
        >
          <!-- Header -->
          <div class="border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
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

            <!-- Step indicator -->
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <template v-for="(step, index) in steps" :key="index">
                  <!-- Step circle -->
                  <div class="flex flex-col items-center">
                    <div
                      :class="[
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                        index < currentStep
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                      ]"
                    >
                      <svg v-if="index < currentStep" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span v-else>{{ index + 1 }}</span>
                    </div>
                    <span
                      :class="[
                        'mt-1 text-xs font-medium',
                        index === currentStep ? 'text-blue-600' : 'text-gray-500'
                      ]"
                    >
                      {{ step.title }}
                    </span>
                  </div>

                  <!-- Connector line -->
                  <div
                    v-if="index < steps.length - 1"
                    :class="[
                      'mx-2 h-0.5 flex-1',
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    ]"
                  ></div>
                </template>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="min-h-[280px] px-6 py-6">
            <slot :name="`step-${currentStep}`" />
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <button
              v-if="currentStep > 0"
              type="button"
              class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              @click="previousStep"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div v-else></div>

            <div class="flex gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                @click="$emit('update:modelValue', false)"
              >
                Cancel
              </button>

              <button
                v-if="currentStep < steps.length - 1"
                type="button"
                class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                :disabled="!canProceed"
                @click="nextStep"
              >
                Next
                <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-else
                type="button"
                class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="loading || !canProceed"
                @click="$emit('submit')"
              >
                <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <svg v-else class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ submitLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
export interface WizardStep {
  title: string
  description?: string
}

interface Props {
  modelValue: boolean
  title: string
  steps: WizardStep[]
  currentStep?: number
  loading?: boolean
  submitLabel?: string
  canProceed?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentStep: 0,
  loading: false,
  submitLabel: 'Submit',
  canProceed: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:currentStep': [step: number]
  'submit': []
}>()

const currentStep = computed({
  get: () => props.currentStep,
  set: (value) => emit('update:currentStep', value),
})

const nextStep = () => {
  if (currentStep.value < props.steps.length - 1) {
    currentStep.value = currentStep.value + 1
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value = currentStep.value - 1
  }
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
