<template>
  <div class="rounded-lg bg-white p-6 shadow-sm min-h-[400px]">
    <div class="flex items-center justify-between mb-4">
      <button @click="$emit('prev')" class="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
      <h2 class="text-lg font-semibold">{{ monthYearLabel }}</h2>
      <button @click="$emit('next')" class="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
    </div>
    <div class="flex text-center text-gray-500 font-medium">
      <div v-for="d in weekDays" :key="d" class="flex-1 py-2 border border-r-0 last:border-r border-gray-300">{{ d }}</div>
    </div>
    <div>
      <div v-for="row in calendarRows" :key="'row-' + row" class="flex">
        <div
          v-for="col in 7"
          :key="'cell-' + ((row-1)*7 + (col-1))"
          class="flex-1 h-25 cursor-pointer select-none flex items-start justify-end p-2 border border-r-0 last:border-r border-gray-300 border-t-0"
          :class="[
            calendarCells[(row-1)*7 + (col-1)]?.isToday ? 'bg-orange-100 font-bold' : '',
            calendarCells[(row-1)*7 + (col-1)]?.isOtherMonth ? 'text-gray-400 bg-gray-50' : ''
          ]"
        >
          {{ calendarCells[(row-1)*7 + (col-1)]?.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  today: { type: Object, required: true },
})

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const daysInMonth = computed(() => new Date(props.year, props.month + 1, 0).getDate())
const firstDayOfWeek = computed(() => new Date(props.year, props.month, 1).getDay())
const calendarRows = computed(() => {
  const totalCellsNeeded = firstDayOfWeek.value + daysInMonth.value
  return totalCellsNeeded > 35 ? 6 : 5
})
const calendarCells = computed(() => {
  const days: Array<{ day: number; isOtherMonth: boolean; isToday: boolean }> = []
  const firstDay = firstDayOfWeek.value
  const daysThisMonth = daysInMonth.value
  const totalCells = calendarRows.value * 7
  const prevMonth = props.month === 0 ? 11 : props.month - 1
  const prevYear = props.month === 0 ? props.year - 1 : props.year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    days.push({ day, isOtherMonth: true, isToday: false })
  }
  for (let d = 1; d <= daysThisMonth; d++) {
    days.push({
      day: d,
      isOtherMonth: false,
      isToday: d === props.today.getDate() && props.month === props.today.getMonth() && props.year === props.today.getFullYear(),
    })
  }
  let nextDay = 1
  while (days.length < totalCells) {
    days.push({ day: nextDay++, isOtherMonth: true, isToday: false })
  }
  return days
})
const monthYearLabel = computed(() => new Date(props.year, props.month).toLocaleString('default', { month: 'long', year: 'numeric' }))
</script>
