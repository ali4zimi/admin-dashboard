/**
 * Reservations Composable - Thin wrapper around Reservations Store
 */

import { storeToRefs } from 'pinia'
import { useReservationsStore } from '~/stores/reservations.store'
import type {
  CreateReservationData,
  UpdateReservationData,
} from '@restaurant-platform/types/reservation.types'

export const useReservations = () => {
  const store = useReservationsStore()
  const { reservations, loading, error } = storeToRefs(store)

  return {
    reservations,
    loading,
    error,
    fetchReservations: (forceRefresh = false) => store.fetchReservations(forceRefresh),
    getReservation: (id: string) => store.getReservation(id),
    createReservation: (data: CreateReservationData) => store.createReservation(data),
    updateReservation: (id: string, data: UpdateReservationData) => store.updateReservation(id, data),
    deleteReservation: (id: string) => store.deleteReservation(id),
    invalidateCache: () => store.invalidateCache(),
    clearStore: () => store.clearStore(),
    getReservationById: store.getReservationById,
    getReservationsByStatus: store.getReservationsByStatus,
  }
}
