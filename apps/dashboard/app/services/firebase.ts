/**
 * Firebase Service - Singleton access to Firebase instances
 * 
 * This service provides access to Firebase instances initialized by the plugin.
 * Use this in other services for raw Firebase operations.
 */

import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import { collection, doc, type CollectionReference, type DocumentReference, type Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

const CLIENTS_ROOT = 'clients'

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

/**
 * Read the per-deployment client (restaurant) ID from runtime config.
 * Throws if CLIENT_ID is not set — every deployment must be scoped to one client.
 */
export const getClientId = (): string => {
  const config = useRuntimeConfig()
  const clientId = (config.public.clientId as string | undefined)?.trim()
  if (!clientId) {
    throw new Error('Client ID not configured. Set CLIENT_ID in the environment.')
  }
  return clientId
}

/**
 * Reference to the parent doc at clients/{clientId} itself
 * (the tenant metadata doc owned by the super-admin app).
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

/**
 * Prefix a Storage path with the current client ID, e.g. "uploads" → "clients/{clientId}/uploads".
 */
export const clientStoragePath = (path: string): string => {
  const cleaned = String(path || '').replace(/^\/+|\/+$/g, '')
  const base = `${CLIENTS_ROOT}/${getClientId()}`
  return cleaned ? `${base}/${cleaned}` : base
}
