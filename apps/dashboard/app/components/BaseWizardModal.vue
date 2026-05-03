<template>
  <Dialog :open="modelValue" @update:open="handleOpenChange">
    <DialogContent
      size="lg"
      class="flex flex-col"
      @pointer-down-outside="(e) => closeOnBackdrop ? null : e.preventDefault()"
      @interact-outside="(e) => closeOnBackdrop ? null : e.preventDefault()"
    >
      <DialogHeader class="block">
        <div class="flex items-center justify-between">
          <DialogTitle>{{ title }}</DialogTitle>
          <DialogClose
            aria-label="Close dialog"
            class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </DialogClose>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <template v-for="(step, index) in steps" :key="index">
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
                <Icon v-if="index < currentStep" name="lucide:check" class="h-4 w-4" />
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
            <div
              v-if="index < steps.length - 1"
              :class="[
                'mx-2 h-0.5 flex-1',
                index < currentStep ? 'bg-green-500' : 'bg-gray-200'
              ]"
            />
          </template>
        </div>
      </DialogHeader>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-6 lg:px-6">
        <slot :name="`step-${currentStep}`" />
      </div>

      <DialogFooter class="justify-between">
        <BaseButton
          v-if="currentStep > 0"
          variant="secondary"
          @click="previousStep"
        >
          <template #icon-left>
            <Icon name="lucide:chevron-left" class="mr-2 h-4 w-4" />
          </template>
          Back
        </BaseButton>
        <div v-else />

        <div class="flex gap-3">
          <DialogClose as-child>
            <BaseButton variant="secondary">Cancel</BaseButton>
          </DialogClose>

          <BaseButton
            v-if="currentStep < steps.length - 1"
            variant="primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            Next
            <template #icon-right>
              <Icon name="lucide:chevron-right" class="ml-2 h-4 w-4" />
            </template>
          </BaseButton>

          <BaseButton
            v-else
            variant="success"
            :loading="loading"
            :disabled="!canProceed"
            @click="$emit('submit')"
          >
            <template v-if="!loading" #icon-left>
              <Icon name="lucide:check" class="mr-2 h-4 w-4" />
            </template>
            {{ submitLabel }}
          </BaseButton>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
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

const handleOpenChange = (open: boolean) => {
  emit('update:modelValue', open)
}
</script>
