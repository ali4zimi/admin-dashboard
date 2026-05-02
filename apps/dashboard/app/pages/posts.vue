<template>
  <div>
    <PageHeader title="Posts" description="Create and manage your content.">
      <template #actions>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </template>
          New Post
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="flex-1">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search posts..."
          class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="debouncedSearch"
        />
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterCategory"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option>All Categories</option>
          <option>Technology</option>
          <option>Business</option>
          <option>Design</option>
          <option>Marketing</option>
        </select>
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button
          :class="[
            'rounded-lg p-2 transition-colors',
            viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
          ]"
          @click="viewMode = 'grid'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          :class="[
            'rounded-lg p-2 transition-colors',
            viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
          ]"
          @click="viewMode = 'list'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
      </div>

    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <BaseSpinner />
    </div>

    <!-- Empty state -->
    <EmptyState v-else-if="posts.length === 0" title="No posts found" description="Get started by creating your first post.">
      <template #icon>
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </template>
          New Post
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Posts grid view -->
    <div v-if="viewMode === 'grid'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="post in filteredPosts"
        :key="post.id"
        class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="h-40 w-full relative">
          <img v-if="post.cover" :src="post.coverThumbnail || post.cover" alt="Cover" class="object-cover w-full h-full" />
          <div v-else class="h-40 bg-gradient-to-br w-full" :class="post.gradient || 'from-blue-400 to-blue-600'"></div>
        </div>
        <div class="p-4">
          <div class="mb-2 flex items-center justify-between">
            <BaseBadge :color="postStatusColor(post.status)">{{ post.status }}</BaseBadge>
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
            <span class="text-xs text-gray-500">{{ formatDate(post.date) }}</span>
          </div>
          <div class="mt-4 flex gap-2">
            <BaseButton variant="secondary" size="sm" block @click="openEditModal(post)">
              Edit
            </BaseButton>
            <IconButton label="Delete post" tone="danger" class="border border-gray-200" @click="openDeleteModal(post)">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Posts list view -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Author</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="post in filteredPosts" :key="post.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div v-if="post.cover" class="h-10 w-14 overflow-hidden rounded border border-gray-200 bg-gray-100">
                  <img
                    :src="post.coverThumbnail || post.cover"
                    :alt="post.title"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div v-else class="h-10 w-14 rounded bg-gradient-to-br" :class="post.gradient || 'from-blue-400 to-blue-600'"></div>
                <span class="truncate text-sm font-medium text-gray-900">{{ post.title }}</span>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ post.category }}</td>
            <td class="whitespace-nowrap px-6 py-4">
              <BaseBadge :color="postStatusColor(post.status)">{{ post.status }}</BaseBadge>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ post.author }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ formatDate(post.date) }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
              <div class="flex justify-end space-x-2">
                <BaseButton variant="ghost" size="sm" @click="openEditModal(post)">Edit</BaseButton>
                <BaseButton variant="ghost" size="sm" class="hover:text-red-600" @click="openDeleteModal(post)">Delete</BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Results info -->
    <div v-if="posts.length > 0" class="mt-6 text-center">
      <p class="text-sm text-gray-500">Showing {{ posts.length }} posts</p>
    </div>

    <!-- Post Form Modal -->
    <PostFormModal
      v-model="showPostModal"
      :post="selectedPost"
      @saved="handlePostSaved"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      v-model="showDeleteModal"
      :item-id="postToDelete?.id || null"
      :item-name="postToDelete?.title || ''"
      item-type="Post"
      @confirm="handlePostDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import type { PostData } from '@restaurant-platform/types/post.types'

useHead({
  title: 'Posts - Admin Panel'
})

const { posts, loading, fetchPosts, searchPosts, deletePost } = usePosts()

const postStatusColor = (status: string): 'green' | 'yellow' | 'gray' => {
  if (status === 'Published') return 'green'
  if (status === 'Draft') return 'yellow'
  return 'gray'
}

// Search and filters
const searchTerm = ref('')
const filterCategory = ref('All Categories')
const filterStatus = ref('All Status')

// View mode
const viewMode = ref<'grid' | 'list'>('grid')

// Modal states
const showPostModal = ref(false)
const showDeleteModal = ref(false)
const selectedPost = ref<PostData | null>(null)
const postToDelete = ref<PostData | null>(null)

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 300)
}

const handleSearch = () => {
  searchPosts(searchTerm.value, filterCategory.value, filterStatus.value)
}

// Filtered posts based on search and filters
const filteredPosts = computed(() => {
  // posts is reactive, so just return it
  return posts.value
})

// Modal handlers
const openAddModal = () => {
  selectedPost.value = null
  showPostModal.value = true
}

const openEditModal = (post: PostData) => {
  selectedPost.value = post
  showPostModal.value = true
}

const openDeleteModal = (post: PostData) => {
  postToDelete.value = post
  showDeleteModal.value = true
}

const handlePostSaved = () => {
  // Posts list is automatically updated by the composable
}

const handlePostDeleted = async () => {
  if (postToDelete.value?.id) {
    await deletePost(postToDelete.value.id)
  }
  postToDelete.value = null
}

// Format date helper
const formatDate = (date: any) => {
  if (!date) return '-'

  // Handle Firestore Timestamp
  if (date?.toDate) {
    date = date.toDate()
  }

  // Handle Date object or string
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Fetch posts on mount
onMounted(() => {
  fetchPosts()
})
</script>
