import { ref } from "vue";
import { useFirebase } from "./useFirebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  [key: string]: any;
}

export function useCalendar() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const events = ref<CalendarEvent[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const COLLECTION_NAME = "calendarEvents";

  // Helper to convert Firestore Timestamp to JS Date
  function toDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (val.toDate) return val.toDate();
    return new Date(val);
  }

  // Fetch events from Firestore (with real-time updates)
  const fetchEvents = async () => {
    if (!firestore) return [];

    loading.value = true;
    error.value = null;

    try {
      const eventsRef = collection(firestore, COLLECTION_NAME);
      const q = query(eventsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      events.value = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: toDate(data.date),
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        };
      }) as unknown as CalendarEvent[];

      return events.value;
    } catch (e: any) {
      error.value = e.message || "Failed to fetch events";
      console.error("Error fetching events:", e);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getEvent = async (id: string) => {
    if (!firestore) return null;

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CalendarEvent;
      }
      return null;
    } catch (e: any) {
      error.value = e.message || "Failed to get event";
      console.error("Error getting event:", e);
      return null;
    }
  };

  const createEvent = async (
    eventData: Omit<
      CalendarEvent,
      "id" | "createdAt" | "updatedAt" | "author" | "authorId" | "date"
    >,
  ) => {
    if (!firestore) throw new Error("Firestore not initialized");

    loading.value = true;
    error.value = null;

    try {
      const postsRef = collection(firestore, COLLECTION_NAME);
      const authorName =
        user.value?.displayName ||
        user.value?.email?.split("@")[0] ||
        "Unknown";

      const newEventData = {
        ...eventData,
        author: authorName,
        authorId: user.value?.uid || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(postsRef, newEventData);

      const newEvent: CalendarEvent = {
        id: docRef.id,
        ...(newEventData as any),
        author: authorName,
        authorId: user.value?.uid || "",
      };

      events.value = [newEvent, ...events.value];
      // Log activity
      return newEvent;
    } catch (e: any) {
      error.value = e.message || "Failed to create event";
      console.error("Error creating event:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };
  // Edit an existing event
  const editEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    if (!firestore) throw new Error("Firestore not initialized");

    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id);
      const existingEventSnap = await getDoc(docRef);
      if (!existingEventSnap.exists()) {
        throw new Error("Event not found");
      }

      const existingEventData = existingEventSnap.data() || {};
      const updatedEventData = {
        ...existingEventData,
        ...eventData,
        date:
          eventData.date instanceof Date
            ? eventData.date
            : new Date(eventData.date || existingEventData.date),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updatedEventData);
      // Update local state
      events.value = events.value.map((ev) =>
        ev.id === id ? { ...ev, ...updatedEventData } : ev,
      );
    } catch (e: any) {
      error.value = e.message || "Failed to edit event";
      console.error("Error editing event:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    if (!firestore) throw new Error("Firestore not initialized");
    loading.value = true;
    error.value = null;

    try {
      const docRef = doc(firestore, COLLECTION_NAME, id);
      await deleteDoc(docRef);

      events.value = events.value.filter((ev) => ev.id !== id);
    } catch (e: any) {
      error.value = e.message || "Failed to delete event";
      console.error("Error deleting event:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    getEvent,
    createEvent,
    editEvent,
    deleteEvent,
  };
}
