<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>

    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-700 mb-6">
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Pooja</dt>
        <dd class="mt-1 text-gray-800">{{ pooja.name }}</dd>
      </div>

      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Amount</dt>
        <dd class="mt-1 text-gray-800">{{ currency }}{{ pooja.amount }}</dd>
      </div>

      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Slot</dt>
        <dd class="mt-1 text-gray-800">
          {{ formatTime(selectedSlot.slot.start, 'hh:mm a') }} – {{ formatTime(selectedSlot.slot.end, 'hh:mm a') }}
        </dd>
      </div>

      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Date</dt>
        <dd class="mt-1 text-gray-800">{{ formatDate(selectedSlot.bookingDate, 'EEE, dd LLL yyyy') }}</dd>
      </div>

      <div class="bg-[#f2f2f2] p-[10px]" v-if="user">
        <dt class="font-medium text-gray-500">Your Details</dt>
        <dd class="mt-1 text-gray-800">
          {{ user.name }}<br />
          {{ user.phone }}<br />
          {{ user.email }}
        </dd>
      </div>

      <!-- ✅ Venue comes from stepVenueDetails (temple OR custom) -->
      <div class="bg-[#f2f2f2] p-[10px]" v-if="venue">
        <dt class="font-medium text-gray-500">Venue Address</dt>
        <dd class="mt-1 text-gray-800">
          {{ venue.address }}<br />
          <template v-if="venue.state || venue.zip">
            {{ venue.state }}<span v-if="venue.state && venue.zip"> – </span>{{ venue.zip }}
          </template>
        </dd>
      </div>
    </dl>

    <div class="flex justify-between">
      <button
        @click="$emit('goBack')"
        class="px-4 py-2 cursor-pointer bg-gray-300 rounded hover:bg-gray-400"
      >
        Back
      </button>
      <button
        @click="submit"
        :disabled="submitting"
        class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {{ submitting ? 'Submitting...' : 'Confirm Booking' }}
      </button>
    </div>

    <p v-if="success" class="mt-4 text-green-600 font-medium">
      ✅ Booking successful! Redirecting...
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingService } from '@/composables/useBookingService'
import { useNotification } from '@/composables/useNotification'
import { useSettingsService } from '@/composables/useSettingsService'
import { loadTimezone, formatDate, formatTime } from '@/utils/timezone'

const { showNotification } = useNotification()
const { submitBooking } = useBookingService()
const { getSettings } = useSettingsService()
const router = useRouter()

const props = defineProps({
  pooja: Object,
  selectedSlot: Object,
  user: Object,
  venue: Object // ✅ this is filled from stepVenueDetails
})
const emit = defineEmits(['goBack'])

const submitting = ref(false)
const success = ref(false)
const currency = ref('₹')

onMounted(async () => {
  try {
    const settings = await getSettings()
    currency.value = settings.currency || '₹'
    await loadTimezone()
  } catch {
    currency.value = '₹'
  }
})

async function submit() {
  submitting.value = true
  try {
    const { slot, bookingDate } = props.selectedSlot
    await submitBooking({
      poojaId: Number(props.pooja.id),
      priestId: Number(slot.priestId),
      bookingDate,
      start: slot.start,
      end: slot.end,
      userName: props.user?.name ?? null,
      userEmail: props.user?.email ?? null,
      userPhone: props.user?.phone ?? null,
      venueAddress: props.venue?.address ?? null,
      venueState: props.venue?.state ?? null,
      venueZip: props.venue?.zip ?? null
    })

    success.value = true
    showNotification('Booking successful!', 'success')
    setTimeout(() => router.push('/confirmation'), 1500)
  } catch (err) {
    showNotification(err.message || 'Booking failed', 'error')
  } finally {
    submitting.value = false
  }
}
</script>
