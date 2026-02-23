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
      <div class="flex flex-col w-12 mt-[-14px] border-gray-300">
        <div v-for="hour in 24" :key="'hour-label-' + hour" class="h-10 text-xs text-gray-400 flex items-start justify-end pr-1 pt-1 border-gray-200">
          <span v-if="hour > 1">{{ (hour-1).toString().padStart(2, '0') }}:00</span>
        </div>
      </div>
      <!-- Day columns -->
      <div class="flex-1 border-l last:border-r border-gray-300 flex" v-for="dayObj in weekDaysData" :key="'week-day-' + dayObj.dateStr">
        <div class="flex flex-col flex-1 border-gray-300 overflow-hidden">
          <div
            v-for="hour in 24"
            :key="'cell-' + dayObj.dateStr + '-' + hour"
            class="h-10 border-b border-gray-200 cursor-pointer select-none p-1 relative"
            :class=" [
              dayObj.isToday ? 'bg-orange-50' : '',
              dayObj.isOtherMonth ? 'text-gray-400 bg-gray-50' : ''
            ]"
            style="overflow: visible;"
          >
            <template v-if="eventsForCell(dayObj, hour).length">
              <div
                v-for="(ev, idx) in eventsForCell(dayObj, hour)"
                :key="'event-' + ev.title + '-' + idx"
                class="absolute flex flex-col mb-1 border border-blue-500"
                :style="{
                  left: `${idx * 50}px`,
                  width: `calc(100% - ${idx * 50}px)`,
                  height: (parseDurationToHours(ev.duration) * 40) + 'px',
                  zIndex: 2,
                  background: '#2563eb',
                  color: 'white',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
                  // Position event vertically within the hour cell based on its start minute
                  top: `${parseInt(ev.time.split(':')[1] || '0', 10) * (40 / 60)}px`,
                }"
              >
                <div class="font-bold">{{ ev.title }}</div>
                <div class="text-xs text-slate-200">{{ ev.time }} - {{ eventEndTime(ev.time, ev.duration) }}</div>
              </div>
            </template>
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
  return dummyEvents.filter(ev => {
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
</script>
