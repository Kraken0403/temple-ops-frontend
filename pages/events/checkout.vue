<!-- File: pages/checkout.vue -->
<template>
  <section class="py-10 max-w-xl mx-auto space-y-6">
    <!-- Loading state -->
    <div v-if="loading" class="text-center text-gray-500">
      Loading event…
    </div>

    <!-- When we have the event, show the Stepper + current step -->
    <div v-else-if="event">
      <!-- ① Stepper Header -->
      <Stepper :steps="labels" :current-step="currentStep" />

      <!-- ② Current Step Component -->
      <component
        :is="steps[currentStep]"
        :event="event"
        :pax="pax"
        :user="user"
        @update-pax="pax = $event"
        @update-user="user = $event"
        @next="handleNext"
        @goBack="handleBack"
        @complete="handleComplete"
      />
    </div>

    <!-- Not found -->
    <div v-else class="text-red-500 text-center">
      Event not found.
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsService } from '~/composables/useEventsService'
import { useEventBookingService } from '~/composables/useEventBookingService'

// Steps & Stepper
import Stepper   from '~/components/booking/Stepper.vue'
import StepSeats  from '~/components/checkout/StepSeats.vue'
import StepUser   from '~/components/checkout/StepUser.vue'
import StepReview from '~/components/checkout/StepReview.vue'

const route  = useRoute()
const router = useRouter()
const { getEventById } = useEventsService()
const { bookEvent }    = useEventBookingService()

// state
const event       = ref(null)
const loading     = ref(true)
const currentStep = ref(0)
const pax         = ref(1)
const user        = ref({ userName: '', userEmail: '', userPhone: '' })

// static arrays
const steps  = [StepSeats, StepUser, StepReview]
const labels = ['Select Seats', 'Your Details', 'Review & Confirm']

// navigation
function handleNext() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}
function handleBack() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// final booking
async function handleComplete() {
  try {
    await bookEvent(event.value.id, {
      pax:       pax.value,
      userName:  user.value.userName,
      userEmail: user.value.userEmail,
      userPhone: user.value.userPhone,
    })
    router.push('/home')
  } catch (err) {
    alert(err.message || 'Booking failed')
  }
}

// fetch the event on mount
onMounted(async () => {
  const id = Number(route.query.eventId)
  if (!id) {
    loading.value = false
    return
  }
  try {
    event.value = await getEventById(id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* spacing is handled by Tailwind in the template */
</style>
