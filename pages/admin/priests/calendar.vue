<!-- File: pages/admin/calendar.vue (or wherever you show the priests calendar) -->
<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4">Priests Calendar</h2>
    <client-only>
      <FullCalendar :options="calendarOptions" />
    </client-only>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useBookingService } from '@/composables/useBookingService'

const router = useRouter()
const { getAllBookings } = useBookingService()
const events = ref([])

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  timeZone: 'Asia/Kolkata',
  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',
  height: 'auto',
  nowIndicator: true,
  navLinks: true,
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  events, // reactive
  eventClick(info) {
    info.jsEvent?.preventDefault()
    if (info.event.id) router.push(`/admin/bookings/${info.event.id}`)
  },
  // Show both pooja + priest inside the event chip
  eventContent(arg) {
    const el = document.createElement('div')
    const priest = arg.event.extendedProps.priestName
    const pooja  = arg.event.title
    el.innerHTML = `<div class="fc-titleline"><b>${pooja}</b>${priest ? ' · ' + priest : ''}</div>`
    return { domNodes: [el] }
  },
  // Tooltip on hover
  eventDidMount(arg) {
    arg.el.title = [
      arg.event.title,
      arg.event.extendedProps.priestName ? `Priest: ${arg.event.extendedProps.priestName}` : '',
      arg.event.extendedProps.userName ? `Booked by: ${arg.event.extendedProps.userName}` : ''
    ].filter(Boolean).join('\n')
  }
})

function colorMap(bookings) {
  const palette = ['#3b82f6','#10b981','#ef4444','#8b5cf6','#f59e0b','#06b6d4','#ec4899','#22c55e','#eab308']
  const map = new Map()
  let i = 0
  for (const b of bookings) {
    const key = b.priest?.id ?? 'unknown'
    if (!map.has(key)) map.set(key, palette[i++ % palette.length])
  }
  return map
}

onMounted(async () => {
  const data = await getAllBookings()
  const priestColors = colorMap(data)

  events.value = data.map(b => ({
    id: String(b.id),
    title: b.pooja?.name || `Booking #${b.id}`,
    start: new Date(b.start),
    end:   new Date(b.end),
    backgroundColor: priestColors.get(b.priest?.id ?? 'unknown'),
    borderColor: priestColors.get(b.priest?.id ?? 'unknown'),
    extendedProps: {
      priestName: b.priest?.name || '',
      userName: b.userName || ''
    }
  }))
})
</script>

<style>
/* Polished look */
.fc .fc-toolbar-title { font-size: 1.1rem; }
.fc .fc-daygrid-event { border-radius: 6px; padding: 2px 4px; }
.fc .fc-timegrid-event { border-radius: 8px; }
</style>
