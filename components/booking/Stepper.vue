<!-- File: components/booking/Stepper.vue -->
<template>
    <nav aria-label="Progress navigation" class="mb-8">
      <ol class="flex items-center">
        <li
          v-for="(label, idx) in steps"
          :key="idx"
          class="flex-1 flex flex-col items-center relative"
        >
          <!-- Circle -->
          <div
            class="z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
            :class="{
              'bg-orange-600 text-white': currentStep >= idx,
              'bg-gray-300 text-gray-600': currentStep < idx
            }"
          >
            {{ idx + 1 }}
          </div>
  
          <!-- Connector line (now on every step) -->
          <div
            class="absolute top-4 right-0 h-1 w-full"
            :class="{
              'bg-orange-600': currentStep > idx,
              'bg-gray-300': currentStep <= idx
            }"
          ></div>
  
          <!-- Label underneath -->
          <div
            class="mt-2 text-xs sm:text-sm text-center"
            :class="{
              'text-orange-600': currentStep >= idx,
              'text-gray-600': currentStep < idx
            }"
          >
            {{ label }}
          </div>
        </li>
      </ol>
    </nav>
  </template>
  
  <script setup>
  const props = defineProps({
    /** Step titles */
    steps: {
      type: Array,
      required: true
    },
    /** Zero-based active step */
    currentStep: {
      type: Number,
      required: true
    }
  })
  </script>
  