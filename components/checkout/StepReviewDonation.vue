<!-- File: components/checkout/StepReviewDonation.vue -->
<template>
    <div>
      <h2 class="text-[22px] font-bold mb-[30px] text-center">Review & Confirm</h2>
  
      <dl class="grid grid-cols-1 gap-4 text-gray-700 mb-6">
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Donation</dt>
          <dd class="mt-1 text-gray-800">
            {{ item.name }} ({{ item.currency }}{{ item.amount }})
          </dd>
        </div>
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Name</dt>
          <dd class="mt-1 text-gray-800">{{ user.name }}</dd>
        </div>
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Email</dt>
          <dd class="mt-1 text-gray-800">{{ user.email }}</dd>
        </div>
        <div class="bg-[#f2f2f2] p-[10px]">
          <dt class="font-medium text-gray-500">Phone</dt>
          <dd class="mt-1 text-gray-800">{{ user.phone }}</dd>
        </div>
      </dl>
  
      <div class="flex justify-between">
        <button
          @click="$emit('goBack')"
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          @click="$emit('complete')"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Confirm Donation
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    item: { type: Object, required: true },
    user: { type: Object, required: true }
  })
  const emit = defineEmits(['goBack','complete'])
  </script>
  