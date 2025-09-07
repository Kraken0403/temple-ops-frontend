<template>
  <section class="p-6 max-w-full mx-auto">
    <!-- Header + Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <h1 class="text-2xl font-bold">Pooja Bookings</h1>

      <div class="flex flex-wrap gap-3 items-center">
        <!-- Free-text Search -->
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search bookings…"
          class="border px-3 py-2 rounded w-full sm:w-64"
        />

        <!-- Booking-Date Range -->
        <input
          v-model="dateFrom"
          type="date"
          class="border px-3 py-2 rounded"
          placeholder="From"
        />
        <input
          v-model="dateTo"
          type="date"
          class="border px-3 py-2 rounded"
          placeholder="To"
        />

        <!-- Priest Filter (snapshot) -->
        <select v-model="selectedPriest" class="border px-3 py-2 rounded">
          <option value="">All Priests</option>
          <option v-for="priest in priestOptions" :key="priest" :value="priest">
            {{ priest }}
          </option>
        </select>

        <!-- Status Filter -->
        <select v-model="selectedStatus" class="border px-3 py-2 rounded">
          <option value="">All Statuses</option>
          <option v-for="s in statusOptions" :key="s" :value="s">
            {{ s }}
          </option>
        </select>

        <!-- Export -->
        <button
          @click="downloadCSV"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>
    </div>

    <!-- Loading / Empty States -->
    <div v-if="error" class="text-red-600">Failed to load bookings.</div>
    <div v-else-if="!bookings.length && !loading" class="text-gray-600">
      No bookings found.
    </div>
    <div v-else-if="loading" class="text-gray-400">Loading...</div>

    <!-- Table + Pagination -->
    <div
      v-else-if="!loading && filteredBookings.length"
      class="bg-white shadow rounded-lg overflow-hidden"
    >
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3 text-left">Booking ID</th>
            <th class="px-4 py-3 text-left">Pooja</th>
            <th class="px-4 py-3 text-left">Priest</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Booking Date</th>
            <th class="px-4 py-3 text-left">Start</th>
            <th class="px-4 py-3 text-left">End</th>
            <th class="px-4 py-3 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="booking in paginatedBookings"
            :key="booking.id"
            class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer transition"
            @click="goToBooking(booking.id)"
          >
            <td class="px-4 py-3">#{{ booking.id }}</td>
            <td class="px-4 py-3">{{ booking.poojaNameAtBooking || booking.pooja?.name || '—' }}</td>
            <td class="px-4 py-3">{{ booking.priestNameAtBooking || booking.priest?.name || '—' }}</td>
            <td class="px-4 py-3">{{ booking.status }}</td>
            <td class="px-4 py-3">{{ formatDate(booking.bookingDate) }}</td>
            <td class="px-4 py-3">{{ formatDateTime(booking.start) }}</td>
            <td class="px-4 py-3">{{ formatDateTime(booking.end) }}</td>
            <td class="px-4 py-3">
              {{ formatMoney(booking.amountAtBooking, settingsCurrency) }}
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

import { ref, computed, onMounted } from 'vue'
import { useBookingService } from '@/composables/useBookingService'
import { useRouter } from '#app'
import { useSettingsService } from '@/composables/useSettingsService'

const { getAllBookings } = useBookingService()
const { getSettings } = useSettingsService()

const bookings    = ref([])
const loading     = ref(true)
const error       = ref(false)

const searchTerm      = ref('')
const dateFrom        = ref('')
const dateTo          = ref('')
const selectedPriest  = ref('')
const selectedStatus  = ref('')
const currentPage     = ref(1)
const itemsPerPage    = 15

const settingsCurrency = ref('INR')

const router = useRouter()

// dropdown options (based on snapshot names)
const priestOptions = computed(() =>
  [...new Set(bookings.value.map(b => b.priestNameAtBooking || b.priest?.name).filter(Boolean))]
)
const statusOptions = computed(() =>
  [...new Set(bookings.value.map(b => b.status).filter(Boolean))]
)

const filteredBookings = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return bookings.value.filter(b => {
    // text search (use snapshot names)
    const hay = [
      b.id,
      b.poojaNameAtBooking || b.pooja?.name,
      b.priestNameAtBooking || b.priest?.name,
      b.status
    ].filter(Boolean).join(' ').toLowerCase()

    const matchSearch = !term || hay.includes(term)

    // priest/status filters (snapshot)
    const priestName = b.priestNameAtBooking || b.priest?.name
    const matchPriest = !selectedPriest.value || priestName === selectedPriest.value
    const matchStatus = !selectedStatus.value || b.status === selectedStatus.value

    // bookingDate range
    const bd = new Date(b.bookingDate)
    const fromOK = !dateFrom.value || bd >= new Date(dateFrom.value)
    const toOK   = !dateTo.value   || bd <= new Date(dateTo.value)

    return matchSearch && matchPriest && matchStatus && fromOK && toOK
  })
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredBookings.value.slice(start, start + itemsPerPage)
})
const totalPages = computed(() =>
  Math.ceil(filteredBookings.value.length / itemsPerPage)
)

onMounted(async () => {
  try {
    // Load currency first (for formatting)
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch {
      settingsCurrency.value = 'INR'
    }

    bookings.value = await getAllBookings()
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function goToBooking(id) {
  router.push(`/admin/bookings/${id}`)
}

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return '—'
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    }).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function downloadCSV() {
  const date = new Date().toISOString().split('T')[0]
  const rows = filteredBookings.value.map(b => [
    b.id,
    (b.poojaNameAtBooking || b.pooja?.name || ''),
    (b.priestNameAtBooking || b.priest?.name || ''),
    b.status,
    formatDate(b.bookingDate),
    formatDateTime(b.start),
    formatDateTime(b.end),
    // keep amount numeric + add currency column for clean CSV
    Number(b.amountAtBooking ?? 0),
    settingsCurrency.value
  ])
  const csv = [
    ['ID','Pooja','Priest','Status','Booking Date','Start','End','Amount','Currency'],
    ...rows
  ].map(r =>
    r.map(v => {
      const s = String(v ?? '')
      // simple CSV escaping
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  ).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `pooja-bookings-${date}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
