<template>
  <div class="rounded-lg bg-white p-6 shadow-sm min-h-[400px]" ref="calendarContainerRef">
    <div class="flex items-center justify-between mb-4">
      <button @click="$emit('prev')" class="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
      <h2 class="text-lg font-semibold">{{ monthYearLabel }}</h2>
      <button @click="$emit('next')" class="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
    </div>
    <div class="flex text-center text-gray-500 font-medium">
      <div v-for="d in weekDays" :key="d" class="flex-1 py-2 border border-r-0 last:border-r border-gray-300">{{ d }}</div>
    </div>
    <div ref="gridContainerRef">
      <div v-for="row in calendarRows" :key="'row-' + row" class="flex">
        <div
          v-for="col in 7"
          :key="'cell-' + ((row-1)*7 + (col-1))"
          :data-cell-index="(row-1)*7 + (col-1)"
          class="flex-1 h-25 cursor-pointer select-none flex flex-col items-start justify-start p-2 border border-r-0 last:border-r border-gray-300 border-t-0 relative"
          :class="[
            (calendarCells[(row-1)*7 + (col-1)]?.isToday ? 'bg-orange-100 font-bold' : ''),
            (calendarCells[(row-1)*7 + (col-1)]?.isOtherMonth ? 'text-gray-400 bg-gray-50' : ''),
            (dropTargetCellIndex === (row-1)*7 + (col-1) && isDragging ? 'ring-2 ring-blue-400 ring-inset' : '')
          ]"
        >
          <div class="text-sm mb-1">{{ calendarCells[(row-1)*7 + (col-1)]?.day }}</div>
          <div class="flex flex-col w-full gap-0.5">
            <div
              v-for="(ev, evIndex) in getDisplayEventsForCell((row-1)*7 + (col-1))"
              :key="ev.id"
              class="text-xs bg-blue-600 text-white rounded px-1.5 py-0.5 w-full truncate cursor-grab active:cursor-grabbing"
              :class="[
                (isDragging && draggingEventId === ev.id ? 'ring-2 ring-white shadow-lg' : '')
              ]"
              @mousedown.stop="onEventMouseDown($event, ev, (row-1)*7 + (col-1), evIndex)"
              @click.stop="onEventClick(ev)"
            >
              {{ ev.title }} <span class="ml-1 opacity-75">({{ ev.time }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <EventDialog
      v-if="eventDialogShow"
      :show="eventDialogShow"
      :mode="eventDialogMode"
      :event="eventDialogEvent ?? undefined"
      @close="onEventDialogClose"
      @save="onEventDialogSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EventDialog from './CalendarEventDialog.vue'

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  [key: string]: any;
}

const props = defineProps({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  today: { type: Object, required: true },
  events: { type: Array as () => CalendarEvent[], required: false, default: () => [] },
})

const emit = defineEmits(['prev', 'next', 'event-change'])

const calendarContainerRef = ref<HTMLElement | null>(null)
const gridContainerRef = ref<HTMLElement | null>(null)

// Drag state (declared before watch that uses them)
const draggingEventId = ref<string | null>(null)
const isDragging = ref(false)
const dragStartCellIndex = ref(-1)
const dropTargetCellIndex = ref(-1)
const currentInsertIndex = ref(-1)
const dragStartPos = ref({ x: 0, y: 0 })
const dragThreshold = 5

// Local copy of events for live manipulation during drag
const localEvents = ref<CalendarEvent[]>([])

// Sync local events with props
watch(() => props.events, (newEvents) => {
  if (!isDragging.value) {
    localEvents.value = newEvents.map(ev => ({ ...ev }))
  }
}, { immediate: true, deep: true })

const eventDialogShow = ref(false)
const eventDialogMode = ref<'edit' | 'create'>('edit')
const eventDialogEvent = ref<CalendarEvent | null>(null)

function onEventClick(ev: CalendarEvent) {
  if (isDragging.value) return
  eventDialogMode.value = 'edit'
  eventDialogEvent.value = { ...ev }
  eventDialogShow.value = true
}

function onEventDialogClose() {
  eventDialogShow.value = false
  eventDialogEvent.value = null
}

function onEventDialogSave(editedEvent: CalendarEvent) {
  emit('event-change', editedEvent)
  onEventDialogClose()
}

function getCellForEvent(ev: CalendarEvent): number {
  // Find which cell index this event belongs to
  const eventDay = ev.date.getDate()
  const eventMonth = ev.date.getMonth()
  const eventYear = ev.date.getFullYear()
  
  if (eventMonth !== props.month || eventYear !== props.year) return -1
  
  const idx = calendarCells.value.findIndex(cell => 
    !cell.isOtherMonth && cell.day === eventDay
  )
  return idx
}

function getDisplayEventsForCell(cellIndex: number): CalendarEvent[] {
  const cell = calendarCells.value[cellIndex]
  if (!cell || cell.isOtherMonth) return []
  
  return localEvents.value
    .filter(ev => {
      return ev.date.getFullYear() === props.year &&
        ev.date.getMonth() === props.month &&
        ev.date.getDate() === cell.day
    })
    .sort((a, b) => {
      const timeA = a.time || '00:00'
      const timeB = b.time || '00:00'
      return timeA.localeCompare(timeB)
    })
}

function onEventMouseDown(e: MouseEvent, ev: CalendarEvent, cellIndex: number, eventIndex: number) {
  e.preventDefault()
  draggingEventId.value = ev.id
  dragStartCellIndex.value = cellIndex
  dragStartPos.value = { x: e.clientX, y: e.clientY }
  dropTargetCellIndex.value = cellIndex
  currentInsertIndex.value = eventIndex
  
  // Make a fresh copy of events for manipulation
  localEvents.value = props.events.map(event => ({ ...event }))
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!draggingEventId.value) return
  
  const dx = Math.abs(e.clientX - dragStartPos.value.x)
  const dy = Math.abs(e.clientY - dragStartPos.value.y)
  
  if (!isDragging.value && (dx > dragThreshold || dy > dragThreshold)) {
    isDragging.value = true
  }
  
  if (!isDragging.value) return
  
  const gridContainer = gridContainerRef.value
  if (!gridContainer) return
  
  const cells = gridContainer.querySelectorAll('[data-cell-index]')
  let foundCellIndex = -1
  let insertIndex = 0
  
  cells.forEach((cell) => {
    const rect = cell.getBoundingClientRect()
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      foundCellIndex = parseInt(cell.getAttribute('data-cell-index') || '-1', 10)
      
      // Calculate insert position within cell
      const eventElements = cell.querySelectorAll('.text-xs.bg-blue-600')
      const relativeY = e.clientY - rect.top
      
      insertIndex = 0
      eventElements.forEach((eventEl, idx) => {
        const eventRect = eventEl.getBoundingClientRect()
        const eventMiddleY = eventRect.top + eventRect.height / 2 - rect.top
        if (relativeY > eventMiddleY) {
          insertIndex = idx + 1
        }
      })
    }
  })
  
  if (foundCellIndex < 0) return
  
  const targetCell = calendarCells.value[foundCellIndex]
  if (!targetCell || targetCell.isOtherMonth) return
  
  // Check if cell or position changed
  const cellChanged = foundCellIndex !== dropTargetCellIndex.value
  const positionChanged = insertIndex !== currentInsertIndex.value
  
  if (cellChanged || positionChanged) {
    dropTargetCellIndex.value = foundCellIndex
    currentInsertIndex.value = insertIndex
    
    // Live reorder: move the dragging event in localEvents
    const draggingEvent = localEvents.value.find(ev => ev.id === draggingEventId.value)
    if (!draggingEvent) return
    
    // Calculate new date for target cell
    const newDate = new Date(props.year, props.month, targetCell.day)
    newDate.setHours(12, 0, 0, 0)
    
    // Update dragging event's date
    draggingEvent.date = newDate
    
    // Get events in target cell (excluding dragging event)
    const targetCellEvents = localEvents.value
      .filter(ev => 
        ev.id !== draggingEventId.value &&
        ev.date.getFullYear() === props.year &&
        ev.date.getMonth() === props.month &&
        ev.date.getDate() === targetCell.day
      )
      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
    
    // Calculate new time based on insert position
    let newTime = draggingEvent.time
    
    if (targetCellEvents.length === 0) {
      // No other events, keep original time or set default
      newTime = draggingEvent.time || '09:00'
    } else if (insertIndex === 0 && targetCellEvents[0]) {
      // Insert at beginning - time before first event
      const firstEvent = targetCellEvents[0]
      const [h = 9, m = 0] = (firstEvent.time || '09:00').split(':').map(Number)
      const newHour = Math.max(0, h - 1)
      newTime = `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    } else if (insertIndex >= targetCellEvents.length) {
      // Insert at end - time after last event
      const lastEvent = targetCellEvents[targetCellEvents.length - 1]
      if (lastEvent) {
        const [h = 9, m = 0] = (lastEvent.time || '09:00').split(':').map(Number)
        const [dh = 1, dm = 0] = (lastEvent.duration || '01:00').split(':').map(Number)
        let newHour = h + dh
        let newMin = m + dm
        if (newMin >= 60) { newHour++; newMin -= 60 }
        if (newHour > 23) { newHour = 23; newMin = 0 }
        newTime = `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`
      }
    } else {
      // Insert between events
      const prevEvent = targetCellEvents[insertIndex - 1]
      const nextEvent = targetCellEvents[insertIndex]
      if (prevEvent && nextEvent) {
        const [ph = 9, pm = 0] = (prevEvent.time || '09:00').split(':').map(Number)
        const [nh = 10, nm = 0] = (nextEvent.time || '10:00').split(':').map(Number)
        // Set time to midpoint
        const prevMinutes = ph * 60 + pm
        const nextMinutes = nh * 60 + nm
        const midMinutes = Math.floor((prevMinutes + nextMinutes) / 2)
        const midHour = Math.floor(midMinutes / 60)
        const midMin = midMinutes % 60
        newTime = `${midHour.toString().padStart(2, '0')}:${midMin.toString().padStart(2, '0')}`
      }
    }
    
    draggingEvent.time = newTime
  }
}

function onMouseUp() {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  
  if (isDragging.value && draggingEventId.value) {
    // Find the modified event and emit change
    const modifiedEvent = localEvents.value.find(ev => ev.id === draggingEventId.value)
    const originalEvent = props.events.find(ev => ev.id === draggingEventId.value)
    
    if (modifiedEvent && originalEvent) {
      emit('event-change', {
        ...originalEvent,
        date: modifiedEvent.date,
        time: modifiedEvent.time
      })
    }
  }
  
  // Reset drag state
  setTimeout(() => {
    isDragging.value = false
    draggingEventId.value = null
    dropTargetCellIndex.value = -1
    currentInsertIndex.value = -1
    dragStartCellIndex.value = -1
    // Sync back with props
    localEvents.value = props.events.map(ev => ({ ...ev }))
  }, 10)
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

// Helper to get events for a given day, sorted by time
function eventsForDay(day: number, isOtherMonth: boolean): CalendarEvent[] {
  if (isOtherMonth) return [];
  return props.events
    .filter(ev => {
      return ev.date.getFullYear() === props.year &&
        ev.date.getMonth() === props.month &&
        ev.date.getDate() === day;
    })
    .sort((a, b) => {
      const timeA = a.time || '00:00'
      const timeB = b.time || '00:00'
      return timeA.localeCompare(timeB)
    });
}
</script>
