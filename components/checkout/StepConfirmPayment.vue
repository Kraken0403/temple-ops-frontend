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

      <button
        @click="submit"
        :disabled="submitting || quoteError || (pooja.isOutsideVenue && !quote)"
        class="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
      >
        {{ submitting ? 'Submitting…' : 'Confirm Booking' }}
      </button>
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

const router = useRouter()
const { submitBooking } = useBookingService()
const { showNotification } = useNotification()
const { getSettings } = useSettingsService()

const submitting = ref(false)
const currency = ref('$')

const venueText = computed(() =>
  [
    props.venue?.address,
    [props.venue?.state, props.venue?.zip].filter(Boolean).join(' – ')
  ].filter(Boolean).join('\n')
)

onMounted(async () => {
  const settings = await getSettings()
  currency.value = settings.currency || '$'

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
  if (props.pooja.isOutsideVenue) {
    return props.pooja.outsideAmount ?? props.pooja.amount
  }
  return props.pooja.amount
})


async function submit () {
  if (props.pooja.isOutsideVenue && !props.quote) return
  if (props.quoteError) return
  console.log('🚀 BOOKING SUBMIT PAYLOAD', {
    props
  })
  submitting.value = true

  await submitBooking({
    poojaId: props.pooja.id,
    priestId: props.selectedSlot.slot.priestId,

    bookingDate: props.selectedSlot.bookingDate,
    start: props.selectedSlot.slot.start,
    end: props.selectedSlot.slot.end,

    // ✅ user snapshot
    userName: props.user?.name || null,
    userEmail: props.user?.email || null,
    userPhone: props.user?.phone || null,

    // ✅ venue snapshot (THIS IS THE FIX)
    venueAddress: props.venue?.address || null,
    venueState: props.venue?.state || null,
    venueZip: props.venue?.zip || null,
    venueLat: props.venue?.lat ?? undefined,
    venueLng: props.venue?.lng ?? undefined,
})


  showNotification('Booking successful!', 'success')
  router.push('/confirmation')
}

</script>
