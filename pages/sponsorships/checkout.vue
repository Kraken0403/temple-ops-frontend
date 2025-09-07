<!-- File: pages/sponsorship-checkout.vue -->
<template>
    <section class="py-10 max-w-xl mx-auto space-y-6">
      <div v-if="loading" class="text-center text-gray-500">Loading sponsorship…</div>
  
      <div v-else-if="sponsorship">
        <Stepper :steps="labels" :current-step="currentStep" />
  
        <component
          :is="steps[currentStep]"
          :sponsorship="sponsorship"
          :user="user"
          @update-user="user = $event"
          @next="handleNext"
          @goBack="handleBack"
          @complete="handleComplete"
        />
      </div>
  
      <div v-else class="text-red-500 text-center">Sponsorship not found.</div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSponsorshipService } from '~/composables/useSponsorshipService'
  
  import Stepper from '~/components/booking/Stepper.vue'
  import StepUser from '~/components/checkout/StepUser.vue'
  import StepReviewSponsorship from '~/components/checkout/StepReviewSponsorship.vue'
  
  const route = useRoute()
  const router = useRouter()
  const { getEventSponsorshipById, bookSponsorship } = useSponsorshipService()
  
  const sponsorship = ref(null)
  const loading = ref(true)
  const currentStep = ref(0)
  const user = ref({ userName: '', userEmail: '', userPhone: '' })
  
  const steps = [StepUser, StepReviewSponsorship]
  const labels = ['Your Details', 'Review & Confirm']
  
  function handleNext() {
    if (currentStep.value < steps.length - 1) currentStep.value++
  }
  
  function handleBack() {
    if (currentStep.value > 0) currentStep.value--
  }
  
  async function handleComplete() {
    try {
      await bookSponsorship(sponsorship.value.id, {
        userName: user.value.userName,
        userEmail: user.value.userEmail,
        userPhone: user.value.userPhone
      })
      router.push('/thank-you')
    } catch (err) {
      alert(err.message || 'Booking failed.')
    }
  }
  
  onMounted(async () => {
    const id = Number(route.query.sponsorshipId)
    if (!id) {
      loading.value = false
      return
    }
    try {
      sponsorship.value = await getEventSponsorshipById(id)
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  })
  </script>
  