<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>

    <!-- Details Grid -->
    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-700 mb-6">
      <!-- Sponsorship Type -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Sponsorship Type</dt>
        <dd class="mt-1 text-gray-800">{{ sponsorship?.sponsorshipType?.name }}</dd>
      </div>

      <!-- Event -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Event</dt>
        <dd class="mt-1 text-gray-800">{{ sponsorship?.event?.name }}</dd>
      </div>

      <!-- Price -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Price</dt>
        <dd class="mt-1 text-gray-800">
          {{ formatMoney(sponsorship?.price ?? 0, settingsCurrency) }}
        </dd>
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

      <!-- Phone -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Phone</dt>
        <dd class="mt-1 text-gray-800">{{ user.userPhone }}</dd>
      </div>
    </dl>

    <!-- Buttons -->
    <div class="flex justify-between">
      <button
        @click="emit('goBack')"
        class="cursor-pointer px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Back
      </button>
      <button
        @click="confirmBooking"
        class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700"
      >
        Confirm & Book
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSponsorshipService } from '@/composables/useSponsorshipService'
import { useSettingsService } from '@/composables/useSettingsService'
import { useRouter } from 'vue-router'

const props = defineProps({
  sponsorship: { type: Object, required: true },
  user: { type: Object, required: true }
})

const emit = defineEmits(['goBack'])
const router = useRouter()

const { bookSponsorship } = useSponsorshipService()
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

const confirmBooking = async () => {
  if (!props.user.userName || !props.user.userEmail || !props.user.userPhone) {
    alert('Please fill in your details.')
    return
  }

  try {
    const payload = {
      eventSponsorshipId: props.sponsorship.id,
      sponsorName: props.user.userName,
      sponsorEmail: props.user.userEmail,
      sponsorPhone: props.user.userPhone
    }

    await bookSponsorship(payload)
    alert('Sponsorship booked successfully!')
    router.push('/') // redirect
  } catch (err) {
    console.error(err)
    alert(err.message || 'Booking failed.')
  }
}
</script>
