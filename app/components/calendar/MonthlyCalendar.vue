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
          class="flex-1 h-25 cursor-pointer select-none flex flex-col items-start justify-end p-2 border border-r-0 last:border-r border-gray-300 border-t-0"
          :class="[(calendarCells[(row-1)*7 + (col-1)]?.isToday ? 'bg-orange-100 font-bold' : ''),
            (calendarCells[(row-1)*7 + (col-1)]?.isOtherMonth ? 'text-gray-400 bg-gray-50' : '')]"
          @drop="onCellDrop(calendarCells[(row-1)*7 + (col-1)]?.day, calendarCells[(row-1)*7 + (col-1)]?.isOtherMonth, $event)"
          @dragover="onCellDragOver"
        >
          <div>{{ calendarCells[(row-1)*7 + (col-1)]?.day }}</div>
          <div v-for="ev in eventsForDay(calendarCells[(row-1)*7 + (col-1)]?.day, calendarCells[(row-1)*7 + (col-1)]?.isOtherMonth)" :key="ev.title + ev.time" class="text-xs bg-blue-200 text-blue-900 rounded px-1 mt-1 w-full truncate" draggable="true" @dragstart="onEventDragStart($event, ev)" @dragend="onEventDragEnd" @click="onEventClick(ev)">
            {{ ev.title }} <span class="ml-1">({{ ev.time }})</span>
          </div>
        </div>
      </div>
    </div>
    <EventDialog
      v-if="eventDialogShow"
      :show="eventDialogShow"
      :mode="eventDialogMode"
      :event="eventDialogEvent"
      @close="onEventDialogClose"
      @save="onEventDialogSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, getCurrentInstance } from 'vue'
import EventDialog from './CalendarEventDialog.vue'
const props = defineProps({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  today: { type: Object, required: true },
  events: { type: Array, required: false, default: () => [] },
})

const draggingEvent = ref<CalendarEvent | null>(null)
const instance = getCurrentInstance()
const eventDialogShow = ref(false)
const eventDialogMode = ref<'edit' | 'create'>('edit')
const eventDialogEvent = ref<CalendarEvent | null>(null)

function onEventClick(ev: CalendarEvent) {
  eventDialogMode.value = 'edit'
  eventDialogEvent.value = { ...ev }
  eventDialogShow.value = true
}
function onEventDialogClose() {
  eventDialogShow.value = false
  eventDialogEvent.value = null
}
function onEventDialogSave(editedEvent: CalendarEvent) {
  // Emit event change to parent (Calendar) using id for identification
  instance?.emit('event-change', editedEvent)
  onEventDialogClose()
}
function onEventDragStart(ev, eventObj) {
  draggingEvent.value = eventObj
  ev.dataTransfer.effectAllowed = 'move'
}
function onEventDragEnd() {
  draggingEvent.value = null
}
function onCellDrop(day, isOtherMonth, e) {
  e.preventDefault()
  if (!draggingEvent.value || isOtherMonth) return
  // Update event date to dropped day
  draggingEvent.value.date = new Date(props.year, props.month, day)
  draggingEvent.value = null
  // Force update for reactivity if needed
  if (instance && instance.proxy && typeof instance.proxy.$forceUpdate === 'function') {
    instance.proxy.$forceUpdate()
  }
}
function onCellDragOver(e) {
  e.preventDefault()
}

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

// Helper to get events for a given day
function eventsForDay(day: number, isOtherMonth: boolean) {
  if (isOtherMonth) return [];
  return props.events.filter(ev => {
    return ev.date.getFullYear() === props.year &&
      ev.date.getMonth() === props.month &&
      ev.date.getDate() === day;
  });
}
</script>
