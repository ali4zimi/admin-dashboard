<template>
  <div>
    <PageHeader title="Posts" description="Create and manage your content.">
      <template #actions>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          </template>
          New Post
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <label for="posts-search" class="sr-only">Search posts</label>
        <input
          id="posts-search"
          v-model="searchTerm"
          type="text"
          placeholder="Search posts..."
          class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="debouncedSearch"
        />
        <button
          v-if="searchTerm"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Clear search"
          @click="searchTerm = ''; handleSearch()"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>
      <div class="flex gap-2">
        <select
          v-model="filterCategory"
          aria-label="Filter by category"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option value="All Categories">All Categories</option>
          <option v-for="c in POST_CATEGORIES" :key="c" :value="c">{{ c }}</option>
        </select>
        <select
          v-model="filterStatus"
          aria-label="Filter by status"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="handleSearch"
        >
          <option value="All Status">All Status</option>
          <option v-for="s in POST_STATUSES" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
        <button
          type="button"
          :aria-pressed="viewMode === 'grid'"
          aria-label="Grid view"
          :class="[
            'rounded-md p-1.5 transition-colors',
            viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
          ]"
          @click="viewMode = 'grid'"
        >
          <Icon name="lucide:layout-grid" class="h-4 w-4" />
        </button>
        <button
          type="button"
          :aria-pressed="viewMode === 'list'"
          aria-label="List view"
          :class="[
            'rounded-md p-1.5 transition-colors',
            viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
          ]"
          @click="viewMode = 'list'"
        >
          <Icon name="lucide:list" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Loading skeletons -->
    <CardGridSkeleton v-if="loading && viewMode === 'grid'" :count="6" :cols="3" />
    <TableSkeleton v-else-if="loading && viewMode === 'list'" :columns="6" :rows="6" />

    <!-- Empty state -->
    <EmptyState v-else-if="posts.length === 0" title="No posts found" description="Get started by creating your first post.">
      <template #icon>
        <Icon name="lucide:file-text" class="h-6 w-6 text-gray-400" />
      </template>
      <template #action>
        <BaseButton variant="primary" @click="openAddModal">
          <template #icon-left>
            <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          </template>
          New Post
        </BaseButton>
      </template>
    </EmptyState>

    <!-- Posts grid view -->
    <div v-else-if="viewMode === 'grid'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="post in filteredPosts"
        :key="post.id"
        class="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div class="h-40 w-full">
          <img v-if="post.cover" :src="post.coverThumbnail || post.cover" alt="Cover" class="h-full w-full object-cover" />
          <div v-else class="h-full w-full bg-gradient-to-br" :class="post.gradient || 'from-blue-400 to-blue-600'" />
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
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                :class="avatarColor(post.author)"
                aria-hidden="true"
              >
                {{ initials(post.author) }}
              </div>
              <span class="text-xs text-gray-500">{{ post.author }}</span>
            </div>
            <span class="text-xs text-gray-500">{{ formatDate(post.date) }}</span>
          </div>
          <div class="mt-4 flex gap-2">
            <BaseButton variant="secondary" size="sm" block @click="openEditModal(post)">Edit</BaseButton>
            <IconButton label="Delete post" tone="danger" class="border border-gray-200" @click="openDeleteModal(post)">
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </article>
    </div>

    <!-- Posts list view -->
    <BaseDataTable
      v-else-if="viewMode === 'list'"
      :columns="postColumns"
      :data="filteredPosts"
      :row-key="(p) => p.id ?? ''"
      empty-title="No posts found"
      empty-description="Adjust the filter or create a post."
    />

    <PostFormModal
      v-model="showPostModal"
      :post="selectedPost"
      @saved="handlePostSaved"
    />

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
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { POST_CATEGORIES, POST_STATUSES, type PostData, type PostStatus } from '@restaurant-platform/types/post.types'
import BaseBadge from '~/components/base/BaseBadge.vue'
import IconButton from '~/components/base/IconButton.vue'
import { Icon } from '#components'

