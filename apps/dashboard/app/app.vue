<template>
  <div v-if="loading" class="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100">
    <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
    <p class="mt-2 text-base font-semibold text-gray-900">Getting your dashboard ready</p>
    <p class="text-sm text-gray-500">Just a moment&hellip;</p>
  </div>
  <div v-else-if="error" class="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-6 text-center">
    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
      <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
    <p class="text-base font-semibold text-gray-900">Something went wrong</p>
    <p class="max-w-md text-sm text-gray-500">{{ error }}</p>
    <button
      class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
      @click="reload"
    >
      Try again
    </button>
  </div>
  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { loading, error } = useAuth()

const reload = () => {
  window.location.reload()
}
</script>
