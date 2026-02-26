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
import { useActivityLog } from '~/composables/useActivityLog'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export interface Reservation {
  id?: string
  customerId?: string
  customerName: string
  phone: string
  partySize: number
  tableIds: string[]
  startTime: Timestamp
  endTime: Timestamp
  status: ReservationStatus
  depositAmount?: number
  depositPaid?: boolean
  notes?: string
  createdAt?: Timestamp
  createdBy?: string
}

export const useReservations = () => {
  const { firestore } = useFirebase()
  const { user } = useAuth()
  const { logActivity } = useActivityLog()
  const reservations = useState<Reservation[]>('reservations', () => [])
  const loading = useState<boolean>('reservations-loading', () => false)
  const error = useState<string | null>('reservations-error', () => null)

  const RESERVATION_COLLECTION = 'reservations'

  // CRUD for Reservations
  const fetchReservations = async () => {
    if (!firestore) return []
    loading.value = true
    error.value = null
    try {
      const reservationsRef = collection(firestore, RESERVATION_COLLECTION)
      const q = query(reservationsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      reservations.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reservation[]
      return reservations.value
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch reservations'
      return []
    } finally {
      loading.value = false
    }
  }

  const getReservation = async (id: string) => {
    if (!firestore) return null
    try {
      const docRef = doc(firestore, RESERVATION_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Reservation
      }
      return null
    } catch (e: any) {
      error.value = e.message || 'Failed to get reservation'
      return null
    }
  }

  const createReservation = async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const reservationsRef = collection(firestore, RESERVATION_COLLECTION)
      const newReservationData = {
        ...reservationData,
        createdAt: serverTimestamp(),
        createdBy: user.value?.uid || '',
      }
      const docRef = await addDoc(reservationsRef, newReservationData)
      const newReservation: Reservation = { id: docRef.id, ...reservationData }
      reservations.value = [newReservation, ...reservations.value]
      await logActivity({
        action: 'reservation.create',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'reservation',
        targetId: docRef.id,
        status: 'success',
        severity: 'info',
        message: `Created reservation for ${reservationData.customerName}`,
        changes: { before: null, after: { ...newReservation } },
        metadata: { customerName: reservationData.customerName },
      })
      return newReservation
    } catch (e: any) {
      error.value = e.message || 'Failed to create reservation'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateReservation = async (id: string, reservationData: Partial<Reservation>) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, RESERVATION_COLLECTION, id)
      await updateDoc(docRef, { ...reservationData })
      reservations.value = reservations.value.map(res => res.id === id ? { ...res, ...reservationData } : res)
      const affectedReservation = reservations.value.find(res => res.id === id)
      await logActivity({
        action: 'reservation.update',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'reservation',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Updated reservation for ${reservationData.customerName || affectedReservation?.customerName || ''}`,
        changes: { before: affectedReservation, after: { ...affectedReservation, ...reservationData } },
        metadata: { customerName: reservationData.customerName || affectedReservation?.customerName || '' },
      })
      return { id, ...reservationData }
    } catch (e: any) {
      error.value = e.message || 'Failed to update reservation'
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteReservation = async (id: string) => {
    if (!firestore) throw new Error('Firestore not initialized')
    loading.value = true
    error.value = null
    try {
      const docRef = doc(firestore, RESERVATION_COLLECTION, id)
      await deleteDoc(docRef)
      const deletedReservation = reservations.value.find(res => res.id === id)
      await logActivity({
        action: 'reservation.delete',
        actorId: user.value?.uid || '',
        actorType: user.value?.role || 'user',
        targetType: 'reservation',
        targetId: id,
        status: 'success',
        severity: 'info',
        message: `Deleted reservation for ${deletedReservation?.customerName || ''}`,
        changes: { before: deletedReservation, after: null },
        metadata: { customerName: deletedReservation?.customerName || '' },
      })
      reservations.value = reservations.value.filter(res => res.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete reservation'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    getReservation,
    createReservation,
    updateReservation,
    deleteReservation,
  }
}
