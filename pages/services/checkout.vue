<template>
  <section class="py-10 max-w-xl mx-auto">
    <Stepper :steps="labels" :current-step="currentStep" />
    <component
      :is="steps[currentStep]"
      :pooja="pooja"
      :selectedSlot="selectedSlot"
      :user="user"
      :venue="venue"
      @update-user="(u) => user.value = u"
      @update-venue="(v) => venue.value = v"
      @update-slot="(slot) => selectedSlot = slot"
      @next="handleNext"
      @goBack="handleBack"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const user = ref({ name: '', phone: '', email: '' })
const venue = ref({ address: '', state: '', zip: '' })
const currentStep = ref(0)

const allSteps = [
  StepSlotSelection,
  StepVenueDetails,
  StepUserDetails,
  StepConfirmPayment
]

// Only include StepVenueDetails if pooja is outside venue
const steps = computed(() => {
  if (!pooja.value) return []
  return pooja.value.isOutsideVenue
    ? allSteps
    : [StepSlotSelection, StepUserDetails, StepConfirmPayment]
})

const labels = computed(() => {
  if (!pooja.value) return []
  return pooja.value.isOutsideVenue
    ? ['Select Slot','Venue Details','Your Details','Review']
    : ['Select Slot','Your Details','Review']
})

const handleNext = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

const handleBack = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

onMounted(async () => {
  const id = route.query.poojaId
  if (!id) return
  pooja.value = await getPoojaById(id)
})
</script>
