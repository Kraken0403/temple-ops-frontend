<!-- File: pages/admin/sponsorships/bookings.vue -->
<template>
  <section class="p-6 max-w-full mx-auto">
    <!-- Header + Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <h1 class="text-2xl font-bold">Sponsorship Bookings</h1>

      <div class="flex flex-wrap gap-3 items-center">
        <!-- Search -->
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search sponsor, email, phone, type, event…"
          class="border px-3 py-2 rounded w-full sm:w-64"
          @keyup.enter="currentPage = 1"
        />

        <!-- BookedAt range -->
        <input
          v-model="dateFrom"
          type="date"
          class="border px-3 py-2 rounded"
          placeholder="From"
          @change="currentPage = 1"
        />
        <input
          v-model="dateTo"
          type="date"
          class="border px-3 py-2 rounded"
          placeholder="To"
          @change="currentPage = 1"
        />

        <!-- Type filter -->
        <select v-model="typeFilter" class="border px-3 py-2 rounded" @change="currentPage = 1">
          <option value="">All Types</option>
          <option value="event">Event</option>
          <option value="general">General</option>
        </select>

        <!-- Event filter (only relevant to event type) -->
        <select
          v-model="eventFilter"
          class="border px-3 py-2 rounded"
          :disabled="typeFilter === 'general'"
          @change="currentPage = 1"
        >
          <option value="">All Events</option>
          <option v-for="ev in eventOptions" :key="ev" :value="ev">
            {{ ev }}
          </option>
        </select>

        <!-- Status filter -->
        <!-- <select v-model="selectedStatus" class="border px-3 py-2 rounded" @change="currentPage = 1">
          <option value="">All Statuses</option>
          <option v-for="s in statusOptions" :key="s" :value="s">
            {{ s }}
          </option>
        </select> -->

        <!-- Export -->
        <button
          @click="downloadXLSX"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export Excel
        </button>
      </div>
    </div>

    <!-- States -->
    <div v-if="error" class="text-red-600">Failed to load bookings.</div>
    <div v-else-if="!rows.length && !loading" class="text-gray-600">No bookings found.</div>
    <div v-else-if="loading" class="text-gray-400">Loading...</div>

    <!-- Table -->
    <div
      v-else-if="!loading && filtered.length"
      class="bg-white shadow rounded-lg overflow-hidden"
    >
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3 text-left">ID</th>
            <th class="px-4 py-3 text-left">Type</th>
            <th class="px-4 py-3 text-left">Event</th>
            <th class="px-4 py-3 text-left">Sponsor</th>
            <th class="px-4 py-3 text-left">Contact</th>
            <!-- <th class="px-4 py-3 text-left">Status</th> -->
            <th class="px-4 py-3 text-left">Booked At</th>
            <th class="px-4 py-3 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="b in paginated"
            :key="b.id"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="px-4 py-3">#{{ b.id }}</td>
            <td class="px-4 py-3">
              {{ b.eventSponsorship?.sponsorshipType?.name || '—' }}
            </td>
            <td class="px-4 py-3">
              <span v-if="b.eventSponsorship?.event?.name">{{ b.eventSponsorship.event.name }}</span>
              <span v-else class="text-gray-500">General</span>
            </td>
            <td class="px-4 py-3">{{ b.sponsorName || '—' }}</td>
            <td class="px-4 py-3">
              <div>{{ b.sponsorPhone || '—' }}</div>
              <div class="text-xs text-gray-500">{{ b.sponsorEmail || '—' }}</div>
            </td>
            <!-- <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded text-xs" :class="statusClass(b.status)">
                {{ b.status || 'pending' }}
              </span>
            </td> -->
            <td class="px-4 py-3">{{ fmtDateTime(b.bookedAt) }}</td>
            <td class="px-4 py-3">
              {{ formatMoney(priceOf(b), settingsCurrency) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex justify-between items-center p-4 border-t bg-gray-50 text-sm text-gray-600">
        <div>Page {{ currentPage }} of {{ totalPages }}</div>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import { useSponsorshipService } from '@/composables/useSponsorshipService'
import { useSettingsService } from '@/composables/useSettingsService'

const { getAllSponsorshipBookings } = useSponsorshipService()
const { getSettings } = useSettingsService()

const rows = ref([])
const loading = ref(true)
const error = ref(false)

// filters
const searchTerm = ref('')
const dateFrom = ref('')       // bookedAt >=
const dateTo   = ref('')       // bookedAt <=
const typeFilter = ref('')     // '', 'event', 'general'
const eventFilter = ref('')    // event name
const selectedStatus = ref('') // pending/confirmed/failed

// paging
const currentPage = ref(1)
const perPage = 15

const settingsCurrency = ref('INR')

onMounted(async () => {
  try {
    const s = await getSettings().catch(() => null)
    settingsCurrency.value = s?.currency || 'INR'
    const data = await getAllSponsorshipBookings()
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
})

watch([searchTerm, dateFrom, dateTo, typeFilter, eventFilter, selectedStatus], () => {
  currentPage.value = 1
})

/* ---------- options ---------- */
const eventOptions = computed(() => {
  const names = rows.value
    .map(b => b?.eventSponsorship?.event?.name)
    .filter(Boolean)
  return [...new Set(names)]
})

const statusOptions = computed(() => {
  const s = rows.value.map(b => b?.status).filter(Boolean)
  return [...new Set(s)]
})

/* ---------- helpers ---------- */
function fmtDateTime(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString() } catch { return '—' }
}
function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency', currency: code, maximumFractionDigits: 0
    }).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}
