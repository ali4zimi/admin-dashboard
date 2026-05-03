<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md">
      <div class="rounded-lg bg-white p-8 shadow-lg">
        <!-- Logo/Header -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <Icon name="lucide:lock" class="h-6 w-6 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p class="mt-2 text-gray-600">Sign in to your admin account</p>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {{ error }}
        </div>

        <!-- Login form -->
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="email" class="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div class="mb-6">
            <label for="password" class="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <BaseButton type="submit" variant="primary" block :loading="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </BaseButton>
        </form>

        <!-- Register link -->
        <p class="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'Login - Admin Panel'
})

const { login, error } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    await login(email.value, password.value)
    navigateTo('/')
  } catch (e) {
    // Error is handled in the composable
  } finally {
    loading.value = false
  }
}
</script>
