<template>
  <section class="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
    <div v-if="loading" class="text-center text-gray-500 py-20">Loading event…</div>

    <div v-else-if="!event" class="text-center text-red-500 font-medium py-20">
      Event not found.
    </div>

    <div
      v-else-if="!event.isOpenForRegistration"
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
          {{ event.name }} — {{ formatDateRange(event.date, event.endDate) }}
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
                <NuxtLink to="/terms" class="text-orange-600 hover:underline" target="_blank">Terms & Conditions</NuxtLink>
                and
                <NuxtLink to="/cancellation" class="text-orange-600 hover:underline" target="_blank">Cancellation Policy</NuxtLink>.
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
          <button
            type="submit"
            :disabled="!isFormValid || submitting || couponInvalidBlock"
            class="w-full mt-6 bg-orange-600 text-white rounded-md py-3 font-medium hover:bg-orange-700 cursor-pointer transition disabled:opacity-50"
          >
            {{ submitting ? 'Booking…' : 'Book Event' }}
          </button>
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
            <p class="font-medium text-gray-900">{{ formatDateRange(event.date, event.endDate) }}</p>
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
    <div v-else class="max-w-lg mx-auto bg-white p-10 rounded-xl shadow-sm text-center space-y-4">
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
const { getEventById } = useEventsService()
const { bookEvent } = useEventBookingService()
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
  return event.value && nameValid && phoneValid && emailValid && acceptTerms.value
})

/* ───────────── Price math (reactive with coupon) ───────────── */
const unitPrice = computed(() => Number(event.value?.price ?? 0))
const subtotal = computed(() => Math.max(0, unitPrice.value * pax.value))
const discount = computed(() => (couponApplied.value ? Math.min(couponQuote.value.discount || 0, subtotal.value) : 0))
const total = computed(() => Math.max(0, subtotal.value - discount.value))

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

/* ───────────── Booking ───────────── */
async function handleComplete() {
  if (!isFormValid.value) return

  // If a code is typed but invalid, block submit
  if (couponInvalidBlock.value) return

  submitting.value = true
  try {
    const payload = {
      pax: pax.value,
      userName: `${user.value.firstName} ${user.value.lastName}`.trim(),
      userEmail: user.value.userEmail,
      userPhone: user.value.userPhone,
      // send couponCode only if valid; backend will record redemption after booking
      ...(couponApplied.value ? { couponCode: couponCode.value.trim().toUpperCase() } : {}),
    }
    await bookEvent(event.value.id, payload)
    success.value = true
    setTimeout(() => router.push('/events'), 2500)
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
    currency.value = settings.currency || 'INR'
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
