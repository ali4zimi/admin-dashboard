import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'

export const useActivityLog = () => {
  const { firestore } = useFirebase()

  const logActivity = async (activity: {
    action: string
    fileName?: string
    fileId?: string
    fileType?: string
    fileSize?: number
    userId?: string
    [key: string]: any
  }) => {
    if (!firestore) return
    try {
      await addDoc(collection(firestore, 'activityLog'), {
        ...activity,
        timestamp: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error logging activity:', err)
    }
  }

  return { logActivity }
}
