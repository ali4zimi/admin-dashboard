<template>
  <div class="rounded-lg bg-white p-6 shadow-sm min-h-[400px]">
    <div class="flex items-center justify-between mb-4">
      <button @click="$emit('prev')" class="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
      <h2 class="text-lg font-semibold">Week of {{ weekLabel }}</h2>
      <button @click="$emit('next')" class="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
    </div>
    <div class="flex text-center text-gray-500 font-medium">
        <div class="flex flex-col w-12"></div>
      <div v-for="d in weekDays" :key="d" class="flex-1 py-2 border border-r-0 last:border-r border-gray-300">{{ d }}</div>
    </div>
    <div class="flex">
      <!-- Hour labels -->
      <div class="flex flex-col w-12 border-r border-gray-300">
        <div v-for="hour in 24" :key="'hour-label-' + hour" class="h-10 text-xs text-gray-400 flex items-start justify-end pr-1 pt-1 border-b border-gray-200">
          {{ (hour-1).toString().padStart(2, '0') }}:00
        </div>
      </div>
      <!-- Day columns -->
      <div class="flex-1 flex" v-for="dayObj in weekDaysData" :key="'week-day-' + dayObj.dateStr">
        <div class="flex flex-col flex-1 border-r border-gray-300">
          <div
            v-for="hour in 24"
            :key="'cell-' + dayObj.dateStr + '-' + hour"
            class="h-10 border-b border-gray-200 cursor-pointer select-none p-1"
            :class="[
              dayObj.isToday ? 'bg-orange-50' : '',
              dayObj.isOtherMonth ? 'text-gray-400 bg-gray-50' : ''
            ]"
          >
            <!-- Slot for events or bookings -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  weekStart: { type: [Date, String, Number], required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  today: { type: [Date, String, Number], required: true },
})
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekDaysData = computed(() => {
  const arr: Array<{ day: number; dateStr: string; isOtherMonth: boolean; isToday: boolean }> = []
  const start = new Date(props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart))
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    arr.push({
      day: d.getDate(),
      dateStr: d.toISOString().slice(0, 10),
      isOtherMonth: d.getMonth() !== props.month || d.getFullYear() !== props.year,
      isToday: d.getDate() === (props.today instanceof Date ? props.today.getDate() : new Date(props.today).getDate())
        && d.getMonth() === (props.today instanceof Date ? props.today.getMonth() : new Date(props.today).getMonth())
        && d.getFullYear() === (props.today instanceof Date ? props.today.getFullYear() : new Date(props.today).getFullYear()),
    })
  }
  return arr
})
const weekLabel = computed(() => {
  const start = weekDaysData.value[0]
  const end = weekDaysData.value[6]
  if (!start || !end) return ''
  return `${new Date(start.dateStr).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(end.dateStr).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`
})
</script>
