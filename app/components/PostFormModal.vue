<template>
  <BaseModal v-model="isOpen" :title="isEditing ? 'Edit Post' : 'Create New Post'" size="lg">
    <form id="post-form" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- Title -->
        <div>
          <label for="title" class="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter post title"
          />
        </div>

        <!-- Excerpt -->
        <div>
          <label for="excerpt" class="mb-1 block text-sm font-medium text-gray-700">Excerpt</label>
          <textarea
            id="excerpt"
            v-model="form.excerpt"
            required
            rows="2"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="A brief summary of your post"
          ></textarea>
        </div>

        <!-- Content -->
        <div>
          <label for="content" class="mb-1 block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            v-model="form.content"
            rows="6"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Write your post content here..."
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Category -->
          <div>
            <label for="category" class="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              v-model="form.category"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              v-model="form.status"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="isOpen = false"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="post-form"
        :disabled="loading"
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEditing ? 'Update Post' : 'Create Post' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { PostData } from '~/composables/usePosts'

interface Props {
  modelValue: boolean
  post?: PostData | null
}

const props = withDefaults(defineProps<Props>(), {
  post: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': [post: PostData]
}>()

const { createPost, updatePost } = usePosts()

const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditing = computed(() => !!props.post?.id)

const form = ref({
  title: '',
  excerpt: '',
  content: '',
  category: 'Technology' as 'Technology' | 'Business' | 'Design' | 'Marketing',
  status: 'Draft' as 'Published' | 'Draft' | 'Archived',
})

// Reset form when modal opens/closes or post changes
watch(
  () => [props.modelValue, props.post],
  () => {
    if (props.modelValue && props.post) {
      form.value = {
        title: props.post.title,
        excerpt: props.post.excerpt,
        content: props.post.content || '',
        category: props.post.category,
        status: props.post.status,
      }
    } else if (props.modelValue) {
      form.value = {
        title: '',
        excerpt: '',
        content: '',
        category: 'Technology',
        status: 'Draft',
      }
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  loading.value = true

  try {
    let savedPost: PostData

    if (isEditing.value && props.post?.id) {
      savedPost = (await updatePost(props.post.id, form.value)) as PostData
    } else {
      savedPost = await createPost(form.value)
    }

    emit('saved', savedPost)
    isOpen.value = false
  } catch (e) {
    console.error('Error saving post:', e)
  } finally {
    loading.value = false
  }
}
</script>
