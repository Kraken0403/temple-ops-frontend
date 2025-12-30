<template>
  <section class="py-10 max-w-xl mx-auto">
    <!-- Stepper -->
    <Stepper
      v-if="steps.length"
      :steps="labels"
      :current-step="currentStep"
    />

    <!-- Active Step -->
    <component
      v-if="pooja && steps[currentStep]"
      :is="steps[currentStep]"
      :pooja="pooja"
      :selectedSlot="selectedSlot"
      :user="user"
      :venue="venue"
      :quote="quote"
      :quoting="quoting"
      :quoteError="quoteError"
      @update-user="user = $event"
      @update-venue="onUpdateVenue"
      @update-slot="selectedSlot = $event"
      @next="handleNext"
      @goBack="handleBack"
    />

    <div v-else class="text-center text-gray-500 py-10">
      Loading…
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePoojaService } from '@/composables/usePoojaService'
import { useBookingService } from '@/composables/useBookingService'

/* ───────── Components ───────── */
import Stepper from '@/components/booking/Stepper'
import StepSlotSelection from '@/components/checkout/StepSlotSelection.vue'
import StepVenueDetails from '@/components/checkout/StepVenueDetails.vue'
import StepUserDetails from '@/components/checkout/StepUserDetails.vue'
import StepConfirmPayment from '@/components/checkout/StepConfirmPayment.vue'

/* ───────── Services ───────── */
const route = useRoute()
const { getPoojaById } = usePoojaService()
const { quoteBooking } = useBookingService()

/* ───────── State ───────── */
const pooja = ref(null)
const selectedSlot = ref(null)

const user = ref({
  name: '',
  phone: '',
  email: '',
})

const venue = ref({
  address: '',
  state: '',
  zip: '',
  lat: null,
  lng: null,
})

const quote = ref(null)
const quoting = ref(false)
const quoteError = ref(null)

const currentStep = ref(0)

/* ───────── Steps ───────── */
const allSteps = [
  StepSlotSelection,
  StepVenueDetails,
  StepUserDetails,
  StepConfirmPayment,
]



const needsVenueStep = computed(() => {
  if (!pooja.value) return false
  return pooja.value.isOutsideVenue
})

const steps = computed(() => {
  if (!pooja.value) return []
  return needsVenueStep.value
    ? allSteps
    : [StepSlotSelection, StepUserDetails, StepConfirmPayment]
})

const labels = computed(() => {
  if (!pooja.value) return []
  return needsVenueStep.value
    ? ['Select Slot', 'Venue Details', 'Your Details', 'Review']
    : ['Select Slot', 'Your Details', 'Review']
})

/* ───────── Navigation ───────── */
function handleNext() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

function onUpdateVenue(v) {
  venue.value = {
    ...venue.value,
    ...v,
  }
}

function handleBack() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

/* ───────── Quote Logic (FIXED & SAFE) ───────── */
watch(
  () => ({
    slot: selectedSlot.value,
    lat: venue.value?.lat,
    lng: venue.value?.lng,
  }),
  async ({ slot, lat, lng }) => {
    console.group('🧮 QUOTE WATCHER')

    if (!slot || !pooja.value) {
      quote.value = null
      quoteError.value = null
      console.info('⏸ waiting for slot / pooja')
      console.groupEnd()
      return
    }

    if (pooja.value.isOutsideVenue && (!lat || !lng)) {
      quote.value = null
      quoteError.value = null
      console.info('⏳ waiting for venue location')
      console.groupEnd()
      return
    }

    quoting.value = true
    quoteError.value = null

    try {
      const res = await quoteBooking({
        poojaId: pooja.value.id,
        venueLat: lat ?? undefined,
        venueLng: lng ?? undefined,
      })

      console.log('✅ QUOTE RESULT:', res)
      quote.value = res
    } catch (err) {
      console.error('❌ QUOTE ERROR:', err)
      quote.value = null
      quoteError.value = err?.message || 'Failed to calculate price'
    } finally {
      quoting.value = false
      console.groupEnd()
    }
  },
  { immediate: true, flush: 'post' }
)

/* ───────── Step Guard ───────── */
watch(steps, (arr) => {
  if (currentStep.value > arr.length - 1) {
    currentStep.value = arr.length - 1
  }
})

/* ───────── Load Pooja ───────── */
onMounted(async () => {
  const id = route.query.poojaId
  if (!id) return
  pooja.value = await getPoojaById(id)
})
</script>
