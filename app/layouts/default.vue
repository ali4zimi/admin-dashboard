<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
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
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
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
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              User Management
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
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 overflow-hidden rounded-full bg-gray-300">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff"
                alt="User avatar"
                class="h-full w-full object-cover"
              />
            </div>
            <span class="hidden text-sm font-medium text-gray-700 md:block">Admin User</span>
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
const sidebarOpen = ref(false)

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}
</script>
