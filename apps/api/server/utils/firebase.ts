/**
 * Firebase Service - Singleton access to Firebase instances
 *
 * Initializes the Firebase app on first use and provides access to
 * Firestore for server-side API routes.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  collection,
  doc,
  getFirestore as getFirestoreSdk,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore'

const CLIENTS_ROOT = 'clients'

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

/**
 * Read the per-deployment client (restaurant) ID from runtime config.
 * Throws if CLIENT_ID is not set — every deployment must be scoped to one client.
 */
export const getClientId = (): string => {
  const config = useRuntimeConfig()
  const clientId = (config.clientId as string | undefined)?.trim()
  if (!clientId) {
    throw new Error('Client ID not configured. Set CLIENT_ID in the environment.')
  }
  return clientId
}

/**
 * Reference to the parent doc at clients/{clientId}.
 */
export const clientRootDoc = (): DocumentReference => {
  const firestore = getFirestore()
  return doc(firestore, CLIENTS_ROOT, getClientId())
}

/**
 * Build a Firestore CollectionReference scoped to clients/{clientId}/...segments.
 * Pass an odd number of segments (collection paths).
 */
export const clientCol = (...segments: [string, ...string[]]): CollectionReference => {
  const firestore = getFirestore()
  return collection(firestore, CLIENTS_ROOT, getClientId(), ...segments)
}

/**
 * Build a Firestore DocumentReference scoped to clients/{clientId}/...segments.
 * Pass an even number of segments (document paths).
 */
export const clientDoc = (...segments: [string, string, ...string[]]): DocumentReference => {
  const firestore = getFirestore()
  return doc(firestore, CLIENTS_ROOT, getClientId(), ...segments)
}
