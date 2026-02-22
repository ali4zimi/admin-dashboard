import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'

export const useActivityLog = () => {
  const { firestore } = useFirebase()

  /**
   * Log an activity event with a rich, extensible structure.
   * @param log Object with fields:
   *   - action: string (e.g. 'file.delete', 'user.create')
   *   - actorId: string (who performed the action)
   *   - actorType: string (e.g. 'admin', 'user', 'system')
   *   - targetType: string (e.g. 'file', 'user', 'post')
   *   - targetId: string (id of the main entity affected)
   *   - timestamp: serverTimestamp() (auto-filled)
   *   - status: string (e.g. 'success', 'fail')
   *   - severity: string (e.g. 'info', 'warning', 'error')
   *   - message: string (human readable summary)
   *   - changes: { before: any, after: any } (optional)
   *   - metadata: object (optional, extra context)
   *   - ipAddress: string (optional)
   *   - userAgent: string (optional)
   */
  const logActivity = async (log: {
    action: string
    actorId: string
    actorType: string
    targetType: string
    targetId: string
    status?: string
    severity?: string
    message?: string
    changes?: { before: any, after: any } | null
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    [key: string]: any
  }) => {
    if (!firestore) return
    try {
      await addDoc(collection(firestore, 'activityLog'), {
        ...log,
        timestamp: serverTimestamp(),
      })
    } catch (err) {
      console.error('Error logging activity:', err)
    }
  }

  return { logActivity }
}
