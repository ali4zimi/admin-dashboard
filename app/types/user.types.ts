import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'Admin' | 'Editor' | 'User'
export type UserStatus = 'Active' | 'Inactive'

export interface UserData {
  id?: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  joined?: Timestamp | Date
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type CreateUserData = Omit<UserData, 'id' | 'createdAt' | 'updatedAt' | 'joined'>
export type UpdateUserData = Partial<UserData>
