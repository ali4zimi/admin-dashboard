import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'inactive'

/**
 * Mirrors the user document shape written by the super-admin app
 * (under clients/{clientId}/users). Some fields (capabilities, disabled,
 * emailVerified, phoneNumber) are owned by the super-admin and ignored here.
 */
export interface UserData {
  id?: string
  authUid?: string
  displayName: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type CreateUserData = Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserData = Partial<UserData>
