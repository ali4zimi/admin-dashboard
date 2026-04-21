<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/80 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 class="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <nav class="mt-6 px-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M13 9V3h8v6zM3 13V3h8v10zm10 8V11h8v10zM3 21v-6h8v6zm2-10h4V5H5zm10 8h4v-6h-4zm0-12h4V5h-4zM5 19h4v-2H5zm4-2"/></svg>
              Dashboard
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/users"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M16.5 12A2.5 2.5 0 0 0 19 9.5A2.5 2.5 0 0 0 16.5 7A2.5 2.5 0 0 0 14 9.5a2.5 2.5 0 0 0 2.5 2.5M9 11a3 3 0 0 0 3-3a3 3 0 0 0-3-3a3 3 0 0 0-3 3a3 3 0 0 0 3 3m7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75M9 13c-2.33,0 -7,1.17 -7,3.5V19h7v-2.25c0-.85 .33,-2.34,2.37,-3.47C10,14 .66,14,9,14"/></svg>
              Users
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/posts"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Posts
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/files"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              File Management
            </NuxtLink>
          </li>

          <li class="border-t border-gray-700 pt-4">
            <span class="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Booking</span>
          </li>
          <li>
            <NuxtLink
              to="/bookings"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Bookings
            </NuxtLink>
          </li>

          <li class="border-t border-gray-700 pt-4">
            <span class="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Restaurant</span>
          </li>
          <li>
            <NuxtLink
              to="/reservations"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reservations
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/orders"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14l-1 11a2 2 0 01-2 2H8a2 2 0 01-2-2L5 8zm3 0V6a4 4 0 118 0v2" />
              </svg>
              Orders
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/menu"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/tables"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tables
            </NuxtLink>
          </li>

          <li class="border-t border-gray-700 pt-4">
            <span class="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Configuration</span>
          </li>
          <li>
            <NuxtLink
              to="/restaurant-settings"
              class="flex items-center rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-800 text-white"
              @click="closeSidebarOnMobile"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Restaurant Settings
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main content wrapper -->
    <div class="lg:ml-64">
      <!-- Navbar -->
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:px-6">
        <!-- Mobile menu button -->
        <button
          class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Search bar -->
        <div class="hidden flex-1 md:flex md:max-w-md">
          <div class="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Right side items -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button class="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <!-- User menu -->
          <div class="relative">
            <button
              class="flex items-center space-x-3 rounded-lg p-1 hover:bg-gray-100"
              @click="userMenuOpen = !userMenuOpen"
            >
              <div class="h-8 w-8 overflow-hidden rounded-full bg-gray-300">
                <ClientOnly>
                  <img
                    :src="userAvatar"
                    alt="User avatar"
                    class="h-full w-full object-cover"
                  />
                </ClientOnly>
              </div>
              <ClientOnly>
                <span class="hidden text-sm font-medium text-gray-700 md:block">{{ userName }}</span>
              </ClientOnly>
              <svg class="hidden h-4 w-4 text-gray-400 md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
            >
              <div class="border-b border-gray-100 px-4 py-2">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="truncate text-xs text-gray-500">{{ userEmail }}</p>
              </div>
              <button
                class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="handleLogout"
              >
                <svg class="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()

const sidebarOpen = ref(false)
const userMenuOpen = ref(false)

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

// Close user menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      userMenuOpen.value = false
    }
  })
})
</script>
