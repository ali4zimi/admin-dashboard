<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Bookings</h1>
      <p class="text-gray-600">View and manage restaurant bookings and events on the calendar.</p>
    </div>
    <Calendar
      :view="calendarView"
      :month="currentMonth"
      :year="currentYear"
      :today="today"
      :weekStart="weekStart"
      @update:view="calendarView = $event"
      @update:month="updateMonth"
      @update:year="updateYear"
      @update:weekStart="updateWeekStart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Calendar from '~/components/calendar/Calendar.vue'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const calendarView = ref<'month' | 'week'>('week')
const weekStart = ref(getWeekStart(today))

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function updateMonth(newMonth: number) {
  currentMonth.value = newMonth
}
function updateYear(newYear: number) {
  currentYear.value = newYear
}
function updateWeekStart(newWeekStart: number | Date) {
  weekStart.value = new Date(newWeekStart)
}
</script>

<style scoped>
/* Calendar table look, no cell gap, non-overlapping borders */
.calendar-table-row {
  display: flex;
}
.calendar-table-cell {
  flex: 1 1 0%;
  height: 8rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-top: none;
  border-left: none;
  padding: 0.5rem;
  box-sizing: border-box;
  text-align: right;
  background: #fff;
}
.calendar-table-cell.bg-blue-600 {
  background: #2563eb !important;
  color: #fff !important;
}
.calendar-table-cell.text-gray-400 {
  color: #9ca3af !important;
  background: #f9fafb !important;
}
</style>
