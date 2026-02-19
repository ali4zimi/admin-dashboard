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
  type Timestamp,
} from 'firebase/firestore'

export interface PostData {
  id?: string
  title: string
  excerpt: string
  content?: string
  author: string
  authorId?: string
  category: 'Technology' | 'Business' | 'Design' | 'Marketing'
  status: 'Published' | 'Draft' | 'Archived'
  gradient?: string
  date?: Timestamp | Date
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-green-400 to-green-600',
  'from-orange-400 to-orange-600',
  'from-teal-400 to-teal-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-red-400 to-red-600',
]

export const usePosts = () => {
  const { firestore } = useFirebase()
  const { user } = useAuth()
  const posts = useState<PostData[]>('posts-list', () => [])
  const loading = useState<boolean>('posts-loading', () => false)
  const error = useState<string | null>('posts-error', () => null)

  const COLLECTION_NAME = 'posts'

  const getRandomGradient = () => {
    return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
  }

  const fetchPosts = async () => {
    if (!firestore) return []

    loading.value = true
    error.value = null

    try {
      const postsRef = collection(firestore, COLLECTION_NAME)
      const q = query(postsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)

      posts.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PostData[]

      return posts.value
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch posts'
      console.error('Error fetching posts:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  const getPost = async (id: string) => {
    if (!firestore) return null

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PostData
      }
      return null
    } catch (e: any) {
      error.value = e.message || 'Failed to get post'
      console.error('Error getting post:', e)
      return null
    }
  }

  const createPost = async (postData: Omit<PostData, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'authorId' | 'date' | 'gradient'>) => {
    if (!firestore) throw new Error('Firestore not initialized')

    loading.value = true
    error.value = null

    try {
      const postsRef = collection(firestore, COLLECTION_NAME)
      const authorName = user.value?.displayName || user.value?.email?.split('@')[0] || 'Unknown'
      
      const newPostData = {
        ...postData,
        author: authorName,
        authorId: user.value?.uid || '',
        gradient: getRandomGradient(),
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(postsRef, newPostData)

      const newPost: PostData = {
        id: docRef.id,
        ...postData,
        author: authorName,
        authorId: user.value?.uid || '',
        gradient: newPostData.gradient,
        date: new Date(),
      }

      posts.value = [newPost, ...posts.value]
      return newPost
    } catch (e: any) {
      error.value = e.message || 'Failed to create post'
      console.error('Error creating post:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updatePost = async (id: string, postData: Partial<PostData>) => {
    if (!firestore) throw new Error('Firestore not initialized')

    loading.value = true
    error.value = null

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...postData,
        updatedAt: serverTimestamp(),
      })

      posts.value = posts.value.map(post =>
        post.id === id ? { ...post, ...postData } : post
      )

      return { id, ...postData }
    } catch (e: any) {
      error.value = e.message || 'Failed to update post'
      console.error('Error updating post:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deletePost = async (id: string) => {
    if (!firestore) throw new Error('Firestore not initialized')

    loading.value = true
    error.value = null

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id)
      await deleteDoc(docRef)

      posts.value = posts.value.filter(post => post.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete post'
      console.error('Error deleting post:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const searchPosts = async (searchTerm: string, category?: string, status?: string) => {
    if (!firestore) return []

    loading.value = true
    error.value = null

    try {
      const postsRef = collection(firestore, COLLECTION_NAME)
      const q = query(postsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)

      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PostData[]

      // Client-side filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        results = results.filter(post =>
          post.title.toLowerCase().includes(term) ||
          post.excerpt.toLowerCase().includes(term) ||
          post.author.toLowerCase().includes(term)
        )
      }

      if (category && category !== 'All Categories') {
        results = results.filter(post => post.category === category)
      }

      if (status && status !== 'All Status') {
        results = results.filter(post => post.status === status)
      }

      posts.value = results
      return results
    } catch (e: any) {
      error.value = e.message || 'Failed to search posts'
      console.error('Error searching posts:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
  }
}
