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
      <CalendarTimeGrid :hours="24" />
      <!-- Day columns -->
      <CalendarDayColumn
        v-for="dayObj in weekDaysData"
        :key="'week-day-' + dayObj.dateStr"
        :day-obj="dayObj"
        :events-for-cell="eventsForCell"
        :parse-duration-to-hours="parseDurationToHours"
        :event-end-time="eventEndTime"
        :drag-update-key="dragUpdateKey"
        :on-event-drag-start="onEventDragStart"
        :on-event-click="onEventClick"
      />
      <CalendarEventDialog
        :show="dialogShow"
        :event="dialogEvent"
        :event-end-time="eventEndTime"
        @close="onDialogClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CalendarTimeGrid from './CalendarTimeGrid.vue'
import CalendarDayColumn from './CalendarDayColumn.vue'
import CalendarEventDialog from './CalendarEventDialog.vue'
const props = defineProps({
  weekStart: { type: [Date, String, Number], required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  today: { type: [Date, String, Number], required: true },
  events: { type: Array, required: true },
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

function parseTimeToHour(time?: string) {
  const t = typeof time === 'string' ? time : '00:00';
  return parseInt(t.split(':')[0], 10);
}
function parseDurationToHours(duration: string | undefined) {
  if (!duration) return 1;
  const [h, m] = duration.split(':').map(Number);
  return (h || 0) + (m ? m / 60 : 0);
}


function eventEndTime(start: string | undefined, duration: string | undefined) {
  if (!start) return '';
  const [h, m] = start.split(':').map(Number);
  const dur = parseDurationToHours(duration);
  let endHour = (h || 0) + Math.floor(dur);
  let endMin = (m || 0) + Math.round((dur % 1) * 60);
  if (endMin >= 60) {
    endHour += 1;
    endMin -= 60;
  }
  return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
}

function eventsForCell(dayObj: { dateStr: string }, hour: number) {
  // Find all events starting at this day and hour
  return props.events.filter(ev => {
    const evDate = ev.date
    const cellDate = new Date(dayObj.dateStr)
    if (
      evDate.getFullYear() === cellDate.getFullYear() &&
      evDate.getMonth() === cellDate.getMonth() &&
      evDate.getDate() === cellDate.getDate()
    ) {
      const [evHour] = ev.time.split(":").map(Number)
      return evHour === (hour - 1);
    }
    return false
  })
}
// Track drag state
const draggingEvent = ref<any>(null)
const dragOffsetY = ref(0)
const dragStartHour = ref(0)
const dragStartMinute = ref(0)
const dragDayObj = ref<any>(null)
const dragUpdateKey = ref(0) // force reactivity

function onEventDragStart(ev, eventObj, dayObj, hour, e) {
  draggingEvent.value = eventObj
  dragDayObj.value = dayObj
  dragStartHour.value = hour - 1 // fix: hour label offset
  dragStartMinute.value = parseInt(eventObj.time.split(':')[1] || '0', 10)
  dragOffsetY.value = e.clientY
  document.addEventListener('mousemove', onEventDrag)
  document.addEventListener('mouseup', onEventDragEnd)
}

function onEventDrag(e) {
  if (!draggingEvent.value) return
  const cellHeight = 40
  const deltaY = e.clientY - dragOffsetY.value
  // Snap to 10px = 15min (cellHeight/4)
  const quarter = Math.round(deltaY / (cellHeight / 4))
  let totalMinutes = dragStartHour.value * 60 + dragStartMinute.value + quarter * 15
  if (totalMinutes < 0) totalMinutes = 0
  if (totalMinutes > 23 * 60 + 45) totalMinutes = 23 * 60 + 45
  let newHour = Math.floor(totalMinutes / 60)
  let newMinute = totalMinutes % 60
  // Snap to nearest quarter
  newMinute = Math.round(newMinute / 15) * 15
  if (newMinute === 60) {
    newHour += 1
    newMinute = 0
  }
  if (newHour > 23) {
    newHour = 23
    newMinute = 45
  }
  // Update event time (simulate move)
  draggingEvent.value.time = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
  dragUpdateKey.value++ // force reactivity
}

function onEventDragEnd() {
  draggingEvent.value = null
  document.removeEventListener('mousemove', onEventDrag)
  document.removeEventListener('mouseup', onEventDragEnd)
}

const dialogShow = ref(false)
const dialogEvent = ref(null)

function onEventClick(ev) {
  dialogEvent.value = ev
  dialogShow.value = true
}
function onDialogClose() {
  dialogShow.value = false
  dialogEvent.value = null
}
</script>
