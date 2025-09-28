<!-- File: components/checkout/StepReviewDonation.vue -->
<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>

    <dl class="grid grid-cols-1 gap-4 text-gray-700 mb-6">
      <!-- Donation -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Donation</dt>
        <dd class="mt-1 text-gray-800">
          {{ item.name }} –
          {{ formatMoney(item.amount ?? 0, settingsCurrency) }}
        </dd>
      </div>

      <!-- Name -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Name</dt>
        <dd class="mt-1 text-gray-800">{{ user.name }}</dd>
      </div>

      <!-- Email -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Email</dt>
        <dd class="mt-1 text-gray-800">{{ user.email }}</dd>
      </div>

      <!-- Phone -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Phone</dt>
        <dd class="mt-1 text-gray-800">{{ user.phone }}</dd>
      </div>
    </dl>

    <!-- Buttons -->
    <div class="flex justify-between">
      <button
        @click="emit('goBack')"
        class="px-4 py-2 cursor-pointer bg-gray-300 rounded hover:bg-gray-400"
      >
        Back
      </button>
      <button
        @click="emit('complete')"
        class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700"
      >
        Confirm Donation
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsService } from '@/composables/useSettingsService'

const props = defineProps({
  item: { type: Object, required: true },
  user: { type: Object, required: true }
})

const emit = defineEmits(['goBack', 'complete'])

const { getSettings } = useSettingsService()
const settingsCurrency = ref('INR')

onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
  } catch {
    settingsCurrency.value = 'INR'
  }
})

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return currencySymbol(code) + '0'
  try {
    return new Intl.NumberFormat(
      code === 'INR' ? 'en-IN' : 'en-US',
      { style: 'currency', currency: code, maximumFractionDigits: 0 }
    ).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}
</script>
