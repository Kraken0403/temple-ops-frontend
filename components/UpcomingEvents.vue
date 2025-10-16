<template>
  <section class="py-[100px] bg-[#F5f5f5] w-full mx-auto">
    <div class="mx-auto px-4 max-w-[1190px]">
      <!-- Heading + View All -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-[20px]">
        <h2 class="text-[32px] font-bold">Our Events</h2>
        <NuxtLink
          to="/events"
          class="bg-[#570000] text-white px-[30px] py-[10px] rounded-[30px] text-sm font-semibold uppercase hover:bg-opacity-90 cursor-pointer w-max"
        >
          View All
        </NuxtLink>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative">
          <input
            v-model.trim="search"
            type="text"
            placeholder="Search events by name, venue, or category…"
            class="w-full bg-white border border-gray-200 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#570000]/30"
            @input="onSearch"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
        <div v-if="search" class="mt-2 text-xs text-gray-500">
          Showing results for “<span class="font-medium">{{ search }}</span>”.
          <button class="underline hover:no-underline cursor-pointer" @click="clearSearch">Clear</button>
        </div>
      </div>

      <!-- View controls -->
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="inline-flex rounded-lg overflow-hidden border bg-white">
          <button
            class="cursor-pointer px-4 py-2 text-sm font-medium"
            :class="viewMode === 'list' ? 'bg-[#570000] text-white' : 'hover:bg-gray-50'"
            @click="setView('list')"
          >
            List
          </button>
          <button
            class="cursor-pointer px-4 py-2 text-sm font-medium border-l"
            :class="viewMode === 'week' ? 'bg-[#570000] text-white' : 'hover:bg-gray-50'"
            @click="setView('week')"
          >
            Week
          </button>
          <button
            class="cursor-pointer px-4 py-2 text-sm font-medium border-l"
            :class="viewMode === 'month' ? 'bg-[#570000] text-white' : 'hover:bg-gray-50'"
            @click="setView('month')"
          >
            Month
          </button>
        </div>

        <!-- Period nav -->
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer" @click="goPrevPeriod">
            ‹
          </button>
          <div class="text-sm font-semibold text-gray-800">
            {{ periodLabel }}
          </div>
          <button class="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer" @click="goNextPeriod">
            ›
          </button>
          <button class="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer" @click="goToday">
            Today
          </button>
        </div>
      </div>

      <!-- Layout: main view (left) + upcoming card (right) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- LEFT -->
        <div class="lg:col-span-2">
          <!-- LIST VIEW (paginated by 4 events per page) -->
          <template v-if="viewMode === 'list'">
            <div
              v-if="groupedDays.length === 0 && !error"
              class="bg-white rounded-lg shadow p-8 text-center text-gray-500"
            >
              No matching upcoming events.
            </div>

            <div v-else class="bg-white rounded-[9px] shadow divide-y">
              <div
                v-for="(group, idx) in groupedDays"
                :key="group.key + idx"
                class="p-5 sm:p-6"
              >
                <!-- Day header -->
                <div class="flex items-center gap-4 mb-4">
                  <div class="bg-[#f5f5f5] p-[10px] rounded-[6px] text-center w-16 sm:w-20">
                    <div class="text-xs uppercase tracking-wide text-gray-500">{{ group.weekday }}</div>
                    <div class="text-xl font-bold text-gray-900">{{ group.dayNum }}</div>
                    <div class="text-xs text-gray-500">{{ group.monthShort }}</div>
                  </div>
                  <div class="h-10 w-px bg-gray-200"></div>
                  <div class="text-gray-700">
                    <div class="font-medium">{{ group.longDate }}</div>
                    <div class="text-xs text-gray-500">{{ group.count }} event{{ group.count>1?'s':'' }}</div>
                  </div>
                </div>

                <!-- Events -->
                <ul class="space-y-4">
                  <li
                    v-for="ev in group.items"
                    :key="ev.id"
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-md p-3 hover:bg-gray-50 transition"
                  >
                    <div class="flex items-center gap-3">
                      <div class="mt-1 shrink-0 rounded-full bg-[#570000]/10 text-[#570000] px-2 py-1 text-xs font-semibold">
                        {{ ev.timeRange }}
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900">
                          {{ ev.name }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                          <span v-if="ev.venueTitle">{{ ev.venueTitle }}</span>
                          <span v-if="ev.venueAddress"> — {{ ev.venueAddress }}</span>
                        </div>
                      </div>
                    </div>

                    <NuxtLink
                      :to="`/events/${ev.id}`"
                      class="bg-[#570000] text-white px-4 py-2 rounded-[30px] text-sm font-semibold hover:bg-opacity-90 cursor-pointer"
                    >
                      Book
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Pagination (events-based, 4 per page) -->
            <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2 flex-wrap">
              <button
                class="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-40"
                :disabled="currentPage === 1"
                @click="goPrevPage"
              >
                Prev
              </button>

              <button
                v-for="n in pageButtons"
                :key="n.key"
                class="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer"
                :class="n.page === currentPage ? 'bg-[#570000] text-white border-[#570000]' : ''"
                @click="goToPage(n.page)"
                v-text="n.label"
              />

              <button
                class="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-40"
                :disabled="currentPage === totalPages"
                @click="goNextPage"
              >
                Next
              </button>
            </div>
          </template>

          <!-- WEEK VIEW -->
          <template v-else-if="viewMode === 'week'">
            <div class="bg-white rounded-[9px] shadow overflow-hidden">
              <div class="grid grid-cols-7 border-b bg-gray-50 text-xs sm:text-sm">
                <div v-for="d in weekDays" :key="d.key" class="px-2 py-2 text-center font-medium">
                  {{ d.weekdayShort }}
                </div>
              </div>
              <div class="grid grid-cols-7 divide-x">
                <div
                  v-for="d in weekDays"
                  :key="d.key"
                  class="min-h-[140px] p-2 border-b"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-500">{{ d.monthShort }}</span>
                    <span class="text-sm font-semibold text-gray-800">{{ d.dayNum }}</span>
                  </div>

                  <ul class="space-y-2">
                    <li
                      v-for="ev in eventsByDay.get(d.key) || []"
                      :key="ev.id"
                      class="text-xs bg-[#570000]/5 rounded p-2"
                    >
                      <div class="font-semibold text-[#570000]">{{ ev.timeRange }}</div>
                      <div class="text-gray-800">{{ ev.name }}</div>
                      <NuxtLink
                        :to="`/events/${ev.id}`"
                        class="inline-block mt-1 text-[11px] px-2 py-1 rounded-full bg-[#570000] text-white hover:bg-opacity-90 cursor-pointer"
                      >
                        Book
                      </NuxtLink>
                    </li>
                    <li v-if="(eventsByDay.get(d.key) || []).length === 0" class="text-[11px] text-gray-400">
                      —
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>

          <!-- MONTH VIEW -->
          <template v-else>
            <div class="bg-white rounded-[9px] shadow overflow-hidden">
              <div class="grid grid-cols-7 border-b bg-gray-50 text-xs sm:text-sm">
                <div v-for="label in weekHeader" :key="label" class="px-2 py-2 text-center font-medium">
                  {{ label }}
                </div>
              </div>

              <div class="grid grid-cols-7">
                <div
                  v-for="cell in monthGrid"
                  :key="cell.key"
                  class="min-h-[120px] p-2 border-b border-r last:border-r-0"
                  :class="cell.inMonth ? 'bg-white' : 'bg-gray-50'"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-gray-500">{{ cell.monthShort }}</span>
                    <span class="text-sm font-semibold text-gray-800">{{ cell.dayNum }}</span>
                  </div>

                  <ul class="space-y-2">
                    <li
                      v-for="(ev, i) in (eventsByDay.get(cell.key) || []).slice(0,2)"
                      :key="ev.id"
                      class="text-xs bg-[#570000]/5 rounded p-2"
                    >
                      <div class="font-semibold text-[#570000]">{{ ev.timeRange }}</div>
                      <div class="text-gray-800 truncate">{{ ev.name }}</div>
                      <NuxtLink
                        :to="`/events/${ev.id}`"
                        class="inline-block mt-1 text-[11px] px-2 py-1 rounded-full bg-[#570000] text-white hover:bg-opacity-90 cursor-pointer"
                      >
                        Book
                      </NuxtLink>
                    </li>
                    <li
                      v-if="(eventsByDay.get(cell.key) || []).length > 2"
                      class="text-[11px] text-gray-500"
                    >
                      +{{ (eventsByDay.get(cell.key) || []).length - 2 }} more
                    </li>
                    <li v-if="(eventsByDay.get(cell.key) || []).length === 0" class="text-[11px] text-gray-400">
                      —
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>

          <div v-if="error" class="text-red-600 mt-4 text-center">
            Error loading events.
          </div>
        </div>

        <!-- RIGHT: Upcoming highlight card -->
        <aside class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div v-if="nextEvent?.image" class="h-44 w-full overflow-hidden">
              <img :src="nextEvent.image" :alt="nextEvent.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="h-44 bg-gray-100 flex items-center justify-center text-gray-400">
              No Image
            </div>

            <div class="p-5">
              <p class="text-xs font-semibold text-[#570000] uppercase tracking-wide mb-1">Upcoming</p>
              <h3 class="text-lg font-bold text-gray-900 leading-snug">
                {{ nextEvent?.name || 'No upcoming event' }}
              </h3>

              <div v-if="nextEvent" class="mt-3 space-y-2 text-sm text-gray-700">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#570000]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10m-12 9h14a2 2 0 002-2V7a2 2 0 00-2-2h-2M5 21a2 2 0 01-2-2V9a2 2 0 012-2h2"/></svg>
                  <span>{{ nextEvent.dateLine }}</span>
                </div>
                <div class="flex items-center gap-2" v-if="nextEvent.venueTitle || nextEvent.venueAddress">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#570000]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11a3 3 0 100-6 3 3 0 000 6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.5-7.5 10.5-7.5 10.5S4.5 18 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                  <span>
                    {{ nextEvent.venueTitle }}<span v-if="nextEvent.venueAddress"> — {{ nextEvent.venueAddress }}</span>
                  </span>
                </div>
              </div>

              <div class="mt-5 flex gap-3">
                <NuxtLink
                  v-if="nextEvent"
                  :to="`/events/${nextEvent.id}`"
                  class="flex-1 text-center bg-[#570000] text-white rounded-[30px] py-2 text-sm font-semibold hover:bg-opacity-90 cursor-pointer"
                >
                  Book
                </NuxtLink>
                <div v-else class="w-full text-center text-gray-500 text-sm py-2 border rounded-[30px]">
                  Nothing scheduled
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { useEventsService } from '@/composables/useEventsService'
import { useSettingsService } from '@/composables/useSettingsService'

/* ---------------- State ---------------- */
const eventsRaw = ref([])
const error = ref(false)
const search = ref('')

const { fetchEvents } = useEventsService()
const { getSettings } = useSettingsService()
const config = useRuntimeConfig().public

const timezone = ref('Asia/Kolkata') // fallback

// View state
const viewMode = ref('list') // 'list' | 'week' | 'month'
const currentPage = ref(1)   // for list view
const pageSize = ref(4)      // 4 events per page

// Period anchor (YYYY-MM-DD in configured timezone)
const anchorYMD = ref('') // set to "today" on mount

/* ---------------- Lifecycle ---------------- */
onMounted(async () => {
  try {
    const s = await getSettings()
    timezone.value = s.timezone || 'Asia/Kolkata'

    eventsRaw.value = await fetchEvents()

    // init anchor as today in timezone
    anchorYMD.value = ymdForDate(new Date())
  } catch (e) {
    console.error(e)
    error.value = true
  }
})

/* ---------------- Helpers ---------------- */
function onSearch() { if (viewMode.value === 'list') currentPage.value = 1 }
function clearSearch() { search.value = ''; if (viewMode.value === 'list') currentPage.value = 1 }

function fullImageUrl(path) {
  if (!path) return ''
  return String(path).startsWith('http') ? path : `${config.apiBase}${path}`
}

const now = () => new Date()

/** Format a Date into Y-M-D string in configured timezone */
function ymdForDate(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone.value, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date) // e.g. 2025-10-15
}

