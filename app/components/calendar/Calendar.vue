<template>
  <div>
    <div class="mb-4 flex gap-2">
      <button @click="$emit('update:view', 'month')" :class="['px-4 py-2 rounded', view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700']">Month View</button>
      <button @click="$emit('update:view', 'week')" :class="['px-4 py-2 rounded', view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700']">Week View</button>
    </div>
    <MonthlyCalendar v-if="view === 'month'" :month="month" :year="year" :today="today" :events="dummyEvents" @prev="onPrevMonth" @next="onNextMonth" />
    <WeeklyCalendar v-else :weekStart="weekStart" :month="month" :year="year" :today="today" :events="dummyEvents" @prev="onPrevWeek" @next="onNextWeek" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import MonthlyCalendar from './MonthlyCalendar.vue'
import WeeklyCalendar from './WeeklyCalendar.vue'

const props = defineProps({
  view: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  today: { type: Object, required: true },
  weekStart: { type: Object, required: false },
})
const emit = defineEmits(['update:view', 'update:month', 'update:year', 'update:weekStart'])

// Dummy events for the current week (with string time and duration)
const dummyEvents = [
  {
    title: 'Breakfast Meeting',
    date: new Date(new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getFullYear(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getMonth(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getDate()),
    time: '08:00',
    duration: '1:00',
  },
  {
    title: 'Meeting Friends',
    date: new Date(new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getFullYear(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getMonth(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getDate()),
    time: '08:30',
    duration: '1:00',
  },
  {
    title: 'Lunch Reservation',
    date: new Date(new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getFullYear(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getMonth(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getDate() + 2),
    time: '12:00',
    duration: '1:00',
  },
  {
    title: 'Dinner Party',
    date: new Date(new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getFullYear(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getMonth(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getDate() + 4),
    time: '19:00',
    duration: '3:00',
  },
  {
    title: 'Staff Meeting',
    date: new Date(new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getFullYear(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getMonth(), new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart)).getDate() + 1),
    time: '15:00',
    duration: '1:00',
  },
]

function onPrevMonth() {
  emit('update:month', props.month === 0 ? 11 : props.month - 1)
  if (props.month === 0) emit('update:year', props.year - 1)
}
function onNextMonth() {
  emit('update:month', props.month === 11 ? 0 : props.month + 1)
  if (props.month === 11) emit('update:year', props.year + 1)
}
function onPrevWeek() {
  emit('update:weekStart', new Date(props.weekStart).setDate(props.weekStart.getDate() - 7))
}
function onNextWeek() {
  emit('update:weekStart', new Date(props.weekStart).setDate(props.weekStart.getDate() + 7))
}
</script>