function priceOf(b) {
  // row price = per-assignment price or fallback to type price
  return b?.eventSponsorship?.price ?? b?.eventSponsorship?.sponsorshipType?.price ?? null
}
function statusClass(s) {
  const k = String(s || '').toLowerCase()
  if (k === 'confirmed') return 'bg-green-100 text-green-700'
  if (k === 'failed')    return 'bg-red-100 text-red-700'
  if (k === 'pending')   return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-700'
}

/* ---------- filtering + paging ---------- */
const filtered = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const from = dateFrom.value ? new Date(dateFrom.value) : null
  const to   = dateTo.value   ? new Date(dateTo.value)   : null

  return rows.value.filter(b => {
    // text haystack
    const typeName = b?.eventSponsorship?.sponsorshipType?.name || ''
    const evName   = b?.eventSponsorship?.event?.name || 'General'
    const hay = [
      b?.id, typeName, evName, b?.sponsorName, b?.sponsorEmail, b?.sponsorPhone, b?.status
    ].filter(Boolean).join(' ').toLowerCase()
    const matchSearch = !term || hay.includes(term)

    // date range on bookedAt
    const booked = b?.bookedAt ? new Date(b.bookedAt) : null
    const fromOK = !from || (booked && booked >= from)
    const toOK   = !to   || (booked && booked <= to)

    // type filter
    const isEvent = !!b?.eventSponsorship?.event
    const matchType =
      !typeFilter.value ||
      (typeFilter.value === 'event' && isEvent) ||
      (typeFilter.value === 'general' && !isEvent)

    // event name filter (only if not 'general')
    const matchEvent =
      !eventFilter.value || (!isEvent ? false : (b.eventSponsorship.event.name === eventFilter.value))

    // status
    const matchStatus = !selectedStatus.value || b?.status === selectedStatus.value

    return matchSearch && fromOK && toOK && matchType && matchEvent && matchStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated  = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})
function goToPage(p) {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}

/* ---------- Excel Export ---------- */
function downloadXLSX() {
  if (!filtered.value.length) return

  const data = filtered.value.map(b => ({
    'Booking ID' : b.id,
    'Type'       : b?.eventSponsorship?.sponsorshipType?.name || '',
    'Event'      : b?.eventSponsorship?.event?.name || 'General',
    'Sponsor'    : b?.sponsorName || '',
    'Email'      : b?.sponsorEmail || '',
    'Phone'      : b?.sponsorPhone || '',
    // 'Status'     : b?.status || '',
    'Booked At'  : fmtDateTime(b?.bookedAt),
    'Price'      : priceOf(b) != null ? priceOf(b) : '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sponsorship Bookings')
  XLSX.writeFile(wb, `sponsorship_bookings_${new Date().toISOString().slice(0,10)}.xlsx`)
}
</script>