/** Add days to a YMD (string) and return new YMD (string) */
function addDaysYMD(ymd, days) {
  const d = new Date(`${ymd}T00:00:00Z`) // base ref; we only use ymd semantics
  d.setUTCDate(d.getUTCDate() + days)
  return ymdForDate(d)
}

/** Get weekday index 0..6 for YMD in tz (0=Sun) */
function weekdayIndex(ymd) {
  const parts = ymd.split('-')
  const date = new Date(`${ymd}T12:00:00Z`) // noon to avoid DST edges
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone.value, weekday: 'short' })
    .formatToParts(date)
    .find(p => p.type === 'weekday').value
    // quick map to 0..6:
    .replace('Sun',0).replace('Mon',1).replace('Tue',2).replace('Wed',3).replace('Thu',4).replace('Fri',5).replace('Sat',6)
  )
}

/** Week start (Sunday) for anchor YMD */
function weekStartYMD(ymd) {
  const d = new Date(`${ymd}T12:00:00Z`)
  // weekday number in tz:
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: timezone.value, weekday: 'short' })
    .formatToParts(d).find(p => p.type === 'weekday').value
  const map = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6}
  const off = map[wd] ?? 0
  return addDaysYMD(ymd, -off)
}

/** Month first day YMD for anchor */
function monthFirstYMD(ymd) {
  const [y, m] = ymd.split('-')
  return `${y}-${m}-01`
}

