<template>
    <section class="p-6 space-y-4">
      <button
        @click="goBack"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Occurrences
      </button>
  
      <h1 class="text-2xl font-bold">
        Bookings —
        {{ formatDate(occurrence?.occurrenceDate, 'MMM dd, yyyy') }}
      </h1>
  
      <div v-if="loading" class="text-gray-500">Loading bookings…</div>
      <div v-else-if="error" class="text-red-600">Failed to load bookings.</div>
  
      <div v-else>
        <!-- SUMMARY -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white border rounded p-4">
            <div class="text-sm text-gray-500">Subtotal</div>
            <div class="text-xl font-semibold">{{ money(gross) }}</div>
          </div>
          <div class="bg-white border rounded p-4">
            <div class="text-sm text-gray-500">Discount</div>
            <div class="text-xl font-semibold text-red-600">
              {{ money(discount) }}
            </div>
          </div>
          <div class="bg-white border rounded p-4">
            <div class="text-sm text-gray-500">Collected</div>
            <div class="text-xl font-semibold text-emerald-700">
              {{ money(collected) }}
            </div>
          </div>
        </div>
  
        <!-- TABLE -->
        <div class="bg-white border rounded overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 uppercase text-xs text-gray-600">
              <tr>
                <th class="px-3 py-2 text-left">ID</th>
                <th class="px-3 py-2">Status</th>
                <th class="px-3 py-2">Seats</th>
                <th class="px-3 py-2">Name</th>
                <th class="px-3 py-2">Amount</th>
                <th class="px-3 py-2">Payment</th>
                <th class="px-3 py-2">Provider</th>
                <th class="px-3 py-2">Order ID</th>
                <th class="px-3 py-2">Booked At</th>
              </tr>
            </thead>
  
            <tbody>
              <tr
                v-for="b in bookings"
                :key="b.id"
                class="border-t hover:bg-blue-50"
              >
                <td class="px-3 py-2">{{ b.id }}</td>
  
                <td class="px-3 py-2">
                  <span
                    class="px-2 py-0.5 text-xs rounded"
                    :class="statusColor(b.status)"
                  >
                    {{ b.status }}
                  </span>
                </td>
  
                <td class="px-3 py-2">{{ b.pax }}</td>
                <td class="px-3 py-2">{{ b.userName ?? '—' }}</td>
                <td class="px-3 py-2">{{ money(b.total) }}</td>
  
                <td class="px-3 py-2">
                  {{ b.payment?.status ?? '—' }}
                </td>
  
                <td class="px-3 py-2">
                  {{ b.payment?.provider ?? '—' }}
                </td>
  
                <td class="px-3 py-2 text-xs break-all">
                  {{ b.payment?.providerOrderId ?? '—' }}
                </td>
  
                <td class="px-3 py-2">
                  {{ formatDateTime(b.bookedAt, 'MMM dd, yyyy hh:mm a') }}
                </td>
              </tr>
  
              <tr v-if="bookings.length === 0">
                <td colspan="9" class="text-center py-6 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from '#app'
  import { useEventBookingService } from '@/composables/useEventBookingService'
  import { useSettingsService } from '@/composables/useSettingsService'
  import { formatDate, formatDateTime } from '@/utils/timezone'
  
  const route = useRoute()
  const router = useRouter()
  
  const eventId = Number(route.params.eventId)
  const occurrenceId = Number(route.params.occurrenceId)
  
  const { fetchBookingsByOccurrence } = useEventBookingService()
  const { getSettings } = useSettingsService()
  
  const bookings = ref([])
  const occurrence = ref(null)
  const loading = ref(true)
  const error = ref(false)
  const currency = ref('INR')
  
  const gross = computed(() =>
    bookings.value.reduce((s, b) => s + Number(b.subtotal || 0), 0),
  )
  const discount = computed(() =>
    bookings.value.reduce((s, b) => s + Number(b.discountAmount || 0), 0),
  )
  const collected = computed(() =>
    bookings.value.reduce((s, b) => s + Number(b.total || 0), 0),
  )
  
  function money(v) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.value,
    }).format(Number(v || 0))
  }
  
  function statusColor(status) {
    if (status === 'CONFIRMED') return 'bg-green-100 text-green-800'
    if (status === 'confirmed') return 'bg-green-100 text-green-800'
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }
  
  function goBack() {
    router.push(`/admin/events/bookings/${eventId}`)
  }
  
  onMounted(async () => {
    try {
      const s = await getSettings()
      currency.value = s?.currency ?? 'INR'
  
      bookings.value = await fetchBookingsByOccurrence(occurrenceId)
      occurrence.value = bookings.value[0]?.eventOccurrence ?? null
    } catch (e) {
      console.error(e)
      error.value = true
    } finally {
      loading.value = false
    }
  })
  </script>
  