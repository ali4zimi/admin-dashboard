/**
 * Posts Service - Raw Firebase operations for posts
 *
 * This service contains only Firebase CRUD operations.
 * No state management, no activity logging - those belong in the store.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirestore } from './firebase'
import type { PostData, CreatePostData, UpdatePostData } from '~/types/post.types'

const COLLECTION_NAME = 'posts'

type ServiceCreatePostData = CreatePostData & {
  author: string
  authorId: string
  gradient: string
}

/**
 * Fetch all posts ordered by creation date
 */
export const fetchAllPosts = async (): Promise<PostData[]> => {
  const firestore = getFirestore()
  const postsRef = collection(firestore, COLLECTION_NAME)
  const q = query(postsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as PostData[]
}

/**
 * Fetch a single post by ID
 */
export const fetchPostById = async (id: string): Promise<PostData | null> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PostData
  }

  return null
}

/**
 * Create a new post
 * Returns the created post with its ID
 */
export const createPost = async (postData: ServiceCreatePostData): Promise<PostData> => {
  const firestore = getFirestore()
  const postsRef = collection(firestore, COLLECTION_NAME)

  const newPostData = {
    ...postData,
    date: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(postsRef, newPostData)

  return {
    id: docRef.id,
    ...postData,
    date: new Date(),
  }
}

/**
 * Update an existing post
 */
export const updatePost = async (id: string, postData: UpdatePostData): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)

  await updateDoc(docRef, {
    ...postData,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a post by ID
 */
export const deletePost = async (id: string): Promise<void> => {
  const firestore = getFirestore()
  const docRef = doc(firestore, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}
