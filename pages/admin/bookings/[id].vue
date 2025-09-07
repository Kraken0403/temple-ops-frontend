<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">
      <!-- Header Row -->
      <div class="px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/admin/bookings" class="text-blue-600 hover:underline">
          ← Back to Bookings
        </NuxtLink>

        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            :disabled="loading || !booking"
            @click="openEdit()"
          >
            Edit
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            :disabled="loading || deleting || !booking"
            @click="onDelete()"
          >
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="error" class="p-6 text-center text-red-600">
        Failed to load booking: {{ error }}
      </div>
      <div v-else-if="loading" class="p-6 text-center text-gray-600">
        Loading booking details...
      </div>
      <div v-else-if="!booking" class="p-6 text-center text-gray-600">
        Booking not found.
      </div>

      <!-- Details -->
      <div v-else class="p-6 space-y-8">
        <!-- Title / meta -->
        <div>
          <h2 class="text-3xl font-bold">Booking #{{ booking.id }}</h2>
          <p class="text-gray-600 mt-1">
            <strong>Booking Date:</strong> {{ formatDate(booking.bookingDate) }}
          </p>
        </div>

        <!-- Grid of fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-500">Pooja</h3>
            <p class="mt-1 text-gray-800">
              {{ booking.poojaNameAtBooking || booking.pooja?.name || '—' }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-500">Priest</h3>
            <p class="mt-1 text-gray-800">
              {{ booking.priestNameAtBooking || booking.priest?.name || '—' }}
            </p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-500">Start Time</h3>
            <p class="mt-1 text-gray-800">{{ formatTime(booking.start) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-500">End Time</h3>
            <p class="mt-1 text-gray-800">{{ formatTime(booking.end) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-500">Status</h3>
            <p class="mt-1 text-gray-800">{{ booking.status }}</p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-500">Amount</h3>
            <p class="mt-1 text-gray-800">
              {{ formatMoney(booking.amountAtBooking, settingsCurrency) }}
            </p>
          </div>
        </div>

        <!-- User Info -->
        <div
          v-if="booking.userName || booking.userEmail || booking.userPhone"
          class="mt-6"
        >
          <h3 class="text-xl font-semibold mb-2">User Info</h3>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li>
              <h4 class="text-sm font-semibold text-gray-500">Name</h4>
              <p class="mt-1 text-gray-800">{{ booking.userName || '—' }}</p>
            </li>
            <li>
              <h4 class="text-sm font-semibold text-gray-500">Email</h4>
              <p class="mt-1 text-gray-800">{{ booking.userEmail || '—' }}</p>
            </li>
            <li>
              <h4 class="text-sm font-semibold text-gray-500">Phone</h4>
              <p class="mt-1 text-gray-800">{{ booking.userPhone || '—' }}</p>
            </li>
          </ul>
        </div>

        <!-- Venue -->
        <div
          v-if="booking.venueAddress || booking.venueState || booking.venueZip"
          class="mt-6"
        >
          <h3 class="text-xl font-semibold mb-2">Venue Address</h3>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li>
              <h4 class="text-sm font-semibold text-gray-500">Address</h4>
              <p class="mt-1 text-gray-800">{{ booking.venueAddress || '—' }}</p>
            </li>
            <li>
              <h4 class="text-sm font-semibold text-gray-500">State</h4>
              <p class="mt-1 text-gray-800">{{ booking.venueState || '—' }}</p>
            </li>
            <li>
              <h4 class="text-sm font-semibold text-gray-500">ZIP</h4>
              <p class="mt-1 text-gray-800">{{ booking.venueZip || '—' }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEdit"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h3 class="text-xl font-semibold">Edit Booking #{{ booking?.id }}</h3>
          <button @click="closeEdit" class="text-gray-500 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </div>

        <!-- Modal Body (form) -->
        <form @submit.prevent="submitEdit" class="px-6 py-6 space-y-6">
          <!-- Pooja & Priest (filtered) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pooja</label>
              <select
                v-model.number="editForm.poojaId"
                required
                class="w-full p-2 border border-gray-300 rounded"
              >
                <option v-for="p in poojaOptions" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Choose the pooja.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priest</label>
              <select
                v-model.number="editForm.priestId"
                required
                class="w-full p-2 border border-gray-300 rounded"
              >
                <option
                  v-for="pr in currentPriestOptions"
                  :key="pr.id"
                  :value="pr.id"
                >
                  {{ pr.name }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Only priests assigned to the selected pooja are shown.</p>
            </div>
          </div>

          <!-- Dates / Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
              <input
                v-model="editForm.bookingDate"
                type="date"
                required
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="editForm.status"
                required
                class="w-full p-2 border border-gray-300 rounded"
              >
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="canceled">canceled</option>
                <option value="completed">completed</option>
              </select>
            </div>
          </div>

          <!-- Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                v-model="editForm.startLocal"
                type="datetime-local"
                required
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                v-model="editForm.endLocal"
                type="datetime-local"
                required
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <!-- User -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">User Name</label>
              <input v-model="editForm.userName" type="text" class="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">User Email</label>
              <input v-model="editForm.userEmail" type="email" class="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">User Phone</label>
              <input v-model="editForm.userPhone" type="text" class="w-full p-2 border border-gray-300 rounded" />
            </div>
          </div>

          <!-- Venue -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input v-model="editForm.venueAddress" type="text" class="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input v-model="editForm.venueState" type="text" class="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
              <input v-model="editForm.venueZip" type="text" class="w-full p-2 border border-gray-300 rounded" />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 rounded border bg-white hover:bg-gray-50"
              @click="closeEdit"
              :disabled="saving"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              :disabled="saving"
            >
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notification Toast -->
    <transition name="fade">
      <div
        v-if="notification.visible"
        class="fixed bottom-6 right-6 px-4 py-3 rounded shadow-lg"
        :class="notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'"
      >
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter, useRuntimeConfig } from '#app'
import { useBookingService } from '@/composables/useBookingService'
import { useNotification } from '@/composables/useNotification'
import { useSettingsService } from '@/composables/useSettingsService'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig().public

const { getBookingById, updateBooking, deleteBooking } = useBookingService()
const { notification, showNotification } = useNotification()
const { getSettings } = useSettingsService()

const booking = ref(null)
const loading = ref(true)
const error = ref(null)

const showEdit = ref(false)
const saving = ref(false)
const deleting = ref(false)

const settingsCurrency = ref('INR')

// Pooja+Priest options (poojas include their assigned priests)
const poojaOptions = ref([]) // [{id, name, priests:[{id,name}, ...]}]

// Edit form state
const editForm = ref({
  poojaId: null,
  priestId: null,
  bookingDate: '',
  startLocal: '',
  endLocal: '',
  status: 'confirmed',
  userName: '',
  userEmail: '',
  userPhone: '',
  venueAddress: '',
  venueState: '',
  venueZip: ''
})

// Filtered priest options for the selected pooja
const currentPriestOptions = computed(() => {
  const p = poojaOptions.value.find(x => x.id === editForm.value.poojaId)
  return p?.priests || []
})

/* Utilities */
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
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}
function toIso(localValue) {
  if (!localValue) return null
  const d = new Date(localValue)
  return d.toISOString()
}

/* Load poojas (including assigned priests) */
async function loadPoojas() {
  const res = await fetch(`${config.apiBase}/pooja?include=priests`)
  if (!res.ok) throw new Error('Failed to load poojas')
  const data = await res.json()
  poojaOptions.value = (data || []).map(p => ({
    id: p.id,
    name: p.name,
    priests: (p.priests || []).map(pr => ({ id: pr.id, name: pr.name }))
  }))
}

/* Modal handlers */
function openEdit() {
  if (!booking.value) return
  const b = booking.value
  editForm.value = {
    poojaId: b.poojaId,
    priestId: b.priestId,
    bookingDate: new Date(b.bookingDate).toISOString().slice(0, 10),
    startLocal: toLocalInput(b.start),
    endLocal: toLocalInput(b.end),
    status: b.status || 'confirmed',
    userName: b.userName || '',
    userEmail: b.userEmail || '',
    userPhone: b.userPhone || '',
    venueAddress: b.venueAddress || '',
    venueState: b.venueState || '',
    venueZip: b.venueZip || ''
  }

  const validPriests = currentPriestOptions.value
  if (validPriests.length && !validPriests.some(pr => pr.id === editForm.value.priestId)) {
    editForm.value.priestId = validPriests[0].id
  }

  showEdit.value = true
}
function closeEdit() {
  showEdit.value = false
}

/* Keep priest in sync with selected pooja */
watch(() => editForm.value.poojaId, () => {
  const validPriests = currentPriestOptions.value
  if (!validPriests.length) {
    editForm.value.priestId = null
    return
  }
  if (!validPriests.some(pr => pr.id === editForm.value.priestId)) {
    editForm.value.priestId = validPriests[0].id
  }
})

/* Actions */
async function submitEdit() {
  try {
    saving.value = true

    if (!editForm.value.poojaId) {
      showNotification('Please select a pooja', 'error'); saving.value = false; return
    }
    if (!editForm.value.priestId) {
      showNotification('Please select a priest', 'error'); saving.value = false; return
    }
    if (!currentPriestOptions.value.some(pr => pr.id === editForm.value.priestId)) {
      showNotification('Selected priest is not assigned to the selected pooja', 'error')
      saving.value = false
      return
    }

    const patch = {
      poojaId: Number(editForm.value.poojaId),
      priestId: Number(editForm.value.priestId),
      bookingDate: editForm.value.bookingDate,
      start: toIso(editForm.value.startLocal),
      end: toIso(editForm.value.endLocal),
      status: editForm.value.status,
      userName: editForm.value.userName || undefined,
      userEmail: editForm.value.userEmail || undefined,
      userPhone: editForm.value.userPhone || undefined,
      venueAddress: editForm.value.venueAddress || undefined,
      venueState: editForm.value.venueState || undefined,
      venueZip: editForm.value.venueZip || undefined
    }

    const updated = await updateBooking(route.params.id, patch)
    booking.value = updated
    showNotification('Booking updated successfully')
    closeEdit()
  } catch (e) {
    showNotification(e.message || 'Failed to update booking', 'error')
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!booking.value) return
  if (!confirm(`Delete booking #${booking.value.id}? This cannot be undone.`)) return
  try {
    deleting.value = true
    await deleteBooking(booking.value.id)
    showNotification('Booking deleted')
    router.push('/admin/bookings')
  } catch (e) {
    showNotification(e.message || 'Failed to delete booking', 'error')
  } finally {
    deleting.value = false
  }
}

/* Load */
onMounted(async () => {
  try {
    await Promise.all([
      (async () => {
        // settings first (currency)
        try {
          const s = await getSettings()
          settingsCurrency.value = s?.currency || 'INR'
        } catch {
          settingsCurrency.value = 'INR'
        }
      })(),
      (async () => { booking.value = await getBookingById(route.params.id) })(),
      loadPoojas()
    ])
  } catch (err) {
    error.value = err.message || String(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
