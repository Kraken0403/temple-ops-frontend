<template>
  <section class="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
    <div v-if="loading" class="text-center text-gray-500 py-20">Loading event…</div>

    <div v-else-if="!event" class="text-center text-red-500 font-medium py-20">
      Event not found.
    </div>

    <div
        v-else-if="!selectedOccurrence"
      class="max-w-lg text-center space-y-6 bg-white p-10 rounded-xl shadow-sm"
    >
      <p class="text-gray-700 text-lg font-medium">
        Registrations are closed for this event.
      </p>
      <NuxtLink
        to="/events"
        class="inline-block bg-black text-white px-6 py-3 rounded-md hover:opacity-90 cursor-pointer"
      >
        Browse other events
      </NuxtLink>
    </div>

    <!-- ✅ Main Checkout -->
    <div
      v-else-if="!success"
      class="w-full max-w-6xl bg-white rounded-2xl shadow-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
    >
      <!-- LEFT: Contact Info -->
      <div>
        <h1 class="text-2xl font-semibold mb-1 text-gray-800">Event Checkout</h1>
        <p class="text-sm text-gray-500 mb-6">
          {{ event.name }} — {{ formatDateRange(
                  selectedOccurrence?.startAt,
                  selectedOccurrence?.endAt
                ) }}

        </p>

        <h2 class="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>

        <form @submit.prevent="handleComplete" class="space-y-5">
          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              v-model="user.userPhone"
              type="tel"
              placeholder="10 digit mobile number"
              class="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              By providing your phone number, you may receive event updates via SMS or WhatsApp.
            </p>
          </div>

          <!-- Name -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                v-model="user.firstName"
                type="text"
                class="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                v-model="user.lastName"
                type="text"
                class="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="user.userEmail"
              type="email"
              placeholder="you@example.com"
              class="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <!-- Checkboxes -->
          <div class="space-y-3 pt-2">
            <label class="flex items-start space-x-2 text-sm text-gray-700">
              <input type="checkbox" v-model="acceptTerms" class="mt-1 cursor-pointer" required />
              <span>
                I agree to the
                <NuxtLink to="/terms-and-conditions" class="text-orange-600 hover:underline" target="_blank">Terms & Conditions</NuxtLink>
               
                <!-- <NuxtLink to="/cancellation" class="text-orange-600 hover:underline" target="_blank">Cancellation Policy</NuxtLink>. -->
              </span>
            </label>

            <label class="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" v-model="subscribe" class="cursor-pointer" />
              <span>
                Text me updates and offers from <strong>{{ orgName }}</strong>.
              </span>
            </label>
          </div>

          <!-- Button -->
          <!-- <button
            type="submit"
            :disabled="!isFormValid || submitting || couponInvalidBlock"
            class="w-full mt-6 bg-orange-600 text-white rounded-md py-3 font-medium hover:bg-orange-700 cursor-pointer transition disabled:opacity-50"
          >
            {{ submitting ? 'Booking…' : 'Book Event' }}
          </button> -->
          <div class="logos mt-[15px]">
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
          <button
            v-if="!showPaymentModal"
            type="submit"
            :disabled="!isFormValid || submitting || couponInvalidBlock"
            class="w-full mt-6 bg-orange-600 text-white rounded-md py-3 font-medium hover:bg-orange-700 transition disabled:opacity-50"
          >
            {{ submitting ? 'Processing…' : 'Proceed to Payment' }}
          </button>
          <p class="mt-2 text-xs text-gray-500 text-center">
              Your account will be billed by <strong>LITPODS</strong>.
            </p>

          <!-- <div v-if="showPayment" class="mt-6">
            <PayPalButton
              :amount="total"
              purpose="EVENT"
              :reference-id="bookingId"
            />
            <p class="text-xs text-gray-500 mt-2 text-center">
              You’ll be redirected to PayPal to complete your payment securely.
            </p>
          </div> -->


          <p v-if="couponInvalidBlock" class="text-xs text-red-600 mt-2">
            Please remove or fix the coupon before booking.
          </p>
        </form>
      </div>

      <!-- RIGHT: Event Summary + Coupon -->
      <div class="border border-[#ececec] rounded-xl bg-gray-50 p-6 h-fit">
        <h2 class="font-semibold text-lg text-gray-800 mb-4">Event Summary</h2>

        <!-- Event Title -->
        <div class="mb-3">
          <h3 class="text-base font-semibold text-gray-900">{{ event.name }}</h3>
          <p class="text-sm text-gray-600 mt-1" v-if="event.category">{{ event.category }}</p>
        </div>

        <!-- Event Date Range -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="font-medium text-gray-900">{{ formatDateRange(selectedOccurrence?.startAt, selectedOccurrence?.endAt) }}</p>
          </div>
          <div class="w-8 h-8 flex items-center justify-center bg-white border rounded-full text-sm text-gray-700">
            <i class="uil uil-calendar-alt"></i>
          </div>
        </div>

        <!-- Venue -->
        <div class="border-t border-gray-200 pt-3 mb-3">
          <p class="text-sm text-gray-600">
            <strong>Venue:</strong>
            {{ event.venueRel?.title || event.venue || 'N/A' }}
            <template v-if="event.venueRel?.address"> — {{ event.venueRel.address }}</template>
          </p>
        </div>

        <!-- Description -->
        <div v-if="event.description" class="border-t border-gray-200 pt-3 mb-3">
          <p class="text-sm text-gray-700">{{ event.description }}</p>
        </div>

        <!-- Pax Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Number of Tickets
            </label>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="pax = Math.max(1, pax - 1)"
                class="w-9 h-9 rounded-md border flex items-center justify-center text-lg"
              >
                −
              </button>

              <input
                type="number"
                v-model.number="pax"
                min="1"
                :max="selectedOccurrence?.capacity || 99"

                class="w-16 text-center border rounded-md py-2"
              />

              <button
                type="button"
                @click="pax = Math.min((event.capacity || 99), pax + 1)"
                class="w-9 h-9 rounded-md border flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
            <p v-if="selectedOccurrence?.capacity" class="text-xs text-gray-500 mt-1">
              {{ selectedOccurrence.capacity - (selectedOccurrence.bookedCount || 0) }}
              tickets remaining
            </p>
          </div>



        <!-- Coupon box -->
        <div class="border-t border-gray-200 pt-4 mt-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Have a coupon?</label>
          <div class="flex gap-2">
            <input
              v-model.trim="couponCode"
              :disabled="couponChecking"
              type="text"
              placeholder="Enter coupon code"
              class="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            />
            <button
              v-if="!couponApplied"
              @click="applyCoupon"
              :disabled="!couponCode || couponChecking"
              class="px-4 py-2 bg-gray-900 text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {{ couponChecking ? 'Checking…' : 'Apply' }}
            </button>
            <button
              v-else
              @click="clearCoupon"
              class="px-4 py-2 border rounded-md hover:bg-white"
            >
              Remove
            </button>
          </div>
          <p v-if="couponStatusText" :class="couponStatusClass" class="text-xs mt-2">
            {{ couponStatusText }}
          </p>
        </div>

        <!-- Pricing -->
        <div class="space-y-2 text-sm text-gray-700 border-t border-gray-200 pt-3 mt-3">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>{{ formatCurrency(subtotal, currency) }}</span>
          </div>

          <div v-if="couponApplied" class="flex justify-between text-green-700">
            <span>Coupon Discount ({{ couponCode }})</span>
            <span>-{{ formatCurrency(discount, currency) }}</span>
          </div>

          <div class="flex justify-between">
            <span>Taxes</span>
            <span>{{ formatCurrency(0, currency) }}</span>
          </div>

          <div class="flex justify-between font-medium border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>{{ formatCurrency(total, currency) }}</span>
          </div>
        </div>

        <div class="mt-5 border-t border-gray-200 pt-3 text-gray-900 font-semibold text-lg flex justify-between">
          <span>Due Today</span>
          <span>{{ formatCurrency(total, currency) }}</span>
        </div>
      </div>
    </div>

    <!-- ✅ Success -->
    <div v-else class="max-w-lg h-fit mx-auto bg-white p-10 rounded-xl shadow-sm text-center space-y-4">
      <h2 class="text-2xl font-semibold text-green-700">Booking Confirmed!</h2>
      <p class="text-gray-700">
        Your booking for <strong>{{ event.name }}</strong> is confirmed.
      </p>
      <p class="text-sm text-gray-500">
        {{ formatDateRange(event.date, event.endDate) }}
      </p>
      <NuxtLink
        to="/events"
        class="inline-block bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition cursor-pointer"
      >
        Go to Events
      </NuxtLink>
    </div>

    <!-- Payment Modal -->

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

      <!-- Logo (same as Services) -->
      <img
        class="mx-auto max-w-[200px] my-[15px]"
        src="@/assets/images/logo.png"
        alt=""
      />

      <!-- Title -->
      <h3 class="text-xl font-semibold mb-1 mt-2 text-center">
        Complete Payment
      </h3>

      <p class="text-sm text-gray-600 mb-4 text-center">
        <i>for </i><strong>{{ event.name }}</strong>
      </p>

      <!-- Amount -->
      <div class="border rounded-lg p-4 mb-4 text-sm">
        <div class="flex justify-between">
          <span>Total</span>
          <span class="font-semibold">
            {{ currency }}{{ total }}
          </span>
        </div>
      </div>

      <!-- PayPal Button -->
      <PayPalButton
        :amount="total"
        :reference-id="bookingId"
        purpose="EVENT"
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



  </section>

  
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsService } from '~/composables/useEventsService'
import { useEventBookingService } from '~/composables/useEventBookingService'
import { useSettingsService } from '@/composables/useSettingsService'
import { useCouponService } from '@/composables/useCouponService' // ✅

