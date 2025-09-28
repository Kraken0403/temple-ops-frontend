<template>
  <section class="py-10 max-w-xl mx-auto">
    <Stepper v-if="labels.length" :steps="labels" :current-step="currentStep" />

    <!-- Guard so we never render an undefined component -->
    <component
      v-if="pooja && steps.length && steps[currentStep]"
      :is="steps[currentStep]"
      :pooja="pooja"
      :selectedSlot="selectedSlot"
      :user="user.value"  
      :venue="venue.value"        
      @update-user="(u) => user.value = u"
      @update-venue="(v) => venue.value = v"
      @update-slot="(slot) => selectedSlot = slot"
      @next="handleNext"
      @goBack="handleBack"
    />

    <!-- Optional tiny fallback while loading -->
    <div v-else class="text-center text-gray-500">Loading…</div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePoojaService } from '@/composables/usePoojaService'

// Step Components
import Stepper from '@/components/booking/Stepper'
import StepSlotSelection from '@/components/checkout/StepSlotSelection.vue'
import StepVenueDetails from '@/components/checkout/StepVenueDetails.vue'
import StepUserDetails from '@/components/checkout/StepUserDetails.vue'
import StepConfirmPayment from '@/components/checkout/StepConfirmPayment.vue'

const route = useRoute()
const { getPoojaById } = usePoojaService()

const pooja = ref(null)
const selectedSlot = ref(null)
const user = ref({ name: '', phone: '', email: '' })          // ✅ wrapped in ref
const venue = ref({ address: '', state: '', zip: '' })        // ✅ wrapped in ref
const currentStep = ref(0)

const allSteps = [
  StepSlotSelection,
  StepVenueDetails,
  StepUserDetails,
  StepConfirmPayment
]

// Should we include the venue step?
const needsVenueStep = computed(() => {
  const p = pooja.value
  if (!p) return false
  const hasTempleVenue = !!(p.venueRel || p.venueId)
  return p.isOutsideVenue || (p.isInVenue && hasTempleVenue)
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

function handleNext() {
  if (currentStep.value < steps.value.length - 1) currentStep.value++
}
function handleBack() {
  if (currentStep.value > 0) currentStep.value--
}

// Keep index valid whenever steps change
watch(steps, (arr) => {
  if (currentStep.value > arr.length - 1) currentStep.value = 0
})

onMounted(async () => {
  const id = route.query.poojaId
  if (!id) return
  pooja.value = await getPoojaById(id)
})
</script>
