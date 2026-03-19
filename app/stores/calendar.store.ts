/**
 * Calendar Store - Global state management for calendar events
 *
 * Uses CalendarService for Firebase operations.
 * Handles caching, activity logging, and state management.
 */

import { defineStore } from 'pinia'
import * as CalendarService from '~/services/calendar.service'
import type {
  CalendarEvent,
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from '~/types/calendar.types'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: [] as CalendarEvent[],
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

    getEventById: (state) => (id: string) => {
      return state.events.find((event) => event.id === id)
    },
  },

  actions: {
    async fetchEvents(forceRefresh = false) {
      if (!forceRefresh && this.isCacheValid && this.events.length > 0) {
        return this.events
      }

      this.loading = true
      this.error = null

      try {
        this.events = await CalendarService.fetchAllEvents()
        this.lastFetched = Date.now()
        return this.events
      } catch (e: any) {
        this.error = e.message || 'Failed to fetch events'
        return []
      } finally {
        this.loading = false
      }
    },

    async getEvent(id: string) {
      const cachedEvent = this.getEventById(id)
      if (cachedEvent) return cachedEvent

      try {
        const event = await CalendarService.fetchEventById(id)
        if (event && !this.events.find((existingEvent) => existingEvent.id === id)) {
          this.events.push(event)
        }
        return event
      } catch (e: any) {
        this.error = e.message || 'Failed to get event'
        return null
      }
    },

    async createEvent(eventData: CreateCalendarEventData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const authorName =
          actorUser?.displayName || actorUser?.email?.split('@')[0] || 'Unknown'

        const newEvent = await CalendarService.createEvent(
          eventData,
          authorName,
          actorUser?.uid || ''
        )

        this.events = [newEvent, ...this.events]

        await logActivity({
          action: 'calendar.create',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'calendarEvent',
          targetId: newEvent.id,
          status: 'success',
          severity: 'info',
          message: `Created calendar event "${eventData.title}"`,
          changes: { before: null, after: { ...newEvent } },
          metadata: {
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
          },
        })

        return newEvent
      } catch (e: any) {
        this.error = e.message || 'Failed to create event'
        throw e
      } finally {
        this.loading = false
      }
    },

    async updateEvent(id: string, eventData: UpdateCalendarEventData) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const beforeEvent = this.events.find((event) => event.id === id)

        await CalendarService.updateEvent(id, eventData)

        this.events = this.events.map((event) =>
          event.id === id ? { ...event, ...eventData } : event
        )

        const afterEvent = this.events.find((event) => event.id === id)

        await logActivity({
          action: 'calendar.update',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'calendarEvent',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Updated calendar event "${eventData.title || afterEvent?.title || ''}"`,
          changes: { before: beforeEvent, after: afterEvent },
          metadata: {
            title: eventData.title || afterEvent?.title || '',
          },
        })

        return { id, ...eventData }
      } catch (e: any) {
        this.error = e.message || 'Failed to update event'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteEvent(id: string) {
      const { user } = useAuth()
      const { logActivity } = useActivityLog()
      const actorUser = user.value as any

      this.loading = true
      this.error = null

      try {
        const deletedEvent = this.events.find((event) => event.id === id)

        await CalendarService.deleteEvent(id)

        await logActivity({
          action: 'calendar.delete',
          actorId: actorUser?.uid || '',
          actorType: actorUser?.role || 'user',
          targetType: 'calendarEvent',
          targetId: id,
          status: 'success',
          severity: 'info',
          message: `Deleted calendar event "${deletedEvent?.title || ''}"`,
          changes: { before: deletedEvent, after: null },
          metadata: {
            title: deletedEvent?.title || '',
          },
        })

        this.events = this.events.filter((event) => event.id !== id)

        return true
      } catch (e: any) {
        this.error = e.message || 'Failed to delete event'
        throw e
      } finally {
        this.loading = false
      }
    },

    invalidateCache() {
      this.lastFetched = null
    },

    clearStore() {
      this.events = []
      this.lastFetched = null
      this.error = null
    },
  },
})
