<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
      <div class="mb-6 flex justify-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg class="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <h1 class="mb-2 text-center text-2xl font-bold text-gray-900">
        {{ headline }}
      </h1>

      <p class="mb-6 text-center text-gray-600">
        {{ message }}
      </p>

      <div v-if="contactEmail" class="mb-6 rounded-lg bg-gray-50 p-4 text-center">
        <p class="text-sm text-gray-500">Need help? Contact</p>
        <a
          :href="`mailto:${contactEmail}`"
          class="text-sm font-medium text-blue-600 hover:underline"
        >
          {{ contactEmail }}
        </a>
      </div>

      <button
        class="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        @click="handleLogout"
      >
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { logout } = useAuth()
const { client, isSuspended, contactEmail, loadClient } = useClient()

definePageMeta({
  layout: false,
})

useHead({
  title: 'Account suspended',
})

onMounted(async () => {
  if (!client.value) {
    await loadClient()
  }
})

const headline = computed(() => {
  if (isSuspended.value) return 'Account suspended'
  if (!client.value) return 'Restaurant not found'
  return 'Access unavailable'
})

const message = computed(() => {
  if (isSuspended.value) {
    return 'This restaurant account has been suspended. Please contact support to restore access.'
  }
  if (!client.value) {
    return 'We couldn\'t load this restaurant. Check the deployment configuration or contact support.'
  }
  return 'This account is not currently active. Contact support for assistance.'
})

const handleLogout = async () => {
  await logout()
}
</script>
