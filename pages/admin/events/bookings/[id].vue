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
            {{ formatDate(event.date) }} at {{ event.venue }}
          </p>
        </div>

        <!-- ⬇️ Export to Excel -->
        <button
          @click="exportExcel"
          :disabled="exporting"
          class="px-4 py-2 rounded text-white"
          :class="exporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'"
        >
          {{ exporting ? 'Exporting…' : 'Export to Excel' }}
        </button>
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
              <td class="px-4 py-3">{{ formatDateTime(b.bookedAt) }}</td>
            </tr>
            <tr v-if="bookings.length === 0">
              <td colspan="6" class="p-4 text-center text-gray-600">
                No bookings yet.
              </td>
            </tr>
          </tbody>
        </table>

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

const route = useRoute()
const router = useRouter()
const eventId = Number(route.params.id)

const { getEventById } = useEventsService()
const { fetchBookings } = useEventBookingService()

const event = ref(null)
const bookings = ref([])
const loading = ref(true)
const error = ref(false)
const exporting = ref(false)

const currentPage = ref(1)
const itemsPerPage = 15

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return bookings.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(bookings.value.length / itemsPerPage)
)

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function goBack() {
  router.push('/admin/events/bookings')
}

/** ⬇️ Export to Excel using SheetJS (xlsx) */
async function exportExcel() {
  try {
    exporting.value = true
    const xlsx = await import('xlsx')

    const headers = ['Booking ID', 'Seats', 'Name', 'Email', 'Phone', 'Booked At']
    const rows = bookings.value.map(b => [
      b.id,
      b.pax,
      b.userName || '—',
      b.userEmail || '—',
      b.userPhone || '—',
      formatDateTime(b.bookedAt),
    ])

    const aoa = [headers, ...rows]
    const ws  = xlsx.utils.aoa_to_sheet(aoa)

    // Optional: auto width
    ws['!cols'] = headers.map((h, i) => {
      const colVals = [h, ...rows.map(r => String(r[i] ?? ''))]
      const maxLen = Math.max(...colVals.map(v => v.length))
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) }
    })

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
