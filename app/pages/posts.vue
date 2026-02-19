<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Posts</h1>
        <p class="text-gray-600">Create and manage your content.</p>
      </div>
      <button
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        New Post
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="flex-1">
        <input
          type="text"
          placeholder="Search posts..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div class="flex gap-2">
        <select class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>All Categories</option>
          <option>Technology</option>
          <option>Business</option>
          <option>Design</option>
          <option>Marketing</option>
        </select>
        <select class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
      </div>
    </div>

    <!-- Posts grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="post in posts"
        :key="post.id"
        class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="h-40 bg-gradient-to-br" :class="post.gradient"></div>
        <div class="p-4">
          <div class="mb-2 flex items-center justify-between">
            <span
              :class="[
                'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                post.status === 'Published' ? 'bg-green-100 text-green-800' :
                post.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              ]"
            >
              {{ post.status }}
            </span>
            <span class="text-xs text-gray-500">{{ post.category }}</span>
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900">{{ post.title }}</h3>
          <p class="mb-4 line-clamp-2 text-sm text-gray-600">{{ post.excerpt }}</p>
          <div class="flex items-center justify-between border-t border-gray-100 pt-4">
            <div class="flex items-center space-x-2">
              <img
                :src="`https://ui-avatars.com/api/?name=${post.author.replace(' ', '+')}&size=24&background=random`"
                :alt="post.author"
                class="h-6 w-6 rounded-full"
              />
              <span class="text-xs text-gray-500">{{ post.author }}</span>
            </div>
            <span class="text-xs text-gray-500">{{ post.date }}</span>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Edit
            </button>
            <button class="rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-600">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Load more -->
    <div class="mt-8 text-center">
      <button class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
        Load More Posts
        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Posts - Admin Panel'
})

const posts = ref([
  {
    id: 1,
    title: 'Getting Started with Vue 3',
    excerpt: 'Learn the basics of Vue 3 and its composition API for building modern web applications.',
    author: 'John Doe',
    date: 'Feb 18, 2026',
    status: 'Published',
    category: 'Technology',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 2,
    title: 'Mastering Tailwind CSS',
    excerpt: 'A comprehensive guide to building beautiful UIs with Tailwind CSS utility classes.',
    author: 'Jane Smith',
    date: 'Feb 17, 2026',
    status: 'Published',
    category: 'Design',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 3,
    title: 'Building Admin Dashboards',
    excerpt: 'Best practices for creating user-friendly and efficient admin dashboard interfaces.',
    author: 'Bob Wilson',
    date: 'Feb 16, 2026',
    status: 'Draft',
    category: 'Design',
    gradient: 'from-green-400 to-green-600'
  },
  {
    id: 4,
    title: 'Marketing Strategies 2026',
    excerpt: 'Discover the latest marketing trends and strategies to grow your business in 2026.',
    author: 'Alice Brown',
    date: 'Feb 15, 2026',
    status: 'Published',
    category: 'Marketing',
    gradient: 'from-orange-400 to-orange-600'
  },
  {
    id: 5,
    title: 'Nuxt.js Best Practices',
    excerpt: 'Learn how to build scalable and maintainable applications with Nuxt.js framework.',
    author: 'Charlie Davis',
    date: 'Feb 14, 2026',
    status: 'Draft',
    category: 'Technology',
    gradient: 'from-teal-400 to-teal-600'
  },
  {
    id: 6,
    title: 'Business Growth Tips',
    excerpt: 'Essential tips and strategies for scaling your business effectively.',
    author: 'Diana Evans',
    date: 'Feb 13, 2026',
    status: 'Archived',
    category: 'Business',
    gradient: 'from-pink-400 to-pink-600'
  },
])
</script>
