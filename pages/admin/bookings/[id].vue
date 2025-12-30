<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">

      <!-- Header -->
      <div class="px-6 py-4 flex items-center justify-between border-b">
        <NuxtLink to="/admin/bookings" class="text-blue-600 hover:underline">
          ← Back to Bookings
        </NuxtLink>

        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            :disabled="loading || !booking"
            @click="showEdit = true"
          >
            Edit
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            :disabled="loading || deleting || !booking"
            @click="showDeleteConfirm = true"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- States -->
      <div v-if="error" class="p-6 text-center text-red-600">
        Failed to load booking: {{ error }}
      </div>

      <div v-else-if="loading" class="p-6 text-center text-gray-600">
        Loading booking details…
      </div>

      <div v-else-if="!booking" class="p-6 text-center text-gray-600">
        Booking not found.
      </div>

      <!-- CONTENT -->
      <div v-else class="p-6 space-y-10">

        <!-- Title -->
        <div>
          <h2 class="text-3xl font-bold">Booking #{{ booking.id }}</h2>
          <p class="text-gray-600 mt-1">
            <strong>Booking Date:</strong> {{ formatDate(booking.bookingDate) }}
          </p>
        </div>

        <!-- Core Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-semibold text-gray-500">Puja</h4>
            <p class="mt-1 text-gray-800">{{ booking.poojaNameAtBooking || booking.pooja?.name || '—' }}</p>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-500">Priest</h4>
            <p class="mt-1 text-gray-800">{{ booking.priestNameAtBooking || booking.priest?.name || '—' }}</p>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-500">Start Time</h4>
            <p class="mt-1 text-gray-800">{{ formatTime(booking.start) }}</p>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-500">End Time</h4>
            <p class="mt-1 text-gray-800">{{ formatTime(booking.end) }}</p>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-500">Status</h4>
            <p class="mt-1 text-gray-800">{{ booking.status }}</p>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-gray-500">Amount</h4>
            <p class="mt-1 text-gray-800">{{ formatMoney(booking.amountAtBooking) }}</p>
          </div>
        </div>

        <!-- User Info -->
        <section v-if="displayUser && (displayUser.name || displayUser.email || displayUser.phone)">
          <h3 class="text-xl font-semibold mb-3">
            User Info
            <span
              v-if="displayUser.isGuest"
              class="ml-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-600"
            >
              Guest
            </span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <h4 class="text-sm font-semibold text-gray-500">Name</h4>
              <p>{{ displayUser.name }}</p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-500">Email</h4>
              <p>{{ displayUser.email }}</p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-500">Phone</h4>
              <p>{{ displayUser.phone }}</p>
            </div>
          </div>
        </section>

        <!-- Venue -->
        <section
          v-if="booking.venueAddress || booking.venueLat"
          class="border-t pt-6"
        >
          <h3 class="text-xl font-semibold mb-3">Venue Details</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-semibold text-gray-500">Address</h4>
              <p>{{ booking.venueAddress || '—' }}</p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-500">State</h4>
              <p>{{ booking.venueState || '—' }}</p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-500">ZIP</h4>
              <p>{{ booking.venueZip || '—' }}</p>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-500">Coordinates</h4>
              <p>{{ booking.venueLat }}, {{ booking.venueLng }}</p>
            </div>
          </div>
        </section>

        <!-- Pricing -->
        <section v-if="booking.travelDistance != null">
          <h3 class="text-xl font-semibold mb-4">Pricing Breakdown</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span>Base Amount</span>
              <span>{{ formatMoney(booking.amountAtBooking) }}</span>
            </div>

            <div class="flex justify-between">
              <span>Travel Distance</span>
              <span>{{ booking.travelDistance }} {{ booking.travelUnit }}</span>
            </div>

            <div class="flex justify-between">
              <span>Free Travel Units</span>
              <span>{{ booking.freeTravelUnits }} {{ booking.travelUnit }}</span>
            </div>

            <div class="flex justify-between">
              <span>Rate per Unit</span>
              <span>{{ formatMoney(booking.travelRate) }} / {{ booking.travelUnit }}</span>
            </div>

            <div class="flex justify-between">
              <span>Travel Cost</span>
              <span>{{ formatMoney(booking.travelCost) }}</span>
            </div>

            <div class="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{{ formatMoney(booking.subtotal) }}</span>
            </div>

            <div
              v-if="booking.discountAmount > 0"
              class="flex justify-between text-red-600"
            >
              <span>Discount</span>
              <span>- {{ formatMoney(booking.discountAmount) }}</span>
            </div>

            <div class="sm:col-span-2 border-t pt-4 mt-2 flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span class="text-green-700">{{ formatMoney(booking.total) }}</span>
            </div>
          </div>
        </section>

      </div>
    </div>

    <!-- EDIT MODAL -->
    <BookingEditModal
      v-if="showEdit && booking"
      :booking="booking"
      :pooja-options="poojaOptions"
      @close="showEdit = false"
      @updated="booking = $event"
    />
    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Delete Booking"
      message="This booking will be permanently deleted. This action cannot be undone."
      @cancel="showDeleteConfirm = false"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, useRuntimeConfig } from '#app'
import { useBookingService } from '@/composables/useBookingService'
import { useSettingsService } from '@/composables/useSettingsService'
import { formatDate, formatTime } from '@/utils/timezone'
import BookingEditModal from '@/components/admin/bookings/BookingEditModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig().public

const { getBookingById, deleteBooking } = useBookingService()
const { getSettings } = useSettingsService()

const showDeleteConfirm = ref(false)
const booking = ref(null)
const loading = ref(true)
const deleting = ref(false)
const error = ref(null)
const showEdit = ref(false)

const currency = ref('INR')
const poojaOptions = ref([])

function formatMoney(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat(currency.value === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency.value,
    maximumFractionDigits: 2
  }).format(Number(amount))
}

async function onConfirmDelete() {
  if (!booking.value) return
  showDeleteConfirm.value = false
  deleting.value = true
  try {
    await deleteBooking(booking.value.id)
    router.push('/admin/bookings')
  } finally {
    deleting.value = false
  }
}

async function loadPoojas() {
  const res = await fetch(`${config.apiBase}/pooja?include=priests`)
  poojaOptions.value = await res.json()
}

onMounted(async () => {
  try {
    currency.value = (await getSettings()).currency || 'INR'
    booking.value = await getBookingById(route.params.id)
    console.log('booking value', booking.value)
    await loadPoojas()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const displayUser = computed(() => {
  if (!booking.value) return null
  return {
    name: booking.value.userName || '—',
    email: booking.value.userEmail || booking.value.user?.email || '—',
    phone: booking.value.userPhone || '—',
    address: booking.value.venueAddress || null,
    isGuest: !booking.value.userId,
  }
})
</script>
