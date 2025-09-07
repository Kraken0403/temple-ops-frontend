<template>
    <div>
      <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>
  
      <!-- Details Grid -->
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-700 mb-6">
        <!-- Sponsorship Type -->
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Sponsorship Type</dt>
          <dd class="mt-1 text-gray-800">{{ sponsorship?.sponsorshipType?.name }}</dd>
        </div>
  
        <!-- Event -->
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Event</dt>
          <dd class="mt-1 text-gray-800">{{ sponsorship?.event?.name }}</dd>
        </div>
  
        <!-- Venue -->
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Venue</dt>
          <dd class="mt-1 text-gray-800">{{ sponsorship?.event?.venue }}</dd>
        </div>
  
        <!-- Price -->
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Price</dt>
          <dd class="mt-1 text-gray-800">₹{{ sponsorship?.price }}</dd>
        </div>
  
        <!-- Name -->
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Name</dt>
          <dd class="mt-1 text-gray-800">{{ user.userName }}</dd>
        </div>
  
        <!-- Email -->
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Email</dt>
          <dd class="mt-1 text-gray-800">{{ user.userEmail }}</dd>
        </div>
  
        <!-- Phone -->
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Phone</dt>
          <dd class="mt-1 text-gray-800">{{ user.userPhone }}</dd>
        </div>
      </dl>
  
      <!-- Buttons -->
      <div class="flex justify-between">
        <button
          @click="emit('goBack')"
          class="cursor-pointer px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          @click="confirmBooking"
          class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700"
        >
          Confirm & Book
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useSponsorshipService } from '@/composables/useSponsorshipService'
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
    sponsorship: { type: Object, required: true },
    user: { type: Object, required: true }
  })
  
  const emit = defineEmits(['goBack'])
  
  const router = useRouter()
  const { bookSponsorship } = useSponsorshipService()
  
  const confirmBooking = async () => {
    if (!props.user.userName || !props.user.userEmail || !props.user.userPhone) {
      alert('Please fill in your details.')
      return
    }
  
    try {
      const payload = {
        eventSponsorshipId: props.sponsorship.id,
        sponsorName: props.user.userName,
        sponsorEmail: props.user.userEmail,
        sponsorPhone: props.user.userPhone
      }
  
      await bookSponsorship(payload)
      alert('Sponsorship booked successfully!')
      router.push('/sponsorship/thankyou') // Optional: redirect to thank-you page
    } catch (err) {
      console.error(err)
      alert(err.message || 'Booking failed.')
    }
  }
  </script>
  