/** Month name label for a YMD */
function monthLabel(ymd) {
  const d = new Date(`${ymd}T12:00:00Z`)
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone.value, month: 'long', year: 'numeric' }).format(d)
}

/** Nicely format a YMD to long date in tz */
function longDate(ymd) {
  const d = new Date(`${ymd}T12:00:00Z`)
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone.value, weekday:'long', month:'long', day:'numeric', year:'numeric' }).format(d)
}

/** Month short / weekday short for YMD */
function monthShort(ymd) {
  const d = new Date(`${ymd}T12:00:00Z`)
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone.value, month:'short' }).format(d)
}
function weekdayShort(ymd) {
  const d = new Date(`${ymd}T12:00:00Z`)
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone.value, weekday:'short' }).format(d)
}
function dayNum(ymd) { return Number(ymd.split('-')[2]) }

/** Formatting for times */
function fmtTimeRange(startIso, endIso) {
  const opts = { hour:'numeric', minute:'2-digit', hour12:true, timeZone: timezone.value }
  const fmt = new Intl.DateTimeFormat('en-US', opts)
  const s = startIso ? fmt.format(new Date(startIso)) : ''
  const e = endIso ? fmt.format(new Date(endIso)) : ''
  return s && e ? `${s} – ${e}` : s || e || 'Time TBA'
}
function fmtDateLine(startIso, endIso) {
  const opts = { weekday:'short', month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', hour12:true, timeZone: timezone.value }
  const fmt = new Intl.DateTimeFormat('en-US', opts)
  if (startIso && endIso) return `${fmt.format(new Date(startIso))} – ${fmt.format(new Date(endIso))}`
  if (startIso) return fmt.format(new Date(startIso))
  return 'Date TBA'
}

/* ---------------- Data shaping ---------------- */
const normalizedUpcoming = computed(() => {
  const n = now()
  return (eventsRaw.value || [])
    .map((e) => {
      const start = e.startDate || e.date || e.startTime ? new Date(e.startDate || e.date || e.startTime) : null
      const end = e.endDate || e.endTime ? new Date(e.endDate || e.endTime) : null
      return {
        id: e.id,
        name: e.name || 'Untitled Event',
        category: e.category || '',
        start,
        end,
        startIso: e.startDate || e.date || e.startTime,
        endIso: e.endDate || e.endTime,
        ymd: start ? ymdForDate(start) : null,
        timeRange: fmtTimeRange(e.startTime || e.startDate, e.endTime || e.endDate),
        dateLine: fmtDateLine(e.startDate || e.startTime || e.date, e.endDate || e.endTime),
        isInTemple: !!e.isInTemple,
        venueTitle: e.venueRel?.title || e.venue || '',
        venueAddress: e.venueRel?.address || '',
        image: fullImageUrl(e.featuredMedia?.url),
      }
    })
    .filter((x) => x.start && x.start >= n) // upcoming only
    .sort((a, b) => a.start - b.start)
})

/* Search */
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return normalizedUpcoming.value
  return normalizedUpcoming.value.filter((e) =>
    e.name.toLowerCase().includes(q) ||
    e.venueTitle.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q)
  )
})

