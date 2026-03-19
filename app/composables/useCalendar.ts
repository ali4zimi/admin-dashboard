import { storeToRefs } from 'pinia'
import { useCalendarStore } from '~/stores/calendar.store'
import type {
  CreateCalendarEventData,
  UpdateCalendarEventData,
} from '~/types/calendar.types'

export function useCalendar() {
  const store = useCalendarStore()
  const { events, loading, error } = storeToRefs(store)

  return {
    events,
    loading,
    error,
    fetchEvents: (forceRefresh = false) => store.fetchEvents(forceRefresh),
    getEvent: (id: string) => store.getEvent(id),
    createEvent: (eventData: CreateCalendarEventData) => store.createEvent(eventData),
    updateEvent: (id: string, eventData: UpdateCalendarEventData) =>
      store.updateEvent(id, eventData),
    // Keep backward compatibility for existing components using editEvent
    editEvent: (id: string, eventData: UpdateCalendarEventData) =>
      store.updateEvent(id, eventData),
    deleteEvent: (id: string) => store.deleteEvent(id),
    invalidateCache: () => store.invalidateCache(),
    clearStore: () => store.clearStore(),
    getEventById: store.getEventById,
  }
}
