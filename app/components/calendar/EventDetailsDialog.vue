<template>
  <!-- EventDetailsDialog: Used for displaying event information -->
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black opacity-30" @click="close"></div>
    <div class="bg-white rounded-lg shadow-lg p-6 relative z-10 min-w-[300px]">
      <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="close">&times;</button>
      <h3 class="text-lg font-bold mb-2">{{ event.title }}</h3>
      <div class="mb-1"><span class="font-semibold">Time:</span> {{ event.time }} - {{ eventEndTime(event.time, event.duration) }}</div>
      <div class="mb-1"><span class="font-semibold">Duration:</span> {{ event.duration }}</div>
      <div class="mb-1"><span class="font-semibold">Date:</span> {{ event.date.toLocaleDateString() }}</div>
      <div class="flex gap-2 mt-4">
        <button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" @click="edit">Edit</button>
        <button class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" @click="deleteEvent">Delete</button>
        <button class="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" @click="duplicate">Duplicate</button>
      </div>
      <slot :event="event"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  [key: string]: any;
}
const props = defineProps<{ show: boolean; event: CalendarEvent; eventEndTime: (time: string, duration: string) => string }>()
const emit = defineEmits(['close', 'edit', 'delete', 'duplicate'])
function close() {
  emit('close')
}
function edit() {
  emit('edit', props.event)
}
function deleteEvent() {
  emit('delete', props.event)
}
function duplicate() {
  emit('duplicate', props.event)
}
</script>
