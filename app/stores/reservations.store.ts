/**
 * Reservations Store - Global state management for reservations
 *
 * Uses ReservationsService for Firebase operations.
 * Handles caching, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as ReservationsService from '~/services/reservations.service'
import type {
  CreateReservationData,
  Reservation,
  ReservationStatus,
  UpdateReservationData,
} from '~/types/reservation.types'

export const useReservationsStore = defineStore('reservations', {
  state: () => ({
    reservations: [] as Reservation[],
    loading: false,
    error: null as string | null,
    lastFetched: null as number | null,
    cacheDuration: 5 * 60 * 1000,
  }),

  getters: {
    isCacheValid: (state) => {
      if (!state.lastFetched) return false
      return Date.now() - state.lastFetched < state.cacheDuration
    },

    getReservationById: (state) => (id: string) => {
      return state.reservations.find((reservation) => reservation.id === id)
    },

    getReservationsByStatus: (state) => (status: ReservationStatus) => {
      return state.reservations.filter((reservation) => reservation.status === status)
    },
  },

  actions: {
    async fetchReservations(forceRefresh = false) {
      if (!forceRefresh && this.isCacheValid && this.reservations.length > 0) {
        return this.reservations
      }

      this.loading = true
      this.error = null

      try {
        this.reservations = await ReservationsService.fetchAllReservations()
        this.lastFetched = Date.now()
        return this.reservations
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch reservations'
        return []
      } finally {
        this.loading = false
      }
    },

    async getReservation(id: string) {
      const cachedReservation = this.getReservationById(id)
      if (cachedReservation) return cachedReservation

      try {
        const reservation = await ReservationsService.fetchReservationById(id)
        if (reservation && !this.reservations.find((existingReservation) => existingReservation.id === id)) {
          this.reservations.push(reservation)
        }
        return reservation
      } catch (e: any) {
        this.error = e.message || 'Failed to get reservation'
        return null
      }
    },

    async createReservation(reservationData: CreateReservationData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const newReservation = await ReservationsService.createReservation(
          reservationData,
          actorUser?.uid || ''
        )

        this.reservations = [newReservation, ...this.reservations]

        await logActivity({
          action: 'reservation.create',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'reservation',
          targetId: newReservation.id || '',
          status: 'success',
          severity: 'info',
          message: `Created reservation for ${reservationData.customerName}`,
          changes: { before: null, after: { ...newReservation } },
          metadata: { customerName: reservationData.customerName },
        })

        return newReservation
      } catch (e: any) {
        this.error = e.message || 'Failed to create reservation'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateReservation(id: string, reservationData: UpdateReservationData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const beforeReservation = this.reservations.find((reservation) => reservation.id === id)

        await ReservationsService.updateReservation(id, reservationData)

        this.reservations = this.reservations.map((reservation) =>
          reservation.id === id ? { ...reservation, ...reservationData } : reservation
        )

        const afterReservation = this.reservations.find((reservation) => reservation.id === id)

        await logActivity({
          action: 'reservation.update',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'reservation',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Updated reservation for ${reservationData.customerName || afterReservation?.customerName || ''}`,
          changes: { before: beforeReservation, after: afterReservation },
          metadata: { customerName: reservationData.customerName || afterReservation?.customerName || '' },
        })

        return { id, ...reservationData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update reservation'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteReservation(id: string) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const deletedReservation = this.reservations.find((reservation) => reservation.id === id)

        await ReservationsService.deleteReservation(id)

        await logActivity({
          action: 'reservation.delete',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'reservation',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Deleted reservation for ${deletedReservation?.customerName || ''}`,
          changes: { before: deletedReservation, after: null },
          metadata: { customerName: deletedReservation?.customerName || '' },
        })

        this.reservations = this.reservations.filter((reservation) => reservation.id !== id)

        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete reservation'
        throw e
      } finally {
        this.loading = false
      }
    },

    invalidateCache() {
      this.lastFetched = null
    },

    clearStore() {
      this.reservations = []
      this.lastFetched = null
      this.error = null
    },
  },
})
