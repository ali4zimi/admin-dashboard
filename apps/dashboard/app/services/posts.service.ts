/**
 * Posts Service - Raw Firebase operations for posts.
 * All paths are scoped to clients/{clientId} via the helpers in ./firebase.
 */

import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { clientCol, clientDoc } from './firebase'
import type { PostData, CreatePostData, UpdatePostData } from '@restaurant-platform/types/post.types'

const COLLECTION_NAME = 'posts'

type ServiceCreatePostData = CreatePostData & {
  author: string
  authorId: string
  gradient: string
}

export const fetchAllPosts = async (): Promise<PostData[]> => {
  const postsRef = clientCol(COLLECTION_NAME)
  const q = query(postsRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as PostData[]
}

export const fetchPostById = async (id: string): Promise<PostData | null> => {
  const docRef = clientDoc(COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PostData
  }

  return null
}

export const createPost = async (postData: ServiceCreatePostData): Promise<PostData> => {
  const postsRef = clientCol(COLLECTION_NAME)

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

export const updatePost = async (id: string, postData: UpdatePostData): Promise<void> => {
  const docRef = clientDoc(COLLECTION_NAME, id)

  await updateDoc(docRef, {
    ...postData,
    updatedAt: serverTimestamp(),
  })
}

export const deletePost = async (id: string): Promise<void> => {
  const docRef = clientDoc(COLLECTION_NAME, id)
  await deleteDoc(docRef)
}
