<!-- File: pages/checkout.vue -->
<template>
    <section class="py-10 max-w-xl mx-auto space-y-6">
      <!-- Loading state -->
      <div v-if="loading" class="text-center text-gray-500">
        Loading donation option…
      </div>
  
      <!-- When we have the item, show the Stepper + current step -->
      <div v-else-if="item">
        <!-- ① Stepper Header -->
        <Stepper :steps="labels" :current-step="currentStep" />
  
        <!-- ② Current Step Component -->
        <component
          :is="steps[currentStep]"
          :item="item"
          :user="user"
          @update-user="user = $event"
          @next="handleNext"
          @goBack="handleBack"
          @complete="handleComplete"
        />
  
        <!-- Success message -->
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
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useDonationService } from '@/composables/useDonationService'
  import Stepper from '@/components/booking/Stepper.vue'
  import StepUserDetails from '@/components/checkout/StepUserDetails.vue'
  import StepReviewDonation from '@/components/checkout/StepReviewDonation.vue'
  
  const route    = useRoute()
  const router   = useRouter()
  const { getItemById, createRecord } = useDonationService()
  
  // state
  const item        = ref(null)
  const loading     = ref(true)
  const currentStep = ref(0)
  const user        = ref({ name: '', phone: '', email: '' })
  const success     = ref(false)
  
  // define your steps & labels
  const steps  = [StepUserDetails, StepReviewDonation]
  const labels = ['Your Details','Review & Confirm']
  
  // fetch on mount
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
  const handleNext = () => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
  }
  const handleBack = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }
  
  // on complete: create record, show message, delay then redirect
  async function handleComplete() {
    try {
      await createRecord({
        donationItemId: item.value.id,
        donorName:      user.value.name,
        donorEmail:     user.value.email,
        donorPhone:     user.value.phone
      })
      success.value = true
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      alert(err.message || 'Donation failed')
    }
  }
  </script>
  
  <style scoped>
  /* spacing is handled by Tailwind */
  </style>
  