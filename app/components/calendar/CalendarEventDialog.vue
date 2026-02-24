<template>
  <!-- EventFormDialog: Used for creating and editing events -->
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black opacity-30" @click="close"></div>
    <div class="bg-white rounded-lg shadow-lg p-6 relative z-10 min-w-[320px]">
      <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="close">&times;</button>
      <h3 class="text-lg font-bold mb-4">{{ mode === 'edit' ? 'Edit Event' : 'Create New Event' }}</h3>
      <form @submit.prevent="save">
        <div class="mb-3">
          <label class="block text-sm font-semibold mb-1">Title</label>
          <input v-model="form.title" type="text" class="w-full border rounded px-2 py-1" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-semibold mb-1">Date</label>
          <input v-model="form.date" type="date" class="w-full border rounded px-2 py-1" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-semibold mb-1">Time</label>
          <input v-model="form.time" type="time" class="w-full border rounded px-2 py-1" required />
        </div>
        <div class="mb-3">
          <label class="block text-sm font-semibold mb-1">Duration (hh:mm)</label>
          <input v-model="form.duration" type="text" placeholder="01:00" class="w-full border rounded px-2 py-1" required />
        </div>
        <div class="flex gap-2 mt-4">
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {{ mode === 'edit' ? 'Save' : 'Create' }}
          </button>
          <button type="button" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" @click="close">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface CalendarEvent {
  id?: string;
  title: string;
  date: Date | string;
  time: string;
  duration: string;
  [key: string]: any;
}

const props = defineProps<{
  show: boolean;
  mode: 'create' | 'edit';
  event?: CalendarEvent;
}>();
const emit = defineEmits(['close', 'save']);

const form = ref({
  title: '',
  date: '',
  time: '',
  duration: '01:00',
});

watch(
  () => [props.show, props.event, props.mode],
  ([show, event, mode]) => {
    if (show) {
      if (mode === 'edit' && event) {
        form.value.title = event.title || '';
        form.value.date = event.date
          ? typeof event.date === 'string'
            ? event.date
            : event.date.toISOString().slice(0, 10)
          : '';
        form.value.time = event.time || '';
        form.value.duration = event.duration || '';
      } else {
        form.value.title = '';
        form.value.date = '';
        form.value.time = '';
        form.value.duration = '01:00';
      }
    }
  },
  { immediate: true }
);

function close() {
  emit('close');
}

function save() {
  if (!form.value.title || !form.value.date || !form.value.time || !form.value.duration) return;
  if (props.mode === 'edit' && props.event) {
    emit('save', {
      ...props.event,
      title: form.value.title,
      date: new Date(form.value.date),
      time: form.value.time,
      duration: form.value.duration,
    });
  } else {
    emit('save', {
      ...form.value,
      date: new Date(form.value.date),
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    });
  }
  close();
}
</script>