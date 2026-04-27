
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth'

import * as UsersService from '~/services/users.service'
import type { UserData } from '~/types/user.types'

export const useAuth = () => {

  const { auth } = useFirebase()
  const user = useState<User | null>('auth-user', () => null)
  const currentUserProfile = useState<UserData | null>('auth-user-profile', () => null)
  const authLoading = useState<boolean>('auth-loading', () => true)
  const error = useState<string | null>('auth-error', () => null)

  const isAdmin = computed(() => currentUserProfile.value?.role === 'admin')

  const loadCurrentUserProfile = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      currentUserProfile.value = null
      return null
    }

    let profile = await UsersService.fetchUserByUid(firebaseUser.uid)
    if (!profile && firebaseUser.email) {
      profile = await UsersService.fetchUserByEmail(firebaseUser.email)
    }

    currentUserProfile.value = profile
    return profile
  }

  const initAuth = () => {
    return new Promise<User | null>((resolve) => {
      if (!auth) {
        authLoading.value = false
        resolve(null)
        return
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser
        await loadCurrentUserProfile(firebaseUser)
        authLoading.value = false
        resolve(firebaseUser)
        unsubscribe()
      })
    })
  }

  const login = async (email: string, password: string) => {
    error.value = null

    try {
      if (!auth) throw new Error('Firebase auth not initialized')
      const result = await signInWithEmailAndPassword(auth, email, password)

      const profile = await loadCurrentUserProfile(result.user)
      if (profile && profile.status !== 'active') {
        await signOut(auth)
        user.value = null
        currentUserProfile.value = null
        const inactiveError = { code: 'auth/user-inactive' }
        error.value = getAuthErrorMessage(inactiveError.code)
        throw inactiveError
      }

      user.value = result.user
      return result.user
    } catch (e: any) {
      error.value = getAuthErrorMessage(e.code)
      throw e
    }
  }

  const register = async (email: string, password: string, displayName?: string) => {
    error.value = null

    try {
      if (!auth) throw new Error('Firebase auth not initialized')
      const result = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName && result.user) {
        await updateProfile(result.user, { displayName })
      }

      user.value = result.user

      try {
        await UsersService.createUser({
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || '',
          role: 'user',
          status: 'inactive',
        })
      } catch (err) {
        console.error('Error saving user to Firestore:', err)
      }

      return result.user
    } catch (e: any) {
      error.value = getAuthErrorMessage(e.code)
      throw e
    }
  }

  const logout = async () => {
    error.value = null

    try {
      if (!auth) throw new Error('Firebase auth not initialized')
      await signOut(auth)
      user.value = null
      currentUserProfile.value = null
      navigateTo('/login')
    } catch (e: any) {
      error.value = getAuthErrorMessage(e.code)
      throw e
    }
  }

  const getAuthErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/user-inactive': 'Your account is inactive. Please contact an admin.',
    }
    return errorMessages[code] || 'An error occurred. Please try again'
  }

  return {
    user,
    currentUserProfile,
    isAdmin,
    loading: authLoading,
    error,
    initAuth,
    login,
    register,
    logout,
    refreshCurrentUserProfile: () => loadCurrentUserProfile(user.value),
  }
}
