<template>
  <div>
    <PageHeader title="Dashboard" description="Welcome back! Here's an overview of your admin panel." class="mb-6" />

    <!-- Stats cards -->
    <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Users</p>
            <p class="mt-1 text-3xl font-bold text-gray-900">{{ users.length }}</p>
          </div>
          <div class="rounded-full bg-blue-100 p-3">
            <svg class="" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M16.5 12A2.5 2.5 0 0 0 19 9.5A2.5 2.5 0 0 0 16.5 7A2.5 2.5 0 0 0 14 9.5a2.5 2.5 0 0 0 2.5 2.5M9 11a3 3 0 0 0 3-3a3 3 0 0 0-3-3a3 3 0 0 0-3 3a3 3 0 0 0 3 3m7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75M9 13c-2.33,0 -7,1.17 -7,3.5V19h7v-2.25c0-.85 .33,-2.34,2.37,-3.47C10,14 .66,14,9,14"/></svg>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Posts</p>
            <p class="mt-1 text-3xl font-bold text-gray-900">{{ posts.length }}</p>
          </div>
          <div class="rounded-full bg-green-100 p-3">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Files</p>
            <p class="mt-1 text-3xl font-bold text-gray-900">{{ files.length }}</p>
          </div>
          <div class="rounded-full bg-purple-100 p-3">
            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Storage Used</p>
            <p class="mt-1 text-3xl font-bold text-gray-900">{{ storageUsed }}</p>
          </div>
          <div class="rounded-full bg-orange-100 p-3">
            <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent activity and quick actions -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Recent Activity -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-900">New user <span class="font-medium">John Doe</span> registered</p>
              <p class="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-900">Post <span class="font-medium">"Getting Started Guide"</span> published</p>
              <p class="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <svg class="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-900">File <span class="font-medium">report-2026.pdf</span> uploaded</p>
              <p class="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <svg class="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-900">User <span class="font-medium">Jane Smith</span> updated profile</p>
              <p class="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="rounded-lg bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-4">
          <NuxtLink
            to="/users"
            class="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <div class="mb-2 rounded-full bg-blue-100 p-3">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">Add User</span>
          </NuxtLink>
          <NuxtLink
            to="/posts"
            class="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-green-500 hover:bg-green-50"
          >
            <div class="mb-2 rounded-full bg-green-100 p-3">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">New Post</span>
          </NuxtLink>
          <NuxtLink
            to="/files"
            class="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-purple-500 hover:bg-purple-50"
          >
            <div class="mb-2 rounded-full bg-purple-100 p-3">
              <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">Upload File</span>
          </NuxtLink>
          <button
            class="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-orange-500 hover:bg-orange-50"
          >
            <div class="mb-2 rounded-full bg-orange-100 p-3">
              <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useUsers } from '~/composables/useUsers'
import { usePosts } from '~/composables/usePosts'
import { useFiles } from '~/composables/useFiles'

useHead({
  title: 'Dashboard - Admin Panel'
})

const { users, fetchUsers } = useUsers ? useUsers() : { users: ref([]), fetchUsers: () => {} }
const { posts, fetchPosts } = usePosts()
const { files, fetchFiles, storageStats } = useFiles()

const storageUsed = computed(() => {
  if (storageStats.value && storageStats.value.images && storageStats.value.documents && storageStats.value.videos && storageStats.value.others) {
    const total = storageStats.value.images.size + storageStats.value.documents.size + storageStats.value.videos.size + storageStats.value.others.size
    // Convert bytes to GB with 1 decimal
    return (total / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }
  return '0 GB'
})

onMounted(() => {
  fetchUsers && fetchUsers()
  fetchPosts()
  fetchFiles('uploads')
})
</script>
