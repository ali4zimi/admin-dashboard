import type { Timestamp } from 'firebase/firestore'

export const POST_CATEGORIES = ['Technology', 'Business', 'Design', 'Marketing'] as const
export type PostCategory = typeof POST_CATEGORIES[number]

export const POST_STATUSES = ['Published', 'Draft', 'Archived'] as const
export type PostStatus = typeof POST_STATUSES[number]

export interface PostData {
  id?: string
  title: string
  excerpt: string
  content?: string
  author: string
  authorId?: string
  category: PostCategory
  status: PostStatus
  gradient?: string
  date?: Timestamp | Date
  createdAt?: Timestamp
  updatedAt?: Timestamp
  cover?: string
  coverThumbnail?: string
}

export type CreatePostData = Omit<
  PostData,
  'id' | 'createdAt' | 'updatedAt' | 'author' | 'authorId' | 'date' | 'gradient'
>

export type UpdatePostData = Partial<PostData>
