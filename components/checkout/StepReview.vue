<!-- File: components/checkout/StepReview.vue -->
<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>

    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-700 mb-6">
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Event</dt>
        <dd class="mt-1 text-gray-800">{{ event.name }}</dd>
      </div>

      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Seats</dt>
        <dd class="mt-1 text-gray-800">{{ pax }}</dd>
      </div>

      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Name</dt>
        <dd class="mt-1 text-gray-800">{{ user.userName }}</dd>
      </div>

      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Email</dt>
        <dd class="mt-1 text-gray-800">{{ user.userEmail }}</dd>
      </div>

      <!-- ✅ Total cost -->
      <div class="bg-[#f2f2f2] p-[10px] sm:col-span-2">
        <dt class="font-medium text-gray-500">Total</dt>
        <dd class="mt-1 text-gray-800">
          <template v-if="event.price != null">
            {{ formatINR(event.price * pax) }}
            <span class="text-xs text-gray-500">({{ formatINR(event.price) }} × {{ pax }})</span>
          </template>
          <template v-else>—</template>
        </dd>
      </div>
    </dl>

    <div class="flex justify-between">
      <button @click="$emit('back')" class="cursor-pointer px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Back</button>
      <button @click="$emit('complete')" class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700">
        Confirm Booking
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  event: { type: Object, required: true },
  pax:   { type: Number, required: true },
  user:  { type: Object, required: true },
  stepIndex: { type: Number, default: 2 } // optional for consistency
})

function formatINR(value) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0)
  } catch {
    return `₹${(value || 0).toFixed(2)}`
  }
}
</script>
