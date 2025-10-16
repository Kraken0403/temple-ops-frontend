<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">Review & Confirm</h2>
      <p class="text-sm text-gray-500">Please confirm your booking details before submitting.</p>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-5">
      <div class="flex justify-between">
        <span class="text-gray-600">Event</span>
        <span class="font-medium text-gray-900">{{ event.name }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-600">Seats</span>
        <span class="font-medium text-gray-900">{{ pax }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-600">Name</span>
        <span class="font-medium text-gray-900">{{ user.userName }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-600">Email</span>
        <span class="font-medium text-gray-900">{{ user.userEmail }}</span>
      </div>

      <div class="flex justify-between" v-if="event.venueRel?.title || event.venue">
        <span class="text-gray-600">Venue</span>
        <span class="font-medium text-gray-900 text-right">
          {{ event.venueRel?.title || event.venue }}
          <template v-if="event.venueRel?.address">, {{ event.venueRel.address }}</template>
          <template v-if="event.venueRel?.zipcode">, {{ event.venueRel.zipcode }}</template>
        </span>
      </div>

      <div class="flex justify-between border-t border-gray-200 pt-4">
        <span class="text-gray-600">Total</span>
        <span class="font-semibold text-lg text-gray-900">
          <template v-if="event.price != null">
            {{ formatCurrency(event.price * pax, currency) }}
          </template>
          <template v-else>Free</template>
        </span>
      </div>
    </div>

    <div class="flex justify-between pt-8 border-t border-gray-200">
      <button
        @click="$emit('back')"
        class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
      >
        Back
      </button>

      <button
        @click="$emit('complete')"
        :disabled="submitting"
        class="px-6 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
      >
        {{ submitting ? 'Confirming...' : 'Confirm Booking' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsService } from '@/composables/useSettingsService'

const props = defineProps({
  event: { type: Object, required: true },
  pax: { type: Number, required: true },
  user: { type: Object, required: true },
  submitting: { type: Boolean, default: false }
})

const { getSettings } = useSettingsService()
const currency = ref('INR')

onMounted(async () => {
  try {
    const settings = await getSettings()
    currency.value = settings.currency || 'INR'
  } catch {
    currency.value = 'INR'
  }
})

function formatCurrency(value, code) {
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2
    }).format(value || 0)
  } catch {
    return `${code} ${(value || 0).toFixed(2)}`
  }
}
</script>
