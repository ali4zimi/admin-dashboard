
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth'

import { useActivityLog } from '~/composables/useActivityLog'
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore'

export const useAuth = () => {

  const { auth, firestore } = useFirebase()
  const { logActivity } = useActivityLog()
  const user = useState<User | null>('auth-user', () => null)
  const authLoading = useState<boolean>('auth-loading', () => true)
  const error = useState<string | null>('auth-error', () => null)

  const initAuth = () => {
    return new Promise<User | null>((resolve) => {
      if (!auth) {
        authLoading.value = false
        resolve(null)
        return
      }

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
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
      user.value = result.user
      // Log login activity
      await logActivity({
        action: 'auth.login',
        actorId: result.user.uid,
        actorType: 'user',
        targetType: 'auth',
        targetId: result.user.uid,
        status: 'success',
        severity: 'info',
        message: `${result.user.displayName || result.user.email || 'User'} logged in`,
        metadata: {
          email: result.user.email,
        },
      })
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

      // Store user data in Firestore
      if (firestore && result.user) {
        try {
          await setDoc(doc(firestore, 'users', result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName || '',
            role: 'User', // Default role
            status: 'Active', // Default status
            joined: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        } catch (err) {
          console.error('Error saving user to Firestore:', err)
        }
      }

      // Log register activity
      await logActivity({
        action: 'auth.register',
        actorId: result.user.uid,
        actorType: 'user',
        targetType: 'auth',
        targetId: result.user.uid,
        status: 'success',
        severity: 'info',
        message: `${result.user.displayName || result.user.email || 'User'} registered`,
        metadata: {
          email: result.user.email,
        },
      })
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
      const currentUser = user.value
      await signOut(auth)
      // Log logout activity
      if (currentUser) {
        await logActivity({
          action: 'auth.logout',
          actorId: currentUser.uid,
          actorType: 'user',
          targetType: 'auth',
          targetId: currentUser.uid,
          status: 'success',
          severity: 'info',
          message: `${currentUser.displayName || currentUser.email || 'User'} logged out`,
          metadata: {
            email: currentUser.email,
          },
        })
      }
      user.value = null
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
    }
    return errorMessages[code] || 'An error occurred. Please try again'
  }

  return {
    user,
    loading: authLoading,
    error,
    initAuth,
    login,
    register,
    logout,
  }
}
