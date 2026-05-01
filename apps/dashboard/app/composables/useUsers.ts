/**
 * Users Composable - Thin wrapper around Users Store
 *
 * Provides a convenient API for components to interact with user data.
 * Use this composable in components instead of directly using the store.
 */

import { storeToRefs } from 'pinia'
import { useUsersStore } from '~/stores/users.store'
import type {
  UserData,
  UserRole,
  UserStatus,
  CreateUserData,
  UpdateUserData,
} from '@restaurant-platform/types/user.types'

export const useUsers = () => {
  const store = useUsersStore()
  const { users, loading, error } = storeToRefs(store)

  return {
    // State (reactive refs)
    users,
    loading,
    error,

    // Actions
    fetchUsers: (forceRefresh = false) => store.fetchUsers(forceRefresh),
    getUser: (id: string) => store.getUser(id),
    createUser: (data: CreateUserData) => store.createUser(data),
    updateUser: (id: string, data: UpdateUserData) => store.updateUser(id, data),
    deleteUser: (id: string) => store.deleteUser(id),
    searchUsers: (searchTerm: string, role?: string, status?: string) =>
      store.searchUsers(searchTerm, role, status),

    // Cache management
    invalidateCache: () => store.invalidateCache(),
    clearStore: () => store.clearStore(),

    // Getters
    getUserById: store.getUserById,
    getUsersByRole: store.getUsersByRole,
    getUsersByStatus: store.getUsersByStatus,
  }
}
