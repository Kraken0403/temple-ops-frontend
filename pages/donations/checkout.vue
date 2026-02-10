<!-- File: pages/checkout.vue -->
<template>
  <section class="py-10 max-w-xl mx-auto space-y-6">

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500">
      Loading donation option…
    </div>

    <!-- Main flow -->
    <div v-else-if="item">
      <!-- Stepper -->
      <Stepper :steps="labels" :current-step="currentStep" />

      <!-- Current step -->
      <component
        :is="steps[currentStep]"
        :item="item"
        :user="user"
        @update-user="user = $event"
        @next="handleNext"
        @goBack="handleBack"
        @complete="handleComplete"
      />

      <!-- Success -->
      <p
        v-if="success"
        class="mt-4 text-green-600 font-medium text-center"
      >
        ✅ Donation successful! Redirecting...
      </p>
    </div>

    <!-- Not found -->
    <div v-else class="text-red-500 text-center">
      Donation option not found.
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDonationService } from '@/composables/useDonationService'

import Stepper from '@/components/booking/Stepper.vue'
import StepUserDetails from '@/components/checkout/StepUserDetails.vue'
import StepReviewDonation from '@/components/checkout/StepReviewDonation.vue'

const route  = useRoute()
const router = useRouter()

const { getItemById } = useDonationService()

// state
const item        = ref(null)
const loading     = ref(true)
const currentStep = ref(0)
const user        = ref({ name: '', phone: '', email: '' })
const success     = ref(false)

// steps
const steps  = [StepUserDetails, StepReviewDonation]
const labels = ['Your Details', 'Review & Confirm']

// fetch donation item
onMounted(async () => {
  const id = Number(route.query.donationItemId)

  if (!id) {
    loading.value = false
    return
  }

  try {
    item.value = await getItemById(id)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

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

// called AFTER payment success
function handleComplete() {
  success.value = true

  setTimeout(() => {
    router.push('/') // or /donation-success
  }, 1500)
}
</script>

<style scoped>
/* Tailwind handles spacing */
</style>
