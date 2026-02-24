<template>
  <div class="flex flex-col flex-1 border-l last:border-r border-gray-300 overflow-hidden">
    <div
      v-for="hour in 24"
      :key="'cell-' + dayObj.dateStr + '-' + hour"
      class="h-10 border-b border-gray-200 select-none p-1 relative"
      :class="[
        dayObj.isToday ? 'bg-orange-50' : '',
        dayObj.isOtherMonth ? 'text-gray-400 bg-gray-50' : ''
      ]"
      style="overflow: visible;"
    >
      <template v-if="eventsForCell(dayObj, hour).length">
        <div
          v-for="(ev, idx) in eventsForCell(dayObj, hour)"
          :key="'event-' + ev.id"
          class="absolute flex flex-col mb-1 border border-blue-500"
          :style="{
            left: `${idx * 50}px`,
            width: `calc(100% - ${idx * 50}px)` ,
            height: (parseDurationToHours(ev.duration) * 40) + 'px',
            zIndex: 2,
            background: '#2563eb',
            color: 'white',
            borderRadius: '0.375rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
            top: `${parseInt(ev.time.split(':')[1] || '0', 10) * (40 / 60)}px`,
          }"
          @mousedown="onEventDragStartWrapper($event, ev, dayObj, hour, $event)"
          @click="handleEventClick(ev)"
        >
          <div class="font-bold">{{ ev.title }}</div>
          <div class="text-xs text-slate-200">{{ ev.time }} - {{ eventEndTime(ev.time, ev.duration) }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// TypeScript interface for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  [key: string]: any;
}

const props = defineProps<{
  dayObj: Record<string, any>,
  eventsForCell: (dayObj: any, hour: number) => CalendarEvent[],
  parseDurationToHours: (duration: string) => number,
  eventEndTime: (time: string, duration: string) => string,
  dragUpdateKey: number,
  onEventDragStart: (...args: any[]) => void
}>()
const emit = defineEmits(['event-click', 'event-drag-end']);
function handleEventClick(ev: CalendarEvent) {
  emit('event-click', ev);
}

// Drag event emit logic
let lastDraggedEvent: CalendarEvent | null = null;
function onEventDragStartWrapper(...args: any[]) {
  // args: ($event, ev, dayObj, hour, $event)
  const ev = args[1] as CalendarEvent;
  lastDraggedEvent = ev;
  props.onEventDragStart(...args);
  document.addEventListener('mouseup', onEventDragEndWrapper, { once: true });
}

function onEventDragEndWrapper(e: MouseEvent) {
  if (lastDraggedEvent) {
    // Deep clone to avoid mutation issues
    const eventCopy = JSON.parse(JSON.stringify(lastDraggedEvent));
    emit('event-drag-end', eventCopy);
    lastDraggedEvent = null;
  }
}
</script>