const route = useRoute()
const router = useRouter()

const bookingId = ref(null)
const showPaymentModal = ref(false)


const selectedOccurrenceId = computed(() =>
  Number(route.query.occurrenceId || null)
)

function handlePaymentSuccess(result) {
  console.log('[Checkout] Payment success:', result)

  showPaymentModal.value = false
  success.value = true

  // Optional auto-redirect
  // setTimeout(() => {
  //   router.push('/events')
  // }, 2500)
}


function handlePaymentError(err) {
  console.error('[Checkout] Payment error:', err)

  alert(
    err?.message ||
    'Payment failed. If money was deducted, it will be refunded automatically.'
  )
}


const { getEventById } = useEventsService()
const { bookOccurrence } = useEventBookingService()
const { getSettings } = useSettingsService()
const { validateCoupon } = useCouponService() // ✅

const loading = ref(true)
const submitting = ref(false)
const event = ref(null)
const success = ref(false)
const currency = ref('INR')
const timezone = ref('Asia/Kolkata') // default fallback
const orgName = 'Sanatan Temple Florida'

const user = ref({
  firstName: '',
  lastName: '',
  userEmail: '',
  userPhone: ''
})

const pax = ref(1) // if you later add a qty selector, everything already reacts to this
const acceptTerms = ref(false)
const subscribe = ref(false)

