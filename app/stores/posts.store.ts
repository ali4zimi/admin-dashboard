/**
 * Posts Store - Global state management for posts
 *
 * Uses PostsService for Firebase operations.
 * Handles caching, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as PostsService from '~/services/posts.service'
import type {
  PostData,
  PostCategory,
  PostStatus,
  CreatePostData,
  UpdatePostData,
} from '~/types/post.types'

const GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-green-400 to-green-600',
  'from-orange-400 to-orange-600',
  'from-teal-400 to-teal-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-red-400 to-red-600',
]

const getRandomGradient = () => GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)] || 'from-blue-400 to-blue-600'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as PostData[],
    loading: false,
    error: null as string | null,
    lastFetched: null as number | null,
    cacheDuration: 5 * 60 * 1000,
  }),

  getters: {
    isCacheValid: (state) => {
      if (!state.lastFetched) return false
      return Date.now() - state.lastFetched < state.cacheDuration
    },

    getPostById: (state) => (id: string) => {
      return state.posts.find((post) => post.id === id)
    },

    getPostsByCategory: (state) => (category: PostCategory) => {
      return state.posts.filter((post) => post.category === category)
    },

    getPostsByStatus: (state) => (status: PostStatus) => {
      return state.posts.filter((post) => post.status === status)
    },
  },

  actions: {
    async fetchPosts(forceRefresh = false) {
      if (!forceRefresh && this.isCacheValid && this.posts.length > 0) {
        return this.posts
      }

      this.loading = true
      this.error = null

      try {
        this.posts = await PostsService.fetchAllPosts()
        this.lastFetched = Date.now()
        return this.posts
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch posts'
        return []
      } finally {
        this.loading = false
      }
    },

    async getPost(id: string) {
      const cachedPost = this.getPostById(id)
      if (cachedPost) return cachedPost

      try {
        const post = await PostsService.fetchPostById(id)
        if (post && !this.posts.find((p) => p.id === id)) {
          this.posts.push(post)
        }
        return post
      } catch (e: any) {
        this.error = e.message || 'Failed to get post'
        return null
      }
    },

    async createPost(postData: CreatePostData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const authorName = actorUser?.displayName || actorUser?.email?.split('@')[0] || 'Unknown'

        const newPost = await PostsService.createPost({
          ...postData,
          author: authorName,
          authorId: actorUser?.uid || '',
          gradient: getRandomGradient(),
        })

        this.posts = [newPost, ...this.posts]

        await logActivity({
          action: 'post.create',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'post',
          targetId: newPost.id || '',
          status: 'success',
          severity: 'info',
          message: `${authorName} created post "${postData.title}"`,
          changes: { before: null, after: { ...newPost } },
          metadata: {
            title: postData.title,
            author: authorName,
          },
        })

        return newPost
      } catch (e: any) {
        this.error = e.message || 'Failed to create post'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updatePost(id: string, postData: UpdatePostData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const beforePost = this.posts.find((post) => post.id === id)

        await PostsService.updatePost(id, postData)

        this.posts = this.posts.map((post) =>
          post.id === id ? { ...post, ...postData } : post
        )

        const afterPost = this.posts.find((post) => post.id === id)
        const actorName = actorUser?.displayName || actorUser?.email || ''

        await logActivity({
          action: 'post.update',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'post',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `${actorName} updated post "${postData.title || afterPost?.title || ''}"`,
          changes: { before: beforePost, after: afterPost },
          metadata: {
            title: postData.title || afterPost?.title || '',
            author: afterPost?.author || '',
          },
        })

        return { id, ...postData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update post'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deletePost(id: string) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const deletedPost = this.posts.find((post) => post.id === id)

        await PostsService.deletePost(id)

        const actorName = actorUser?.displayName || actorUser?.email || ''
        await logActivity({
          action: 'post.delete',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'post',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `${actorName} deleted post "${deletedPost?.title || ''}"`,
          changes: { before: deletedPost, after: null },
          metadata: {
            title: deletedPost?.title || '',
            author: deletedPost?.author || '',
          },
        })

        this.posts = this.posts.filter((post) => post.id !== id)
        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete post'
        throw e
      } finally {
        this.loading = false
      }
    },

    async searchPosts(searchTerm: string, category?: string, status?: string) {
      this.loading = true
      this.error = null

      try {
        const posts = await PostsService.fetchAllPosts()
        let results = posts

        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          results = results.filter(
            (post) =>
              post.title.toLowerCase().includes(term) ||
              post.excerpt.toLowerCase().includes(term) ||
              post.author.toLowerCase().includes(term)
          )
        }

        if (category && category !== 'All Categories') {
          results = results.filter((post) => post.category === category)
        }

        if (status && status !== 'All Status') {
          results = results.filter((post) => post.status === status)
        }

        this.posts = results
        this.lastFetched = Date.now()
        return results
      } catch (e: any) {
        this.error = e.message || 'Failed to search posts'
        return []
      } finally {
        this.loading = false
      }
    },

    invalidateCache() {
      this.lastFetched = null
    },

    clearStore() {
      this.posts = []
      this.lastFetched = null
      this.error = null
    },
  },
})
