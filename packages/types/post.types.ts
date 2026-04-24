import type { Timestamp } from 'firebase/firestore'

export type PostCategory = 'Technology' | 'Business' | 'Design' | 'Marketing'
export type PostStatus = 'Published' | 'Draft' | 'Archived'

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