/* ───────────── Coupon state ───────────── */
const couponCode = ref('')
const couponChecking = ref(false)
const couponQuote = ref(null) // { valid, subtotal, discount, total, reason? }
const couponError = ref('')   // transport/other errors

const couponApplied = computed(() => !!couponQuote.value?.valid)
const couponInvalidBlock = computed(() => !!couponCode.value && couponQuote.value && !couponQuote.value.valid)

const couponStatusText = computed(() => {
  if (couponChecking.value) return ''
  if (couponError.value) return couponError.value
  if (!couponCode.value) return ''
  if (!couponQuote.value) return ''
  return couponQuote.value.valid
    ? `Coupon applied! You saved ${formatCurrency(couponQuote.value.discount || 0, currency.value)}.`
    : (couponQuote.value.reason || 'Coupon not applicable')
})
const couponStatusClass = computed(() =>
  couponQuote.value?.valid ? 'text-green-700' : 'text-red-600'
)

/* ───────────── Form validity ───────────── */
const isFormValid = computed(() => {
  const phoneValid = /^\d{7,15}$/.test(user.value.userPhone || '')
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.value.userEmail || '')
  const nameValid = !!user.value.firstName?.trim()
  return (
    event.value &&
    selectedOccurrence.value &&
    nameValid &&
    phoneValid &&
    emailValid &&
    acceptTerms.value
  )

})

