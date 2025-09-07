<!-- File: components/checkout/StepConfirmPayment.vue -->
<template>
  <div>
    <!-- Heading -->
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>

    <!-- Details grid -->
    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-700 mb-6">
      <!-- Pooja Name -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Pooja</dt>
        <dd class="mt-1 text-gray-800">{{ pooja.name }}</dd>
      </div>

      <!-- Amount -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Amount</dt>
        <dd class="mt-1 text-gray-800">₹{{ pooja.amount }}</dd>
      </div>

      <!-- Slot -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Slot</dt>
        <dd class="mt-1 text-gray-800">
          {{ formatTime(selectedSlot.slot.start) }} – {{ formatTime(selectedSlot.slot.end) }}
        </dd>
      </div>

      <!-- Date -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Date</dt>
        <dd class="mt-1 text-gray-800">{{ selectedSlot.bookingDate }}</dd>
      </div>

      <!-- Your Details -->
      <div class="bg-[#f2f2f2] p-[10px]" v-if="user">
        <dt class="font-medium text-gray-500">Your Details</dt>
        <dd class="mt-1 text-gray-800">
          {{ user.name }}<br/>
          {{ user.phone }}<br/>
          {{ user.email }}
        </dd>
      </div>

      <!-- Venue Address (if outside venue) -->
      <div class="bg-[#f2f2f2] p-[10px]" v-if="venue && pooja.isOutsideVenue">
        <dt class="font-medium text-gray-500">Venue Address</dt>
        <dd class="mt-1 text-gray-800">
          {{ venue.address }}<br/>
          {{ venue.state }} – {{ venue.zip }}
        </dd>
      </div>
    </dl>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="$emit('goBack')"
        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Back
      </button>
      <button
        @click="submit"
        :disabled="submitting"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {{ submitting ? 'Submitting...' : 'Confirm Booking' }}
      </button>
    </div>

    <!-- Success message -->
    <p v-if="success" class="mt-4 text-green-600 font-medium">
      ✅ Booking successful! Redirecting...
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingService } from '@/composables/useBookingService'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

const props = defineProps({
  pooja: Object,
  selectedSlot: Object,  // { slot: { start, end, priestId }, bookingDate }
  user: Object,
  venue: Object
})
const emit = defineEmits(['goBack'])
const { submitBooking } = useBookingService()
const router = useRouter()

const submitting = ref(false)
const success    = ref(false)

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit'
  })
}

async function submit() {

  submitting.value = true
  try {
    const { slot, bookingDate } = props.selectedSlot
    // const timePart = iso => iso.slice(11,19)
    const start = slot.start  // already an ISO string with full date + time
    const end   = slot.end
    // console.log('typeof priestId:', typeof slot.priestId)

    await submitBooking({
      poojaId:      Number(props.pooja.id),
      priestId:     Number(slot.priestId), 
      bookingDate,
      start,
      end,
      userName:     props.user?.name  ?? null,
      userEmail:    props.user?.email ?? null,
      userPhone:    props.user?.phone ?? null,
      venueAddress: props.venue?.address ?? null,
      venueState:   props.venue?.state   ?? null,
      venueZip:     props.venue?.zip     ?? null
    })

    success.value = true
    setTimeout(() => router.push('/confirmation'), 1500)

  } catch (err) {
    showNotification({
      message: err.message || 'Booking failed',
      type: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>
