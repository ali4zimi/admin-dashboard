/**
 * Firebase Service - Singleton access to Firebase instances
 * 
 * This service provides access to Firebase instances initialized by the plugin.
 * Use this in other services for raw Firebase operations.
 */

import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

export interface FirebaseInstances {
  firebase: FirebaseApp | undefined
  auth: Auth | undefined
  firestore: Firestore | undefined
  storage: FirebaseStorage | undefined
}

/**
 * Get Firebase instances from the Nuxt app context
 */
export const getFirebaseInstances = (): FirebaseInstances => {
  const nuxtApp = useNuxtApp()
  
  return {
    firebase: nuxtApp.$firebase as FirebaseApp | undefined,
    auth: nuxtApp.$auth as Auth | undefined,
    firestore: nuxtApp.$firestore as Firestore | undefined,
    storage: nuxtApp.$storage as FirebaseStorage | undefined,
  }
}

/**
 * Get Firestore instance - throws if not initialized
 */
export const getFirestore = (): Firestore => {
  const { firestore } = getFirebaseInstances()
  if (!firestore) {
    throw new Error('Firestore not initialized')
  }
  return firestore
}

/**
 * Get Auth instance - throws if not initialized
 */
export const getAuth = (): Auth => {
  const { auth } = getFirebaseInstances()
  if (!auth) {
    throw new Error('Auth not initialized')
  }
  return auth
}

/**
 * Get Storage instance - throws if not initialized
 */
export const getStorage = (): FirebaseStorage => {
  const { storage } = getFirebaseInstances()
  if (!storage) {
    throw new Error('Storage not initialized')
  }
  return storage
}
