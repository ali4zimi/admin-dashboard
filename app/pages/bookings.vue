<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Bookings</h1>
      <p class="text-gray-600">View and manage restaurant bookings and events on the calendar.</p>
    </div>
    <!-- Custom Monthly Calendar -->
    <div class="rounded-lg bg-white p-6 shadow-sm min-h-[400px]">
      <div class="flex items-center justify-between mb-4">
        <button @click="prevMonth" class="px-2 py-1 rounded hover:bg-gray-100">
          &lt;
        </button>
        <h2 class="text-lg font-semibold">{{ monthYearLabel }}</h2>
        <button @click="nextMonth" class="px-2 py-1 rounded hover:bg-gray-100">
          &gt;
        </button>
      </div>
      <div class="flex text-center text-gray-500 font-medium">
        <div v-for="d in weekDays" :key="d" class="flex-1 py-2 border border-gray-300">{{ d }}</div>
      </div>
      <div>
        <div v-for="row in calendarRows" :key="'row-' + row" class="flex">
          <div
            v-for="col in 7"
            :key="'cell-' + ((row-1)*7 + (col-1))"
            class="flex-1 h-25 cursor-pointer select-none flex items-start justify-end p-2 border border-gray-300 border-t-0"
            :class="[
              calendarCells[(row-1)*7 + (col-1)].isToday ? 'bg-orange-100 font-bold' : '',
              calendarCells[(row-1)*7 + (col-1)].isOtherMonth ? 'text-gray-400 bg-gray-50' : ''
            ]"
          >
            {{ calendarCells[(row-1)*7 + (col-1)].day }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const calendarRows = computed(() => {
  // Calculate how many rows are needed (5 or 6)
  const firstDay = firstDayOfWeek.value
  const daysThisMonth = daysInMonth.value
  const totalCellsNeeded = firstDay + daysThisMonth
  return totalCellsNeeded > 35 ? 6 : 5
})

const calendarCells = computed(() => {
  const days: Array<{ day: number; isOtherMonth: boolean; isToday: boolean }> = []
  const firstDay = firstDayOfWeek.value
  const daysThisMonth = daysInMonth.value
  const totalCells = calendarRows.value * 7

  // Previous month
  const prevMonth = currentMonth.value === 0 ? 11 : currentMonth.value - 1
  const prevYear = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()

  // Fill days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    days.push({
      day,
      isOtherMonth: true,
      isToday: false,
    })
  }

  // Fill current month days
  for (let d = 1; d <= daysThisMonth; d++) {
    days.push({
      day: d,
      isOtherMonth: false,
      isToday: isToday(d),
    })
  }

  // Fill next month days
  let nextDay = 1
  while (days.length < totalCells) {
    days.push({
      day: nextDay++,
      isOtherMonth: true,
      isToday: false,
    })
  }
  return days
})

const monthYearLabel = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function isToday(day) {
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
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
