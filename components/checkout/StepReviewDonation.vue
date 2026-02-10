<!-- File: components/checkout/StepReviewDonation.vue -->
<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">
      Review & Confirm
    </h2>

    <!-- REVIEW DETAILS -->
    <dl class="grid grid-cols-1 gap-4 text-gray-700 mb-6">
      <!-- Donation -->
      <div class="bg-[#f2f2f2] p-[10px]">
        <dt class="font-medium text-gray-500">Donation</dt>
        <dd class="mt-1 text-gray-800">
          {{ item.name }} –
          {{ formatMoney(item.amount ?? 0, currency) }}
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

    <!-- ACTIONS -->
    <div class="flex justify-between">
      <button
        @click="emit('goBack')"
        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        :disabled="processing"
      >
        Back
      </button>

      <button
        @click="openPayment"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        :disabled="processing"
      >
        {{ processing ? 'Processing…' : 'Confirm Donation' }}
      </button>
    </div>

    <!-- 💳 PAYMENT MODAL -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative">

        <!-- Close -->
        <button
          @click="showPaymentModal = false"
          class="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <img
          class="mx-auto max-w-[200px] my-[15px]"
          src="@/assets/images/logo.png"
          alt=""
        />

        <h3 class="text-xl font-semibold mb-1 mt-2 text-center">
          Complete Donation
        </h3>

        <p class="text-sm text-gray-600 mb-4 text-center">
          <i>for </i><strong>{{ item.name }}</strong>
        </p>

        <!-- Amount -->
        <div class="border rounded-lg p-4 mb-4 text-sm">
          <div class="flex justify-between">
            <span>Total</span>
            <span class="font-semibold">
              {{ currency }}{{ item.amount }}
            </span>
          </div>
        </div>

        <!-- PayPal -->
        <PayPalButton
          :amount="item.amount"
          :reference-id="donationId"
          purpose="DONATION"
          :currency="currency"
          @success="handlePaymentSuccess"
          @cancel="showPaymentModal = false"
          @error="handlePaymentError"
        />

        <p class="text-xs text-gray-500 mt-3 text-center">
          Pay securely using PayPal or Debit/Credit Card.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsService } from '@/composables/useSettingsService'
import { useDonationService } from '@/composables/useDonationService'

const props = defineProps({
  item: { type: Object, required: true }, // donation item
  user: { type: Object, required: true }
})

const emit = defineEmits(['goBack', 'complete'])

const { getSettings } = useSettingsService()
const { createDonation } = useDonationService()

const currency = ref('INR')
const showPaymentModal = ref(false)
const donationId = ref(null)
const processing = ref(false)

onMounted(async () => {
  try {
    const s = await getSettings()
    currency.value = s?.currency || 'INR'
  } catch {
    currency.value = 'INR'
  }
})

async function openPayment() {
  if (processing.value) return
  processing.value = true

  try {
    // 1️⃣ Create PENDING donation record
    const res = await createDonation({
      donationItemId: props.item.id,
      donorName: props.user.name,
      donorEmail: props.user.email,
      donorPhone: props.user.phone,
    })

    donationId.value = res.id
    showPaymentModal.value = true
  } catch (e) {
    alert(
      e?.message ||
      'Failed to initiate donation. Please try again.'
    )
    processing.value = false
  }
}

function handlePaymentSuccess() {
  showPaymentModal.value = false
  emit('complete') // parent handles success + redirect
}

function handlePaymentError(err) {
  console.error(err)
  alert(
    err?.message ||
    'Payment failed. Please try again.'
  )
}

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
