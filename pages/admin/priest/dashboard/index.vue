<!-- pages/admin/priest/dashboard.vue -->
<template>
    <section class="p-6 max-w-[1200px] mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">My Dashboard</h1>
        <div v-if="!isPriest" class="text-red-600 text-sm">
          You are not logged in as a priest.
        </div>
      </div>
  
      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div class="p-4 bg-white border rounded shadow-sm">
          <div class="text-sm text-gray-500">Total Bookings</div>
          <div class="text-2xl font-semibold">{{ bookings.length }}</div>
        </div>
        <div class="p-4 bg-white border rounded shadow-sm">
          <div class="text-sm text-gray-500">Pending</div>
          <div class="text-2xl font-semibold">
            {{ bookings.filter(b => b.status === 'pending').length }}
          </div>
        </div>
        <div class="p-4 bg-white border rounded shadow-sm">
          <div class="text-sm text-gray-500">Confirmed</div>
          <div class="text-2xl font-semibold">
            {{ bookings.filter(b => b.status === 'confirmed').length }}
          </div>
        </div>
        <div class="p-4 bg-white border rounded shadow-sm">
          <div class="text-sm text-gray-500">Completed</div>
          <div class="text-2xl font-semibold">
            {{ bookings.filter(b => b.status === 'completed').length }}
          </div>
        </div>
      </div>
  
      <div v-if="loading" class="text-gray-500">Loading…</div>
      <div v-else-if="error" class="text-red-600">Failed to load data.</div>
  
      <div v-else class="bg-white border rounded-lg overflow-hidden shadow-sm">
        <!-- Filters -->
        <div class="p-3 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            v-model.trim="q"
            type="text"
            placeholder="Search by pooja, customer, phone, email…"
            class="w-full sm:max-w-xs border rounded px-3 py-2 text-sm"
          />
          <select v-model="statusFilter" class="border rounded px-3 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="canceled">canceled</option>
            <option value="completed">completed</option>
          </select>
        </div>
  
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3 text-left">ID</th>
                <th class="px-4 py-3 text-left">Pooja</th>
                <th class="px-4 py-3 text-left">Date</th>
                <th class="px-4 py-3 text-left">Time</th>
                <th class="px-4 py-3 text-left">Customer</th>
                <th class="px-4 py-3 text-left">Contact</th>
                <th class="px-4 py-3 text-left">Total</th>
                <th class="px-4 py-3 text-left">Status</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="b in paginated"
                :key="b.id"
                class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer"
                @click="openBooking(b.id)"
              >
                <td class="px-4 py-3">
                  <NuxtLink
                    :to="`/admin/priest/dashboard/${b.id}`"
                    class="text-blue-600 hover:underline"
                    @click.stop
                  >
                    #{{ b.id }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3">
                  {{ b.pooja?.name || b.poojaNameAtBooking }}
                </td>
                <td class="px-4 py-3">
                  {{ formatDate(b.bookingDate, 'MMM dd, yyyy') }}
                </td>
                <td class="px-4 py-3">
                  {{ formatDate(b.start, 'hh:mm a') }} – {{ formatDate(b.end, 'hh:mm a') }}
                </td>
                <td class="px-4 py-3">{{ b.userName || '—' }}</td>
                <td class="px-4 py-3">
                  <div>{{ b.userPhone || '—' }}</div>
                  <div class="text-xs text-gray-500">{{ b.userEmail || '—' }}</div>
                </td>
                <td class="px-4 py-3">
                  {{ money(b.total ?? b.amountAtBooking ?? 0) }}
                </td>
                <td class="px-4 py-3" @click.stop>
                  <select
                    v-model="localStatus[b.id]"
                    class="border rounded px-2 py-1 text-sm"
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="canceled">canceled</option>
                    <option value="completed">completed</option>
                  </select>
                </td>
                <td class="px-4 py-3 text-right" @click.stop>
                  <button
                    @click="saveStatus(b)"
                    :disabled="saving[b.id]"
                    class="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {{ saving[b.id] ? 'Saving…' : 'Save' }}
                  </button>
                </td>
              </tr>
  
              <tr v-if="filtered.length === 0">
                <td colspan="9" class="px-4 py-10 text-center text-gray-600">
                  No bookings found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Pagination -->
        <div class="p-3 border-t flex items-center justify-between text-sm text-gray-600">
          <div>Page {{ page }} of {{ totalPages }}</div>
          <div class="flex gap-2">
            <button
              @click="go(page - 1)"
              :disabled="page <= 1"
              class="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              @click="go(page + 1)"
              :disabled="page >= totalPages"
              class="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
  
      <div v-if="toast" class="fixed bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded">
        {{ toast }}
      </div>
    </section>
  </template>
  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from '#app'
  import { usePriestDashboard } from '@/composables/usePriestDashboard'
  import { useSettingsService } from '@/composables/useSettingsService'
  import { useAuth } from '@/composables/useAuth'
  import { formatDate } from '@/utils/timezone'
  
  const router = useRouter()
  const auth = useAuth()
  const isPriest = computed(() => {
    const roles = auth.user.value?.roles || []
    const names = roles.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
    return names.some(n => String(n).toLowerCase() === 'priest')
  })
  
  const { fetchMyBookings, updateMyBookingStatus } = usePriestDashboard()
  const { getSettings } = useSettingsService()
  
  const bookings = ref([])
  const loading = ref(true)
  const error = ref(false)
  const toast = ref('')
  const currency = ref('INR')
  
  const localStatus = ref({})
  const saving = ref({})
  
  const q = ref('')
  const statusFilter = ref('')
  
  // pagination
  const page = ref(1)
  const perPage = ref(12)
  
  const filtered = computed(() => {
    let list = bookings.value
    if (q.value) {
      const t = q.value.toLowerCase()
      list = list.filter(b => {
        const pooja = (b.pooja?.name || b.poojaNameAtBooking || '').toLowerCase()
        const name  = (b.userName || '').toLowerCase()
        const ph    = (b.userPhone || '').toLowerCase()
        const em    = (b.userEmail || '').toLowerCase()
        return pooja.includes(t) || name.includes(t) || ph.includes(t) || em.includes(t)
      })
    }
    if (statusFilter.value) {
      list = list.filter(b => b.status === statusFilter.value)
    }
    return list
  })
  
  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
  const paginated = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filtered.value.slice(start, start + perPage.value)
  })
  
  function go(p) {
    if (p < 1 || p > totalPages.value) return
    page.value = p
  }
  
  function openBooking(id) {
    router.push(`/admin/priest/dashboard/${id}`)
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
  
  async function load() {
    loading.value = true
    try {
      try {
        const s = await getSettings()
        currency.value = s?.currency || 'INR'
      } catch { currency.value = 'INR' }
  
      const rows = await fetchMyBookings()
      bookings.value = rows
      localStatus.value = {}
      rows.forEach(b => { localStatus.value[b.id] = b.status })
    } catch (e) {
      console.error(e)
      error.value = true
    } finally {
      loading.value = false
    }
  }
  
  async function saveStatus(b) {
    const newStatus = localStatus.value[b.id]
    if (!newStatus || newStatus === b.status) return
    saving.value[b.id] = true
    try {
      const updated = await updateMyBookingStatus(b.id, newStatus)
      const idx = bookings.value.findIndex(x => x.id === b.id)
      if (idx !== -1) bookings.value[idx] = updated
      toast.value = 'Status updated'
    } catch (e) {
      console.error(e)
      toast.value = e.message || 'Update failed'
      localStatus.value[b.id] = b.status
    } finally {
      saving.value[b.id] = false
      setTimeout(() => (toast.value = ''), 2000)
    }
  }
  
  onMounted(load)
  </script>
  