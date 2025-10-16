<!-- pages/admin/priest/dashboard/[id].vue -->
<template>
    <section class="p-6 max-w-[900px] mx-auto">
      <button
        class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded mb-4"
        @click="goBack"
      >
        ← Back to My Dashboard
      </button>
  
      <div v-if="loading" class="text-gray-500">Loading…</div>
      <div v-else-if="error" class="text-red-600">Failed to load booking.</div>
  
      <div v-else-if="booking" class="space-y-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-bold">Booking #{{ booking.id }}</h1>
            <p class="text-gray-600">
              {{ booking.poojaNameAtBooking || booking.pooja?.name || '—' }}
            </p>
          </div>
  
          <!-- Status quick update -->
          <div class="flex items-center gap-2">
            <select v-model="localStatus" class="border rounded px-2 py-1 text-sm">
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="canceled">canceled</option>
              <option value="completed">completed</option>
            </select>
            <button
              @click="saveStatus"
              :disabled="savingStatus"
              class="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {{ savingStatus ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
  
        <!-- Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white border rounded p-4">
            <h3 class="font-semibold mb-2">Timing</h3>
            <div class="text-sm text-gray-700">
              <div><span class="text-gray-500">Booking Date:</span> {{ fmt(booking.bookingDate, 'MMM dd, yyyy') }}</div>
              <div><span class="text-gray-500">Start:</span> {{ fmt(booking.start, 'MMM dd, yyyy hh:mm a') }}</div>
              <div><span class="text-gray-500">End:</span> {{ fmt(booking.end, 'MMM dd, yyyy hh:mm a') }}</div>
            </div>
          </div>
  
          <div class="bg-white border rounded p-4">
            <h3 class="font-semibold mb-2">Customer</h3>
            <div class="text-sm text-gray-700">
              <div><span class="text-gray-500">Name:</span> {{ booking.userName || '—' }}</div>
              <div><span class="text-gray-500">Email:</span> {{ booking.userEmail || '—' }}</div>
              <div><span class="text-gray-500">Phone:</span> {{ booking.userPhone || '—' }}</div>
            </div>
          </div>
  
          <div class="bg-white border rounded p-4">
            <h3 class="font-semibold mb-2">Venue</h3>
            <div class="text-sm text-gray-700">
              <div>{{ booking.venueAddress || '—' }}</div>
              <div>{{ booking.venueState || '' }} {{ booking.venueZip || '' }}</div>
            </div>
          </div>
  
          <div class="bg-white border rounded p-4">
            <h3 class="font-semibold mb-2">Payment</h3>
            <div class="text-sm text-gray-700">
              <div><span class="text-gray-500">Subtotal:</span> {{ money(booking.subtotal ?? booking.amountAtBooking ?? 0) }}</div>
              <div><span class="text-gray-500">Discount:</span> {{ money(booking.discountAmount || 0) }}</div>
              <div><span class="text-gray-500">Coupon:</span> {{ booking.couponCode || '—' }}</div>
              <div class="font-semibold mt-1"><span class="text-gray-500">Total:</span> {{ money(booking.total ?? booking.amountAtBooking ?? 0) }}</div>
            </div>
          </div>
        </div>
  
        <!-- Reassign to ANY Priest (full list from /priest) -->
        <div class="bg-white border rounded p-4">
          <h3 class="font-semibold mb-3">Assign to another priest</h3>
  
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select
              v-model="selectedPriestId"
              class="border rounded px-3 py-2 text-sm min-w-[260px]"
            >
              <option disabled value="">Select a priest…</option>
              <option
                v-for="p in priestOptions"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }} (ID: {{ p.id }})
              </option>
            </select>
  
            <button
              @click="reassign"
              :disabled="reassigning || !selectedPriestId || Number(selectedPriestId) === Number(booking.priestId)"
              class="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {{ reassigning ? 'Reassigning…' : 'Reassign' }}
            </button>
  
            <div class="text-xs text-gray-500">
              Current: <strong>{{ booking.priest?.name || booking.priestNameAtBooking || '—' }}</strong>
            </div>
          </div>
  
          <p class="text-xs text-gray-500 mt-2">
            Choose any priest to transfer this booking.
          </p>
        </div>
  
        <div v-if="toast" class="fixed bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded">
          {{ toast }}
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from '#app'
  import { useBookingService } from '@/composables/useBookingService'
  import { usePriestDashboard } from '@/composables/usePriestDashboard'
  import { usePriestService } from '@/composables/usePriestService'
  import { useSettingsService } from '@/composables/useSettingsService'
  import { formatDateTime } from '@/utils/timezone'
  
  const route = useRoute()
  const router = useRouter()
  
  const { getBookingById } = useBookingService()
  const { updateMyBookingStatus, reassignMyBooking } = usePriestDashboard()
  const { fetchPriests } = usePriestService()
  const { getSettings } = useSettingsService()
  
  const id = Number(route.params.id)
  const booking = ref(null)
  const loading = ref(true)
  const error = ref(false)
  const toast = ref('')
  
  const currency = ref('INR')
  const localStatus = ref('')
  const savingStatus = ref(false)
  
  // Reassign (full priest list)
  const priestOptions = ref([])      // [{id, name}]
  const selectedPriestId = ref('')
  const reassigning = ref(false)
  
  function fmt(iso, fmtStr) {
    try { return formatDateTime(iso, fmtStr) } catch { return iso }
  }
  function money(n) {
    try {
      return new Intl.NumberFormat(
        currency.value === 'INR' ? 'en-IN' : 'en-US',
        { style: 'currency', currency: currency.value, maximumFractionDigits: 2 }
      ).format(n ?? 0)
    } catch {
      return `${currency.value} ${(n ?? 0).toFixed(2)}`
    }
  }
  
  function goBack() {
    router.push('/admin/priest/dashboard')
  }
  
  async function loadPriestList() {
    try {
      const rows = await fetchPriests() // hits /priest with auth header
      priestOptions.value = (Array.isArray(rows) ? rows : [])
        .map(r => ({ id: r.id, name: r.name }))
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      // default selection = current priest
      selectedPriestId.value = String(booking.value?.priestId ?? '') || ''
    } catch (e) {
      console.error('Failed to load priest list:', e)
      priestOptions.value = []
      selectedPriestId.value = ''
    }
  }
  
  async function load() {
    loading.value = true
    try {
      try {
        const s = await getSettings()
        currency.value = s?.currency || 'INR'
      } catch { currency.value = 'INR' }
  
      const b = await getBookingById(id)
      booking.value = b
      localStatus.value = b.status || 'pending'
  
      await loadPriestList()
    } catch (e) {
      console.error(e)
      error.value = true
    } finally {
      loading.value = false
    }
  }
  
  async function saveStatus() {
    if (!booking.value) return
    if (localStatus.value === booking.value.status) return
    savingStatus.value = true
    try {
      const updated = await updateMyBookingStatus(booking.value.id, localStatus.value)
      booking.value = updated
      toast.value = 'Status updated'
    } catch (e) {
      console.error(e)
      toast.value = e.message || 'Update failed'
      localStatus.value = booking.value.status
    } finally {
      savingStatus.value = false
      setTimeout(() => (toast.value = ''), 2000)
    }
  }
  
  async function reassign() {
    if (!booking.value || !selectedPriestId.value) return
    if (Number(selectedPriestId.value) === Number(booking.value.priestId)) return
    reassigning.value = true
    try {
      const updated = await reassignMyBooking(booking.value.id, Number(selectedPriestId.value))
      booking.value = updated
      toast.value = 'Reassigned successfully'
    } catch (e) {
      console.error(e)
      toast.value = e.message || 'Reassign failed'
    } finally {
      reassigning.value = false
      setTimeout(() => (toast.value = ''), 2000)
    }
  }
  
  onMounted(load)
  </script>
  
  <style scoped>
  /* Tailwind handles styling */
  </style>
  