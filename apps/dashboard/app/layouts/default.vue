<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      role="button"
      tabindex="0"
      aria-label="Close sidebar"
      @click="sidebarOpen = false"
      @keydown.esc="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex h-16 items-center justify-center gap-3 border-b border-gray-700 px-4">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="restaurantName"
          class="h-8 w-8 rounded object-cover"
        />
        <h1 class="truncate text-xl font-bold">{{ restaurantName || 'Dashboard' }}</h1>
      </div>
      <nav class="mt-6 px-4">
        <ul class="space-y-2">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              :exact-active-class="item.exact ? 'bg-gray-800 text-white border-l-4 border-blue-500' : undefined"
              :active-class="item.exact ? undefined : 'bg-gray-800 text-white border-l-4 border-blue-500'"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              @click="closeSidebarOnMobile"
            >
              <Icon :name="item.icon" class="mr-3 h-5 w-5" />
              {{ item.label }}
            </NuxtLink>
          </li>

          <li class="border-t border-gray-700 pt-4">
            <span class="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Restaurant</span>
          </li>
          <li v-for="item in restaurantNavItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              active-class="bg-gray-800 text-white border-l-4 border-blue-500"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              @click="closeSidebarOnMobile"
            >
              <Icon :name="item.icon" class="mr-3 h-5 w-5" />
              {{ item.label }}
            </NuxtLink>
          </li>

          <li class="border-t border-gray-700 pt-4">
            <span class="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Configuration</span>
          </li>
          <li v-for="item in configNavItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              active-class="bg-gray-800 text-white border-l-4 border-blue-500"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              @click="closeSidebarOnMobile"
            >
              <Icon :name="item.icon" class="mr-3 h-5 w-5" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main content wrapper -->
    <div class="lg:ml-64">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:px-6">
        <button
          type="button"
          class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open sidebar"
          :aria-expanded="sidebarOpen"
          aria-controls="sidebar"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Icon name="lucide:menu" class="h-6 w-6" />
        </button>

        <div class="hidden flex-1 md:flex md:max-w-md">
          <div class="relative w-full">
            <label for="global-search" class="sr-only">Search</label>
            <input
              id="global-search"
              type="text"
              placeholder="Search..."
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <button
            type="button"
            class="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Icon name="lucide:bell" class="h-6 w-6" />
            <span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div ref="userMenuRef" class="relative">
            <button
              type="button"
              class="flex items-center space-x-3 rounded-lg p-1 hover:bg-gray-100"
              aria-haspopup="menu"
              :aria-expanded="userMenuOpen"
              @click="userMenuOpen = !userMenuOpen"
            >
              <div class="h-8 w-8 overflow-hidden rounded-full bg-gray-300">
                <ClientOnly>
                  <img :src="userAvatar" alt="User avatar" class="h-full w-full object-cover" />
                </ClientOnly>
              </div>
              <ClientOnly>
                <span class="hidden text-sm font-medium text-gray-700 md:block">{{ userName }}</span>
              </ClientOnly>
              <Icon name="lucide:chevron-down" class="hidden h-4 w-4 text-gray-400 md:block" />
            </button>

            <div
              v-if="userMenuOpen"
              role="menu"
              class="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5"
            >
              <div class="border-b border-gray-100 px-4 py-2">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="truncate text-xs text-gray-500">{{ userEmail }}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="handleLogout"
              >
                <Icon name="lucide:log-out" class="mr-2 h-4 w-4 text-gray-400" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const { restaurantName, logoUrl } = useClient()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'lucide:layout-dashboard', exact: true },
  { to: '/users', label: 'Users', icon: 'lucide:users', exact: false },
  { to: '/posts', label: 'Posts', icon: 'lucide:file-text', exact: false },
  { to: '/files', label: 'File Management', icon: 'lucide:folder', exact: false },
]

const restaurantNavItems = [
  { to: '/reservations', label: 'Reservations', icon: 'lucide:calendar-days' },
  { to: '/orders', label: 'Orders', icon: 'lucide:shopping-bag' },
  { to: '/menu', label: 'Menu', icon: 'lucide:utensils' },
  { to: '/tables', label: 'Tables', icon: 'lucide:armchair' },
]

const configNavItems = [
  { to: '/restaurant-settings', label: 'Restaurant Settings', icon: 'lucide:settings' },
]

const userName = computed(() => user.value?.displayName || user.value?.email?.split('@')[0] || 'User')
const userEmail = computed(() => user.value?.email || '')
const userAvatar = computed(() => {
  const name = userName.value.replace(' ', '+')
  return `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff`
})

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

const handleLogout = async () => {
  userMenuOpen.value = false
  await logout()
}

const handleClickOutside = (e: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    userMenuOpen.value = false
    sidebarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>
