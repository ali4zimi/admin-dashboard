/**
 * Users Store - Global state management for users
 *
 * Uses UsersService for Firebase operations.
 * Handles caching, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as UsersService from '~/services/users.service'
import type {
  UserData,
  UserRole,
  UserStatus,
  CreateUserData,
  UpdateUserData,
} from '~/types/user.types'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as UserData[],
    loading: false,
    error: null as string | null,
    lastFetched: null as number | null,
    // Cache duration: 5 minutes
    cacheDuration: 5 * 60 * 1000,
  }),

  getters: {
    // Check if cache is still valid
    isCacheValid: (state) => {
      if (!state.lastFetched) return false
      return Date.now() - state.lastFetched < state.cacheDuration
    },

    // Get user by ID
    getUserById: (state) => (id: string) => {
      return state.users.find((user) => user.id === id)
    },

    // Get users by role
    getUsersByRole: (state) => (role: UserRole) => {
      return state.users.filter((user) => user.role === role)
    },

    // Get users by status
    getUsersByStatus: (state) => (status: UserStatus) => {
      return state.users.filter((user) => user.status === status)
    },

    // Search users locally
    filteredUsers: (state) => (searchTerm: string, role?: string, status?: string) => {
      let results = state.users

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        results = results.filter(
          (user) =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        )
      }

      if (role && role !== 'All Roles') {
        results = results.filter((user) => user.role === role)
      }

      if (status && status !== 'All Status') {
        results = results.filter((user) => user.status === status)
      }

      return results
    },
  },

  actions: {
    ensureAdmin() {
      const { isAdmin } = useAuth()
      if (!isAdmin.value) {
        throw new Error('Only admins can manage users')
      }
    },

    async fetchUsers(forceRefresh = false) {
      if (!forceRefresh && this.isCacheValid && this.users.length > 0) {
        return this.users
      }

      this.loading = true
      this.error = null

      try {
        this.users = await UsersService.fetchAllUsers()
        this.lastFetched = Date.now()
        return this.users
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch users'
        return []
      } finally {
        this.loading = false
      }
    },

    async getUser(id: string) {
      const cachedUser = this.getUserById(id)
      if (cachedUser) return cachedUser

      try {
        const user = await UsersService.fetchUserById(id)
        if (user && !this.users.find((u) => u.id === id)) {
          this.users.push(user)
        }
        return user
      } catch (e: any) {
        this.error = e.message || 'Failed to get user'
        return null
      }
    },

    async createUser(userData: CreateUserData) {
      this.ensureAdmin()

      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const newUser = await UsersService.createUser(userData)

        this.users = [newUser, ...this.users]

        await logActivity({
          action: 'user.create',
          actorId: actorUser?.uid || newUser.id || '',
          actorType: actorUser?.role || 'user',
          targetType: 'user',
          targetId: newUser.id || '',
          status: 'success',
          severity: 'info',
          message: `User ${userData.name} created`,
          changes: { before: null, after: { ...newUser } },
          metadata: {
            name: userData.name,
            email: userData.email,
            role: userData.role,
          },
        })

        return newUser
      } catch (e: any) {
        this.error = e.message || 'Failed to create user'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateUser(id: string, userData: UpdateUserData) {
      this.ensureAdmin()

      const { user } = useAuth()
      const { currentUserProfile } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const beforeUser = this.users.find((u) => u.id === id)

        if (
          beforeUser?.id &&
          currentUserProfile.value?.id === beforeUser.id &&
          (
            userData.role === 'user' ||
            userData.status === 'inactive'
          )
        ) {
          throw new Error('Admins cannot demote or deactivate themselves')
        }

        await UsersService.updateUser(id, userData)

        this.users = this.users.map((existingUser) =>
          existingUser.id === id ? { ...existingUser, ...userData } : existingUser
        )

        const afterUser = this.users.find((u) => u.id === id)

        await logActivity({
          action: 'user.update',
          actorId: actorUser?.uid || id,
          actorType: actorUser?.role || 'user',
          targetType: 'user',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `User ${userData.name || afterUser?.name || ''} updated`,
          changes: { before: beforeUser, after: afterUser },
          metadata: {
            name: userData.name || afterUser?.name || '',
            email: userData.email || afterUser?.email || '',
            role: userData.role || afterUser?.role || '',
          },
        })

        return { id, ...userData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update user'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id: string) {
      this.ensureAdmin()

      const { user } = useAuth()
      const { currentUserProfile } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const deletedUser = this.users.find((u) => u.id === id)

        if (currentUserProfile.value?.id === id) {
          throw new Error('Admins cannot delete themselves')
        }

        await UsersService.deleteUser(id)

        await logActivity({
          action: 'user.delete',
          actorId: actorUser?.uid || id,
          actorType: actorUser?.role || 'user',
          targetType: 'user',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `User ${deletedUser?.name || ''} deleted`,
          changes: { before: deletedUser, after: null },
          metadata: {
            name: deletedUser?.name || '',
            email: deletedUser?.email || '',
            role: deletedUser?.role || '',
          },
        })

        this.users = this.users.filter((existingUser) => existingUser.id !== id)

        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete user'
        throw e
      } finally {
        this.loading = false
      }
    },

    async searchUsers(searchTerm: string, role?: string, status?: string) {
      this.loading = true
      this.error = null

      try {
        const users = await UsersService.fetchAllUsers()
        let results = users

        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          results = results.filter(
            (existingUser) =>
              existingUser.name.toLowerCase().includes(term) ||
              existingUser.email.toLowerCase().includes(term)
          )
        }

        if (role && role !== 'All Roles') {
          results = results.filter((existingUser) => existingUser.role === role)
        }

        if (status && status !== 'All Status') {
          results = results.filter((existingUser) => existingUser.status === status)
        }

        this.users = results
        this.lastFetched = Date.now()
        return results
      } catch (e: any) {
        this.error = e.message || 'Failed to search users'
        return []
      } finally {
        this.loading = false
      }
    },

    // Invalidate cache (force next fetch to go to Firebase)
    invalidateCache() {
      this.lastFetched = null
    },

    // Clear all data (useful for logout)
    clearStore() {
      this.users = []
      this.lastFetched = null
      this.error = null
    },
  },
})

