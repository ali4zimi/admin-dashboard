/**
 * Firebase Service - Singleton access to Firebase instances
 *
 * Initializes the Firebase app on first use and provides access to
 * Firestore for server-side API routes.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore as getFirestoreSdk, type Firestore } from 'firebase/firestore'

export interface FirebaseInstances {
  firebase: FirebaseApp | undefined
  firestore: Firestore | undefined
}

let firebaseApp: FirebaseApp | undefined
let firestore: Firestore | undefined

const initializeFirebase = () => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId,
  }

  firebaseApp = getApps()[0] || initializeApp(firebaseConfig)
  firestore = getFirestoreSdk(firebaseApp)
}

/**
 * Get Firebase instances - initializes on first use
 */
export const getFirebaseInstances = (): FirebaseInstances => {
  if (!firebaseApp || !firestore) {
    initializeFirebase()
  }

  return {
    firebase: firebaseApp,
    firestore,
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
