<template>
  <section class="p-6 max-w-full mx-auto">
    <button
      @click="goBack"
      class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 mb-4"
    >
      ← Back to Events & Bookings
    </button>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">Error loading bookings.</div>

    <div v-else>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold mb-1">
            Bookings for "{{ event.name }}" (ID: {{ eventId }})
          </h1>
          <p class="text-gray-600">
            {{ formatDate(event.date, 'MMM dd, yyyy') }} at {{ event.venue }}
          </p>
        </div>

        <!-- Export to Excel -->
        <button
          @click="exportExcel"
          :disabled="exporting"
          class="px-4 py-2 rounded text-white"
          :class="exporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'"
        >
          {{ exporting ? 'Exporting…' : 'Export to Excel' }}
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Gross (Subtotal)</div>
          <div class="mt-1 text-2xl font-semibold">{{ money(grossAmount) }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Total Discount Given</div>
          <div class="mt-1 text-2xl font-semibold text-red-600">{{ money(totalDiscount) }}</div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="text-sm text-gray-500">Total Collection (Received)</div>
          <div class="mt-1 text-2xl font-semibold text-emerald-700">{{ money(totalCollection) }}</div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full text-sm text-gray-700">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th class="px-4 py-3 text-left">Booking ID</th>
              <th class="px-4 py-3 text-left">Seats</th>
              <th class="px-4 py-3 text-left">Name</th>
              <th class="px-4 py-3 text-left">Email</th>
              <th class="px-4 py-3 text-left">Phone</th>
              <th class="px-4 py-3 text-left">Coupon</th>
              <th class="px-4 py-3 text-left">Discount</th>
              <th class="px-4 py-3 text-left">Amount Paid</th>
              <th class="px-4 py-3 text-left">Booked At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in paginatedBookings"
              :key="b.id"
              class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
            >
              <td class="px-4 py-3">{{ b.id }}</td>
              <td class="px-4 py-3">{{ b.pax }}</td>
              <td class="px-4 py-3">{{ b.userName || '—' }}</td>
              <td class="px-4 py-3">{{ b.userEmail || '—' }}</td>
              <td class="px-4 py-3">{{ b.userPhone || '—' }}</td>
              <td class="px-4 py-3">
                <span v-if="b.couponCode" class="inline-flex items-center gap-1">
                  <span class="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800 border border-amber-200">
                    {{ b.couponCode }}
                  </span>
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="b.discountAmount != null">{{ money(b.discountAmount) }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="b.total != null">{{ money(b.total) }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-4 py-3">{{ formatDateTime(b.bookedAt, 'MMM dd, yyyy hh:mm a') }}</td>
            </tr>
            <tr v-if="bookings.length === 0">
              <td colspan="9" class="p-4 text-center text-gray-600">
                No bookings yet.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          class="flex justify-between items-center p-4 border-t bg-gray-50 text-sm text-gray-600"
        >
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
    </div>
  </section>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { useEventsService } from '~/composables/useEventsService'
import { useEventBookingService } from '~/composables/useEventBookingService'
import { useSettingsService } from '@/composables/useSettingsService'
import { formatDate, formatDateTime } from '@/utils/timezone'

const route = useRoute()
const router = useRouter()
const eventId = Number(route.params.id)

const { getEventById } = useEventsService()
const { fetchBookings } = useEventBookingService()
const { getSettings } = useSettingsService()

const event = ref(null)
const bookings = ref([])
const loading = ref(true)
const error = ref(false)
const exporting = ref(false)

const currency = ref('INR')

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return bookings.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(bookings.value.length / itemsPerPage || 1)
)

const grossAmount = computed(() =>
  bookings.value.reduce((sum, b) => sum + (Number(b.subtotal) || 0), 0)
)
const totalDiscount = computed(() =>
  bookings.value.reduce((sum, b) => sum + (Number(b.discountAmount) || 0), 0)
)
const totalCollection = computed(() =>
  bookings.value.reduce((sum, b) => sum + (Number(b.total) || 0), 0)
)

function money(n) {
  try {
    return new Intl.NumberFormat(currency.value === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency.value,
      maximumFractionDigits: 2,
    }).format(Number(n) || 0)
  } catch {
    const v = (Number(n) || 0).toFixed(2)
    return `${currency.value} ${v}`
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function goBack() {
  router.push('/admin/events/bookings')
}

async function exportExcel() {
  try {
    exporting.value = true
    const xlsx = await import('xlsx')

    const headers = [
      'Booking ID',
      'Seats',
      'Name',
      'Email',
      'Phone',
      'Coupon',
      'Subtotal',
      'Discount',
      'Amount Paid',
      'Booked At',
    ]

    const rows = bookings.value.map(b => [
      b.id,
      b.pax,
      b.userName || '—',
      b.userEmail || '—',
      b.userPhone || '—',
      b.couponCode || '—',
      Number(b.subtotal ?? 0),
      Number(b.discountAmount ?? 0),
      Number(b.total ?? 0),
      formatDateTime(b.bookedAt, 'MMM dd, yyyy hh:mm a'),
    ])

    // Create worksheet with currency formatting for money columns
    const aoa = [headers, ...rows]
    const ws  = xlsx.utils.aoa_to_sheet(aoa)

    // Column widths
    ws['!cols'] = [
      { wch: 10 }, // ID
      { wch: 6  }, // Seats
      { wch: 20 }, // Name
      { wch: 24 }, // Email
      { wch: 14 }, // Phone
      { wch: 14 }, // Coupon
      { wch: 14 }, // Subtotal
      { wch: 12 }, // Discount
      { wch: 14 }, // Amount Paid
      { wch: 20 }, // Booked At
    ]

    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'Bookings')

    const today = new Date().toISOString().split('T')[0]
    const safeName = (event.value?.name || 'Event').replace(/[^\w\-]+/g, '_')
    const filename = `${safeName}_${today}_Bookings.xlsx`

    xlsx.writeFile(wb, filename)
  } catch (e) {
    console.error('Excel export failed:', e)
    alert('Export failed. See console for details.')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  try {
    const s = await getSettings()
    currency.value = s?.currency || 'INR'
  } catch {
    currency.value = 'INR'
  }

  try {
    event.value = await getEventById(eventId)
    bookings.value = await fetchBookings(eventId)
  } catch (e) {
    console.error('Error loading:', e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
