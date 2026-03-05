<template>
  <div class="flex flex-col w-12 mt-[-14px] border-gray-300">
    <div v-for="hour in hours" :key="'hour-label-' + hour" class="h-10 text-xs text-gray-400 flex items-start justify-end pr-1 pt-1 border-gray-200">
      <span v-if="hour > 1">{{ (hour-1).toString().padStart(2, '0') }}:00</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// TypeScript interface for calendar events (for consistency)
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  [key: string]: any;
}
const props = defineProps({
  hours: { type: Number, default: 24 }
})
</script>
