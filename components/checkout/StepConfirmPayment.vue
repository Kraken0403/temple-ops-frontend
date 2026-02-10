<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">
      Review & Confirm
    </h2>

    <!-- DETAILS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700">

      <div class="bg-gray-100 p-3">
        <div class="text-gray-500 text-sm">Pooja</div>
        <div class="font-medium">{{ pooja.name }}</div>
      </div>

      <div class="bg-gray-100 p-3">
        <div class="text-gray-500 text-sm">Base Amount</div>
        <div class="font-medium">{{ currency }}{{ baseAmount }}</div>

      </div>

      <div class="bg-gray-100 p-3">
        <div class="text-gray-500 text-sm">Slot</div>
        <div class="font-medium">
          {{ formatTime(selectedSlot.slot.start, 'hh:mm a') }}
          –
          {{ formatTime(selectedSlot.slot.end, 'hh:mm a') }}
        </div>
      </div>

      <div class="bg-gray-100 p-3">
        <div class="text-gray-500 text-sm">Date</div>
        <div class="font-medium">
          {{ formatDate(selectedSlot.bookingDate, 'EEE, dd LLL yyyy') }}
        </div>
      </div>

      <div
        v-if="user"
        class="bg-gray-100 p-3 sm:col-span-2"
      >
        <div class="text-gray-500 text-sm">Your Details</div>
        <div class="font-medium whitespace-pre-line">
          {{ user.name }}
          {{ user.phone }}
          {{ user.email }}
        </div>
      </div>

      <div
        v-if="venue?.address"
        class="bg-gray-100 p-3 sm:col-span-2"
      >
        <div class="text-gray-500 text-sm">Venue Address</div>
        <div class="font-medium whitespace-pre-line">
          {{ venueText }}
        </div>
      </div>

      <div class="bg-gray-100 p-3 sm:col-span-2">
      
      <p class="mt-2 text-xs text-gray-500 text-center">
          Your account will be billed by <strong>LITPODS</strong>.
      </p>

      <div class="logos mt-[15px] mx-auto text-center flex justify-center">
            <ul class="flex gap-[10px]" role="list"><li class="list-payment__item">
                <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-visa"><title id="pi-visa">Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"></path></svg>
              </li>
              <li class="list-payment__item">
                <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-master"><title id="pi-master">Mastercard</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><circle fill="#EB001B" cx="15" cy="12" r="7"></circle><circle fill="#F79E1B" cx="23" cy="12" r="7"></circle><path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"></path></svg>
              </li>
              <li class="list-payment__item">
                <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-american_express" viewBox="0 0 38 24" width="38" height="24"><title id="pi-american_express">American Express</title><path fill="#000" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z" opacity=".07"></path><path fill="#006FCF" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32Z"></path><path fill="#FFF" d="M22.012 19.936v-8.421L37 11.528v2.326l-1.732 1.852L37 17.573v2.375h-2.766l-1.47-1.622-1.46 1.628-9.292-.02Z"></path><path fill="#006FCF" d="M23.013 19.012v-6.57h5.572v1.513h-3.768v1.028h3.678v1.488h-3.678v1.01h3.768v1.531h-5.572Z"></path><path fill="#006FCF" d="m28.557 19.012 3.083-3.289-3.083-3.282h2.386l1.884 2.083 1.89-2.082H37v.051l-3.017 3.23L37 18.92v.093h-2.307l-1.917-2.103-1.898 2.104h-2.321Z"></path><path fill="#FFF" d="M22.71 4.04h3.614l1.269 2.881V4.04h4.46l.77 2.159.771-2.159H37v8.421H19l3.71-8.421Z"></path><path fill="#006FCF" d="m23.395 4.955-2.916 6.566h2l.55-1.315h2.98l.55 1.315h2.05l-2.904-6.566h-2.31Zm.25 3.777.875-2.09.873 2.09h-1.748Z"></path><path fill="#006FCF" d="M28.581 11.52V4.953l2.811.01L32.84 9l1.456-4.046H37v6.565l-1.74.016v-4.51l-1.644 4.494h-1.59L30.35 7.01v4.51h-1.768Z"></path></svg>
              </li>
              <li class="list-payment__item">
                <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" width="38" height="24" role="img" aria-labelledby="pi-paypal"><title id="pi-paypal">PayPal</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"></path><path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"></path><path fill="#012169" d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"></path></svg>
              </li>
            </ul>
          </div>
      </div>

    </div>

    <!-- PRICING -->
    <div class="border rounded p-4 bg-gray-50 mb-6">
      <h3 class="font-semibold mb-3">Pricing</h3>

      <div v-if="quoting" class="text-sm text-gray-500">
        Calculating price…
      </div>

      <div v-else-if="quoteError" class="text-sm text-red-600">
        {{ quoteError }}
      </div>

      <div v-else class="space-y-1 text-sm">

        <div class="flex justify-between">
          <span>Base amount</span>
          <div class="font-medium">{{ currency }}{{ baseAmount }}</div>

        </div>

        <template v-if="quote">
          <div
            v-if="quote.travelDistanceUnits != null"
            class="flex justify-between"
          >
            <span>Travel distance</span>
            <span>
              {{ quote.travelDistanceUnits }} {{ quote.travelUnit }}
            </span>
          </div>

          <div
            v-if="quote.travelDistanceUnits != null"
            class="flex justify-between"
          >
            <span>Travel rate</span>
            <span>
              {{ currency }}{{ quote.travelRateApplied }}
              / {{ quote.travelUnit }}
              ({{ quote.freeUnits }} free)
            </span>
          </div>

          <div
            v-if="quote.travelCost > 0"
            class="flex justify-between"
          >
            <span>Travel cost</span>
            <span>{{ currency }}{{ quote.travelCost }}</span>
          </div>

          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>{{ currency }}{{ quote.subtotal }}</span>
          </div>

          <div
            v-if="quote.discount > 0"
            class="flex justify-between text-red-600"
          >
            <span>Discount</span>
            <span>-{{ currency }}{{ quote.discount }}</span>
          </div>

          <hr />

          <div class="flex justify-between font-semibold">
            <span>Total</span>
            <span>{{ currency }}{{ quote.total }}</span>
          </div>
        </template>

        <template v-else>
          <div class="flex justify-between font-semibold">
            <span>Total</span>
            <div class="font-medium">{{ currency }}{{ baseAmount }}</div>

          </div>
        </template>
      </div>
    </div>

    <!-- ACTIONS -->
    <div class="flex justify-between">
      <button
        @click="$emit('goBack')"
        class="px-4 py-2 bg-gray-300 rounded"
      >
        Back
      </button>

      <!-- <button
        @click="submit"
        :disabled="submitting || quoteError || (pooja.isOutsideVenue && !quote)"
        class="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
      >
        {{ submitting ? 'Submitting…' : 'Confirm Booking' }}
      </button> -->
      <button
        @click="handleProceedToPayment"
        :disabled="submitting || quoteError || (pooja.isOutsideVenue && !quote)"
        class="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
      >
        {{ submitting ? 'Processing…' : 'Proceed to Payment' }}
      </button>

    </div>
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative">

        <button
          @click="showPaymentModal = false"
          class="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>
        
        <img class="mx-auto max-w-[200px] my-[15px]" src="@/assets/images/logo.png" alt="">
        <h3 class="text-xl font-semibold mb-1 mt-2 text-center">Complete Payment</h3>
        <p class="text-sm text-gray-600 mb-4 text-center"><i>for </i><strong> {{ pooja.name }}</strong></p>

        <div class="border rounded-lg p-4 mb-4 text-sm">
          <div class="flex justify-between">
            <span>Total</span>
            <span class="font-semibold">
              {{ currency }}{{ quote?.total ?? baseAmount }}
            </span>
          </div>
        </div>

        <PayPalButton
          :amount="Number(quote?.total ?? baseAmount).toFixed(2)"
          :reference-id="bookingId"
          purpose="SERVICES"
          currency="USD"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingService } from '@/composables/useBookingService'