/* ───────────── Price math (reactive with coupon) ───────────── */
const unitPrice = computed(() => Number(event.value?.price ?? 0))
const subtotal = computed(() => Math.max(0, unitPrice.value * pax.value))
const discount = computed(() => (couponApplied.value ? Math.min(couponQuote.value.discount || 0, subtotal.value) : 0))
const total = computed(() => Math.max(0, subtotal.value - discount.value))

const selectedOccurrence = computed(() => {
  if (!event.value?.occurrences?.length) return null
  if (!selectedOccurrenceId.value) return null

  return (
    event.value.occurrences.find(
      o => o.id === selectedOccurrenceId.value
    ) || null
  )
})

console.log(selectedOccurrence)



/* Re-validate coupon when pax/event changes (only if user has a code typed/applied) */
watch([pax, () => event.value?.id], async () => {
  if (!couponCode.value) return
  await applyCoupon(true) // silent recheck
})

/* ───────────── Helpers ───────────── */
function formatDateTime(d) {
  if (!d) return 'N/A'
  try {
    const date = new Date(d)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone.value
    }).format(date)
  } catch {
    return d
  }
}
function formatDateRange(start, end) {
  if (!start && !end) return 'Date not specified'
  if (!end) return formatDateTime(start)
  return `${formatDateTime(start)} – ${formatDateTime(end)}`
}
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

/* ───────────── Coupon actions ───────────── */
async function applyCoupon(silent = false) {
  couponError.value = ''
  couponQuote.value = null
  if (!couponCode.value) return

  couponChecking.value = true
  try {
    const q = await validateCoupon(couponCode.value, {
      kind: 'event',
      eventId: event.value?.id,
      pax: pax.value,
      // userId: ... // if you have a logged-in user id handy
    })
    couponQuote.value = q
    if (!silent && !q.valid) {
      // leave code in the box so user can edit; we show the reason below the input
    }
  } catch (e) {
    couponError.value = e.message || 'Failed to validate coupon'
  } finally {
    couponChecking.value = false
  }
}
function clearCoupon() {
  couponCode.value = ''
  couponQuote.value = null
  couponError.value = ''
}



async function handleComplete() {
  if (!selectedOccurrence.value) return
  if (!isFormValid.value) return
  if (couponInvalidBlock.value) return

  submitting.value = true
  try {
    const payload = {
      pax: pax.value,
      userName: `${user.value.firstName} ${user.value.lastName}`.trim(),
      userEmail: user.value.userEmail,
      userPhone: user.value.userPhone,
      ...(couponApplied.value
        ? { couponCode: couponCode.value.trim().toUpperCase() }
        : {}),
    }

    // 🔑 IMPORTANT: backend must create booking with status = PENDING
    const res = await bookOccurrence(selectedOccurrence.value.id, payload)

    bookingId.value = res.id // <-- booking ID from backend
    showPaymentModal.value = true // <-- reveal PayPal button
  } catch (err) {
    alert(err.message || 'Booking failed.')
  } finally {
    submitting.value = false
  }
}


/* ───────────── Init ───────────── */
onMounted(async () => {
  try {
    const id = Number(route.query.eventId || route.params.id || route.query.id)
    if (!id) return (loading.value = false)

    event.value = await getEventById(id)
    const settings = await getSettings()
    currency.value = settings.currency || 'USD'
    timezone.value = settings.timezone || 'Asia/Kolkata'
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
input, textarea, button { outline: none; }
button { cursor: pointer !important; }
</style>
