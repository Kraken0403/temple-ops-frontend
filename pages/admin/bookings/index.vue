<!-- pages/admin/bookings/index.vue -->
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
          @keyup.enter="currentPage = 1"
        />

        <!-- Booking-Date Range -->
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

        <!-- Priest Filter (snapshot) -->
        <select v-model="selectedPriest" class="border px-3 py-2 rounded" @change="currentPage = 1">
          <option value="">All Priests</option>
          <option v-for="priest in priestOptions" :key="priest" :value="priest">
            {{ priest }}
          </option>
        </select>

        <!-- Status Filter -->
        <select v-model="selectedStatus" class="border px-3 py-2 rounded" @change="currentPage = 1">
          <option value="">All Statuses</option>
          <option v-for="s in statusOptions" :key="s" :value="s">
            {{ s }}
          </option>
        </select>

        <!-- Export -->
        <button
          @click="downloadXLSX"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export Excel
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
            <td class="px-4 py-3" @click.stop>
              <NuxtLink
                :to="`/admin/bookings/${booking.id}`"
                class="text-blue-600 hover:underline"
              >
                #{{ booking.id }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3">
              {{ booking.poojaNameAtBooking || booking.pooja?.name || '—' }}
            </td>
            <td class="px-4 py-3">
              {{ booking.priestNameAtBooking || booking.priest?.name || '—' }}
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-0.5 rounded text-xs"
                :class="statusClass(booking.status)"
              >
                {{ booking.status }}
              </span>
            </td>
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

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { useBookingService } from '@/composables/useBookingService'
import { useSettingsService } from '@/composables/useSettingsService'
import { formatDate, formatDateTime } from '@/utils/timezone'
import * as XLSX from 'xlsx'

const router = useRouter()
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

const priestOptions = computed(() =>
  [...new Set(bookings.value.map(b => b.priestNameAtBooking || b.priest?.name).filter(Boolean))]
)
const statusOptions = computed(() =>
  [...new Set(bookings.value.map(b => b.status).filter(Boolean))]
)

const filteredBookings = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return bookings.value.filter(b => {
    const hay = [
      b.id,
      b.poojaNameAtBooking || b.pooja?.name,
      b.priestNameAtBooking || b.priest?.name,
      b.status,
      b.userName,
      b.userEmail,
      b.userPhone
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchSearch = !term || hay.includes(term)
    const priestName  = b.priestNameAtBooking || b.priest?.name
    const matchPriest = !selectedPriest.value || priestName === selectedPriest.value
    const matchStatus = !selectedStatus.value || b.status === selectedStatus.value

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
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
    bookings.value = await getAllBookings()
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
})

// reset to page 1 whenever filters change
watch([searchTerm, dateFrom, dateTo, selectedPriest, selectedStatus], () => {
  currentPage.value = 1
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
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

/** ✅ Status → Tailwind chip classes */
function statusClass(s) {
  const key = String(s || '').toLowerCase()
  if (key === 'confirmed') return 'bg-green-100 text-green-700'
  if (key === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (key === 'pending')   return 'bg-yellow-100 text-yellow-800'
  if (key === 'canceled')  return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

/* ─────────────── 🟢 Excel Export ─────────────── */
function downloadXLSX() {
  if (!filteredBookings.value.length) return

  const data = filteredBookings.value.map(b => ({
    'Booking ID'   : b.id,
    'Pooja Name'   : b.poojaNameAtBooking || b.pooja?.name || '',
    'Priest Name'  : b.priestNameAtBooking || b.priest?.name || '',
    'Status'       : b.status,
    'Booking Date' : formatDate(b.bookingDate),
    'Start Time'   : formatDateTime(b.start),
    'End Time'     : formatDateTime(b.end),
    'Amount'       : formatMoney(b.amountAtBooking, settingsCurrency.value),
    'User Name'    : b.userName || '',
    'User Email'   : b.userEmail || '',
    'User Phone'   : b.userPhone || '',
    'Venue Address': b.venueAddress || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pooja Bookings')
  XLSX.writeFile(workbook, `pooja_bookings_${new Date().toISOString().slice(0,10)}.xlsx`)
}
</script>