/* ---------- LIST VIEW: pagination by events ---------- */
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const pagedEvents = computed(() => {
  const startIdx = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(startIdx, startIdx + pageSize.value)
})

function goToPage(p) { if (p < 1 || p > totalPages.value) return; currentPage.value = p }
function goPrevPage() { goToPage(currentPage.value - 1) }
function goNextPage() { goToPage(currentPage.value + 1) }

const pageButtons = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const make = (page, label = null) => ({ key: `${page}-${label || page}`, page, label: label || page })
  if (total <= 7) return Array.from({ length: total }, (_, i) => make(i + 1))
  const btns = []
  btns.push(make(1))
  if (cur > 4) btns.push({ key:'dots-left', page: cur - 3, label:'…' })
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  for (let p = start; p <= end; p++) btns.push(make(p))
  if (cur < total - 3) btns.push({ key:'dots-right', page: cur + 3, label:'…' })
  btns.push(make(total))
  return btns
})

/* Group the paged events by YMD for list display */
const groupedDays = computed(() => {
  const map = new Map()
  for (const ev of pagedEvents.value) {
    if (!map.has(ev.ymd)) map.set(ev.ymd, { key: ev.ymd, items: [] })
    map.get(ev.ymd).items.push(ev)
  }
  const arr = Array.from(map.values()).sort((a, b) => (a.key < b.key ? -1 : 1))
  return arr.map((g) => ({
    key: g.key,
    items: g.items,
    count: g.items.length,
    longDate: longDate(g.key),
    monthShort: monthShort(g.key),
    weekday: weekdayShort(g.key),
    dayNum: dayNum(g.key)
  }))
})

