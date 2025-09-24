<!-- File: pages/checkout.vue -->
<template>
  <section class="py-10 max-w-xl mx-auto space-y-6">
    <div v-if="loading" class="text-center text-gray-500">Loading event…</div>

    <div v-else-if="!event" class="text-red-500 text-center">Event not found.</div>

    <div v-else-if="!event.isOpenForRegistration" class="text-center space-y-4">
      <p class="text-gray-700 text-lg font-medium">Registrations are closed for this event.</p>
      <NuxtLink to="/events" class="inline-block bg-black text-white px-5 py-2 rounded-md hover:opacity-90">
        Browse other events
      </NuxtLink>
    </div>

    <!-- ✅ Success state -->
    <div v-else-if="success" class="text-center space-y-4">
      <h2 class="text-xl font-semibold text-green-700">Booking confirmed!</h2>
      <p class="text-gray-700">We’ve reserved {{ pax }} seat(s) for <strong>{{ event.name }}</strong>.</p>
      <p class="text-sm text-gray-500">Redirecting to Events…</p>
      <NuxtLink to="/events" class="inline-block bg-[#004B21] text-white px-5 py-2 rounded-md hover:bg-green-700">
        Go to Events now
      </NuxtLink>
    </div>

    <!-- Steps -->
    <div v-else>
      <Stepper :steps="labels" :current-step="currentStep" />
      <component
        :is="steps[currentStep]"
        :event="event"
        :pax="pax"
        :user="user"
        :stepIndex="currentStep"
        @update-pax="pax = $event"
        @update-user="user = $event"
        @next="handleNext"
        @back="handleBack"           
        @complete="handleComplete"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsService } from '~/composables/useEventsService'
import { useEventBookingService } from '~/composables/useEventBookingService'

import Stepper   from '~/components/booking/Stepper.vue'
import StepSeats  from '~/components/checkout/StepSeats.vue'
import StepUser   from '~/components/checkout/StepUser.vue'
import StepReview from '~/components/checkout/StepReview.vue'

const route  = useRoute()
const router = useRouter()
const { getEventById } = useEventsService()
const { bookEvent }    = useEventBookingService()

const event       = ref(null)
const loading     = ref(true)
const currentStep = ref(0)
const pax         = ref(1)
const user        = ref({ userName: '', userEmail: '', userPhone: '' })
const success     = ref(false)

const steps  = [StepSeats, StepUser, StepReview]
const labels = ['Select Seats', 'Your Details', 'Review & Confirm']

function handleNext() {
  if (currentStep.value < steps.length - 1) currentStep.value++
}
function handleBack() {
  if (currentStep.value > 0) currentStep.value--
}

async function handleComplete() {
  if (!event.value?.isOpenForRegistration) {
    alert('Registrations are closed for this event.')
    return
  }
  try {
    await bookEvent(event.value.id, {
      pax:       pax.value,
      userName:  user.value.userName,
      userEmail: user.value.userEmail,
      userPhone: user.value.userPhone,
    })
    // ✅ show success UI then redirect
    success.value = true
    setTimeout(() => router.push('/events'), 2000)
  } catch (err) {
    alert(err.message || 'Booking failed')
  }
}

onMounted(async () => {
  const id = Number(route.query.eventId || route.params.id || route.query.id)
  if (!id) { loading.value = false; return }
  try {
    event.value = await getEventById(id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
