<template>
  <div>
    <div class="mb-4 flex gap-2">
      <button @click="$emit('update:view', 'month')" :class="['px-4 py-2 rounded', view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700']">Month View</button>
      <button @click="$emit('update:view', 'week')" :class="['px-4 py-2 rounded', view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700']">Week View</button>
      <button @click="onNewEventClick" class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 ml-auto">New Event</button>
    </div>
    <EventDialog
      v-if="eventDialogShow"
      :show="eventDialogShow"
      :mode="eventDialogMode"
      :event="eventDialogEvent"
      @close="onEventDialogClose"
      @save="onEventDialogSave"
    />
    <MonthlyCalendar v-if="view === 'month'" :month="month" :year="year" :today="today" :events="dummyEvents" @prev="onPrevMonth" @next="onNextMonth" @event-change="onEventChange" />
    <WeeklyCalendar
      v-else
      :weekStart="weekStart"
      :month="month"
      :year="year"
      :today="today"
      :events="dummyEvents"
      @prev="onPrevWeek"
      @next="onNextWeek"
      @event-click="onEventClick"
      @dialog-close="onDialogClose"
      @edit-event="onEditEvent"
      @edit-dialog-close="onEditDialogClose"
      @event-change="onEventChange"
    />
    <CalendarEventDialog
      v-if="dialogShow && dialogEvent"
      :show="dialogShow"
      :event="dialogEvent"
      :event-end-time="eventEndTime"
      @close="onDialogClose"
      @edit="onEditEvent"
    />

  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import EventDialog from './CalendarEventDialog.vue';
import MonthlyCalendar from './MonthlyCalendar.vue';
import WeeklyCalendar from './WeeklyCalendar.vue';
import CalendarEventDialog from './EventDetailsDialog.vue';

// TypeScript interface for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  [key: string]: any;
}

// Helper to generate unique IDs
function generateId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  );
}

const dialogShow = ref(false);
const dialogEvent = ref<CalendarEvent | null>(null);
const eventDialogShow = ref(false);
const eventDialogMode = ref<'create' | 'edit'>('create');
const eventDialogEvent = ref<CalendarEvent | null>(null);

function onNewEventClick() {
  eventDialogMode.value = 'create';
  eventDialogEvent.value = null;
  eventDialogShow.value = true;
}

function onEventDialogClose() {
  eventDialogShow.value = false;
  eventDialogEvent.value = null;
}

function onEventDialogSave(event: CalendarEvent) {
  if (eventDialogMode.value === 'edit') {
    // Edit existing event
    const index = dummyEvents.value.findIndex(ev => ev.id === event.id);
    if (index !== -1) dummyEvents.value[index] = { ...event };
  } else {
    // Create new event
    dummyEvents.value.push({
      ...event,
      date: event.date instanceof Date ? event.date : new Date(event.date),
    });
  }
  eventDialogShow.value = false;
  eventDialogEvent.value = null;
}

// Example dummyEvents with unique IDs (replace with your real data source)
const dummyEvents = ref<CalendarEvent[]>([
  {
    id: generateId(),
    title: 'Meeting',
    date: new Date('2026-02-24'),
    time: '10:00',
    duration: '01:00',
  },
  {
    id: generateId(),
    title: 'Lunch',
    date: new Date('2026-02-24'),
    time: '12:00',
    duration: '01:00',
  },
]);

function eventEndTime(start: string, duration: string) {
  if (!start) return '';
  const [h, m] = start.split(':').map(Number);
  const dur = parseDurationToHours(duration);
  let endHour = (h || 0) + Math.floor(dur);
  let endMin = (m || 0) + Math.round((dur % 1) * 60);
  if (endMin >= 60) {
    endHour += 1;
    endMin -= 60;
  }
  return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
}

function parseDurationToHours(duration: string) {
  if (!duration) return 1;
  const [h, m] = duration.split(':').map(Number);
  return (h || 0) + (m ? m / 60 : 0);
}

function onEventClick(ev: CalendarEvent) {
  dialogEvent.value = ev;
  dialogShow.value = true;
}

function onDialogClose() {
  dialogShow.value = false;
  dialogEvent.value = null;
}

function onEditEvent(ev: CalendarEvent) {
  dialogShow.value = false;
  eventDialogMode.value = 'edit';
  eventDialogEvent.value = { ...ev };
  eventDialogShow.value = true;
}

function onEditDialogClose() {
  editDialogShow.value = false;
  editDialogEvent.value = null;
}

function onEditDialogSave(editedEvent: CalendarEvent) {
  // Find the event in dummyEvents by id
  const index = dummyEvents.value.findIndex(ev => ev.id === editedEvent.id);
  if (index !== -1) {
    // Update the event in dummyEvents
    dummyEvents.value[index] = { ...editedEvent };
  }
  editDialogShow.value = false;
  editDialogEvent.value = null;
}

function onEventChange(event: CalendarEvent) {
  console.log('event change received', event);
}

const props = defineProps({
  view: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  today: { type: Object, required: true },
  weekStart: { type: [Date, String, Number], required: false },
})
const emit = defineEmits(['update:view', 'update:month', 'update:year', 'update:weekStart', 'event-change'])

function onPrevMonth() {
  emit('update:month', props.month === 0 ? 11 : props.month - 1)
  if (props.month === 0) emit('update:year', props.year - 1)
}
function onNextMonth() {
  emit('update:month', props.month === 11 ? 0 : props.month + 1)
  if (props.month === 11) emit('update:year', props.year + 1)
}
function onPrevWeek() {
  if (!props.weekStart) return;
  const date = new Date(props.weekStart as any);
  date.setDate(date.getDate() - 7);
  emit('update:weekStart', date);
}
function onNextWeek() {
  if (!props.weekStart) return;
  const date = new Date(props.weekStart as any);
  date.setDate(date.getDate() + 7);
  emit('update:weekStart', date);
}
</script>