/* ---------- WEEK VIEW ---------- */
const weekStart = computed(() => weekStartYMD(anchorYMD.value))
const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const ymd = addDaysYMD(weekStart.value, i)
    days.push({
      key: ymd,
      ymd,
      monthShort: monthShort(ymd),
      weekdayShort: weekdayShort(ymd),
      dayNum: dayNum(ymd)
    })
  }
  return days
})

/* ---------- MONTH VIEW ---------- */
const weekHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthFirst = computed(() => monthFirstYMD(anchorYMD.value))
const monthLabelText = computed(() => monthLabel(anchorYMD.value))
const monthGrid = computed(() => {
  const first = monthFirst.value
  const firstDate = new Date(`${first}T12:00:00Z`)
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: timezone.value, weekday:'short' })
    .formatToParts(firstDate).find(p => p.type === 'weekday').value
  const map = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6}
  const startOffset = map[weekday] ?? 0
  const startYMD = addDaysYMD(first, -startOffset)

  const cells = []
  // 6 rows * 7 days = 42 cells
  for (let i = 0; i < 42; i++) {
    const ymd = addDaysYMD(startYMD, i)
    const inMonth = ymd.startsWith(first.slice(0,7))
    cells.push({
      key: ymd,
      ymd,
      inMonth,
      monthShort: monthShort(ymd),
      weekdayShort: weekdayShort(ymd),
      dayNum: dayNum(ymd)
    })
  }
  return cells
})

/* ---------- Common: events mapped by YMD for week/month ---------- */
const eventsByDay = computed(() => {
  const map = new Map()
  const relevantYMDs = new Set()
  if (viewMode.value === 'week') {
    weekDays.value.forEach(d => relevantYMDs.add(d.ymd))
  } else if (viewMode.value === 'month') {
    monthGrid.value.forEach(c => relevantYMDs.add(c.ymd))
  } else {
    pagedEvents.value.forEach(e => relevantYMDs.add(e.ymd))
  }

  for (const e of filtered.value) {
    if (!e.ymd) continue
    if (!relevantYMDs.size || relevantYMDs.has(e.ymd)) {
      if (!map.has(e.ymd)) map.set(e.ymd, [])
      map.get(e.ymd).push(e)
    }
  }
  // sort each day's events by start time
  for (const [k, arr] of map) arr.sort((a, b) => a.start - b.start)
  return map
})

/* ---------- Period navigation ---------- */
const periodLabel = computed(() => {
  if (viewMode.value === 'list') {
    // Show the first & last day currently visible
    if (groupedDays.value.length === 0) return 'Upcoming Events'
    const first = groupedDays.value[0].key
    const last = groupedDays.value[groupedDays.value.length - 1].key
    if (first === last) return longDate(first)
    return `${longDate(first)} – ${longDate(last)}`
  }
  if (viewMode.value === 'week') {
    const start = weekStart.value
    const end = addDaysYMD(start, 6)
    return `${longDate(start)} – ${longDate(end)}`
  }
  // month
  return monthLabelText.value
})

function setView(v) {
  viewMode.value = v
  if (v === 'list') currentPage.value = 1
  // keep anchorYMD as selected "today" period center
}

function goPrevPeriod() {
  if (viewMode.value === 'list') {
    goPrevPage()
  } else if (viewMode.value === 'week') {
    anchorYMD.value = addDaysYMD(weekStart.value, -7)
  } else {
    // month
    const [y, m] = anchorYMD.value.split('-').map(Number)
    const d = new Date(Date.UTC(y, m - 2, 1)) // previous month first
    anchorYMD.value = ymdForDate(d)
  }
}
function goNextPeriod() {
  if (viewMode.value === 'list') {
    goNextPage()
  } else if (viewMode.value === 'week') {
    anchorYMD.value = addDaysYMD(weekStart.value, 7)
  } else {
    const [y, m] = anchorYMD.value.split('-').map(Number)
    const d = new Date(Date.UTC(y, m, 1)) // next month first
    anchorYMD.value = ymdForDate(d)
  }
}
function goToday() {
  anchorYMD.value = ymdForDate(new Date())
}

/* ---------- Upcoming card ---------- */
const nextEvent = computed(() => filtered.value[0] || null)
</script>

<style scoped>
/* small tweaks if needed */
</style>
