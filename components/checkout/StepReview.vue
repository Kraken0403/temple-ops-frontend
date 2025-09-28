<!-- File: components/checkout/StepReview.vue -->
<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>

    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-700 mb-6">
      <!-- Event name -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Event</dt>
        <dd class="mt-1 text-gray-800">{{ event.name }}</dd>
      </div>

      <!-- Seats -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Seats</dt>
        <dd class="mt-1 text-gray-800">{{ pax }}</dd>
      </div>

      <!-- Name -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Name</dt>
        <dd class="mt-1 text-gray-800">{{ user.userName }}</dd>
      </div>

      <!-- Email -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Email</dt>
        <dd class="mt-1 text-gray-800">{{ user.userEmail }}</dd>
      </div>

      <!-- Venue -->
      <div
        v-if="event.venueRel?.address || event.venue"
        class="bg-[#f2f2f2] p-[10px] sm:col-span-2"
      >
        <dt class="font-medium text-gray-500">Venue</dt>
        <dd class="mt-1 text-gray-800">
          {{ event.venueRel?.title || event.venue }}
          <template v-if="event.venueRel?.address">
            — {{ event.venueRel.address }}
          </template>
          <template v-if="event.venueRel?.zipcode">
            , {{ event.venueRel.zipcode }}
          </template>
        </dd>
      </div>

      <!-- Total -->
      <div class="bg-[#f2f2f2] p-[10px] sm:col-span-2">
        <dt class="font-medium text-gray-500">Total</dt>
        <dd class="mt-1 text-gray-800">
          <template v-if="event.price != null">
            {{ formatCurrency(event.price * pax, currency) }}
            <span class="text-xs text-gray-500">
              ({{ formatCurrency(event.price, currency) }} × {{ pax }})
            </span>
          </template>
          <template v-else>Free</template>
        </dd>
      </div>
    </dl>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="$emit('back')"
        class="cursor-pointer px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Back
      </button>
      <button
        @click="$emit('complete')"
        :disabled="submitting"
        class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
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
  stepIndex: { type: Number, default: 2 },
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
    return new Intl.NumberFormat(
      code === 'INR' ? 'en-IN' : 'en-US',
      { style: 'currency', currency: code, maximumFractionDigits: 2 }
    ).format(value || 0)
  } catch {
    return `${code} ${(value || 0).toFixed(2)}`
  }
}
</script>
