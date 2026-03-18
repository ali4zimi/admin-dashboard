/**
 * Posts Composable - Thin wrapper around Posts Store
 *
 * Provides a convenient API for components to interact with post data.
 * Use this composable in components instead of directly using the store.
 */

import { storeToRefs } from 'pinia'
import { usePostsStore } from '~/stores/posts.store'
import type { PostData, CreatePostData, UpdatePostData } from '~/types/post.types'

export const usePosts = () => {
  const store = usePostsStore()
  const { posts, loading, error } = storeToRefs(store)

  return {
    posts,
    loading,
    error,
    fetchPosts: (forceRefresh = false) => store.fetchPosts(forceRefresh),
    getPost: (id: string) => store.getPost(id),
    createPost: (data: CreatePostData) => store.createPost(data),
    updatePost: (id: string, data: UpdatePostData) => store.updatePost(id, data),
    deletePost: (id: string) => store.deletePost(id),
    searchPosts: (searchTerm: string, category?: string, status?: string) =>
      store.searchPosts(searchTerm, category, status),
    invalidateCache: () => store.invalidateCache(),
    clearStore: () => store.clearStore(),
    getPostById: store.getPostById,
    getPostsByCategory: store.getPostsByCategory,
    getPostsByStatus: store.getPostsByStatus,
  }
}