import { useNotification } from '@/composables/useNotification'
import { useSettingsService } from '@/composables/useSettingsService'
import { loadTimezone, formatDate, formatTime } from '@/utils/timezone'

const props = defineProps({
  pooja: Object,
  selectedSlot: Object,
  user: Object,
  venue: Object,
  quote: Object,
  quoting: Boolean,
  quoteError: String,
})

defineEmits(['goBack'])

const bookingId = ref(null)
const showPaymentModal = ref(false)

const router = useRouter()
const { submitBooking } = useBookingService()
const { showNotification } = useNotification()
const { getSettings } = useSettingsService()

const submitting = ref(false)
const currency = ref('USD')

const venueText = computed(() =>
  [
    props.venue?.address,
    [props.venue?.state, props.venue?.zip].filter(Boolean).join(' – ')
  ].filter(Boolean).join('\n')
)

onMounted(async () => {
  const settings = await getSettings()
  currency.value = settings.currency || 'USD'
    console.log(currency.value)
    console.group('🧾 FINAL STEP DEBUG')  
    console.log('pooja:', props.pooja)
    console.log('selectedSlot:', props.selectedSlot)
    console.log('user:', props.user)
    console.log('venue:', props.venue)
    console.log('quote:', props.quote)
    console.log('quoteError:', props.quoteError)
    console.groupEnd()


  await loadTimezone()
})




const baseAmount = computed(() => {
  if (
    props.venue?.venueType === 'CUSTOM' &&
    props.pooja.outsideAmount != null
  ) {
    return props.pooja.outsideAmount
  }
  return props.pooja.amount
})



async function handleProceedToPayment () {
  // Guards (keep your existing ones)
  if (props.pooja.isOutsideVenue && !props.quote) {
    showNotification('Price not calculated yet', 'error')
    return
  }

  submitting.value = true

  try {
    const res = await submitBooking({
      poojaId: props.pooja.id,
      priestId: props.selectedSlot.slot.priestId,

      bookingDate: props.selectedSlot.bookingDate,
      start: props.selectedSlot.slot.start,
      end: props.selectedSlot.slot.end,

      venueType: props.venue.venueType,

      userName: props.user?.name || null,
      userEmail: props.user?.email || null,
      userPhone: props.user?.phone || null,

      venueAddress: props.venue?.address || null,
      venueState: props.venue?.state || null,
      venueZip: props.venue?.zip || null,

      venueLat:
        props.venue.venueType === 'CUSTOM'
          ? props.venue.lat
          : undefined,

      venueLng:
        props.venue.venueType === 'CUSTOM'
          ? props.venue.lng
          : undefined,
    })

    bookingId.value = res.id       // 🔑 same as event
    showPaymentModal.value = true  // 🔑 open PayPal
  } catch (err) {
    showNotification(
      err?.message || 'Booking failed. Please try again.',
      'error'
    )
  } finally {
    submitting.value = false
  }
}

function handlePaymentSuccess () {
  showPaymentModal.value = false
  showNotification('Booking confirmed!', 'success')
  router.push('/confirmation')
}

function handlePaymentError (err) {
  console.error(err)
  showNotification(
    err?.message ||
    'Payment failed. If money was deducted, it will be refunded.',
    'error'
  )
}




</script>