useHead({ title: 'Posts - Admin Panel' })

const { posts, loading, fetchPosts, searchPosts, deletePost } = usePosts()
const toast = useToast()

const postStatusColor = (status: PostStatus): 'green' | 'yellow' | 'gray' => {
  if (status === 'Published') return 'green'
  if (status === 'Draft') return 'yellow'
  return 'gray'
}

const searchTerm = ref('')
const filterCategory = ref('All Categories')
const filterStatus = ref('All Status')
const viewMode = ref<'grid' | 'list'>('grid')

const showPostModal = ref(false)
const showDeleteModal = ref(false)
const selectedPost = ref<PostData | null>(null)
const postToDelete = ref<PostData | null>(null)

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(handleSearch, 300)
}

const handleSearch = () => {
  searchPosts(searchTerm.value, filterCategory.value, filterStatus.value)
}

const filteredPosts = computed(() => posts.value)

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
  toast.success(selectedPost.value ? 'Post updated' : 'Post created')
}

const handlePostDeleted = async () => {
  const title = postToDelete.value?.title || 'Post'
  if (postToDelete.value?.id) {
    try {
      await deletePost(postToDelete.value.id)
      toast.success(`${title} deleted`)
    } catch (e) {
      toast.error('Failed to delete post', e instanceof Error ? e.message : undefined)
    }
  }
  postToDelete.value = null
}

const initials = (name: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  const last = parts[parts.length - 1]
  if (!first) return '?'
  if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase()
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
}

const avatarPalette = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-orange-500']
const avatarColor = (name: string): string => {
  const n = name || ''
  let hash = 0
  for (let i = 0; i < n.length; i++) hash = (hash * 31 + n.charCodeAt(i)) | 0
  return avatarPalette[Math.abs(hash) % avatarPalette.length] ?? avatarPalette[0]!
}

const formatDate = (date: any) => {
  if (!date) return '-'
  if (date?.toDate) date = date.toDate()
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const dateValue = (date: any): number => {
  if (!date) return 0
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

const postColumns: ColumnDef<PostData, any>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const post = row.original
      const cover = post.cover
        ? h('div', { class: 'h-10 w-14 overflow-hidden rounded border border-gray-200 bg-gray-100' }, [
            h('img', { src: post.coverThumbnail || post.cover, alt: post.title, class: 'h-full w-full object-cover' }),
          ])
        : h('div', { class: ['h-10 w-14 rounded bg-gradient-to-br', post.gradient || 'from-blue-400 to-blue-600'] })
      return h('div', { class: 'flex items-center gap-3' }, [
        cover,
        h('span', { class: 'truncate text-sm font-medium text-gray-900' }, post.title),
      ])
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) => h('span', { class: 'text-sm text-gray-500' }, String(getValue() || '')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(BaseBadge as any, { color: postStatusColor(row.original.status) }, () => row.original.status),
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ getValue }) => h('span', { class: 'text-sm text-gray-500' }, String(getValue() || '')),
  },
  {
    id: 'date',
    header: 'Date',
    accessorFn: (row) => dateValue(row.date),
    cell: ({ row }) => h('span', { class: 'text-sm text-gray-500' }, formatDate(row.original.date)),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    meta: { align: 'right' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end space-x-2' }, [
        h(
          IconButton as any,
          { label: 'Edit post', tone: 'primary', onClick: () => openEditModal(row.original) },
          () => h(Icon as any, { name: 'lucide:pencil', class: 'h-4 w-4' }),
        ),
        h(
          IconButton as any,
          { label: 'Delete post', tone: 'danger', onClick: () => openDeleteModal(row.original) },
          () => h(Icon as any, { name: 'lucide:trash-2', class: 'h-4 w-4' }),
        ),
      ]),
  },
]

onMounted(() => {
  fetchPosts()
})
</script>
