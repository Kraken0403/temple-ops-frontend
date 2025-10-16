<template>
    <div
      class="relative p-8 rounded-[0px] shadow bg-[#570000] text-white flex flex-col justify-between min-h-[280px]"
    >
      <div class="mb-6">
        <h3 class="text-[24px] font-semibold mb-2">Subscribe to our Newsletter</h3>
        <p class="text-sm opacity-90">
          Get event updates, pooja schedules, and temple news in your inbox.
        </p>
      </div>
  
      <div v-if="submitted" class="bg-white/10 rounded p-4">
        <p class="text-sm">
          Thank you for subscribing! 🎉 We’ve added <strong>{{ email }}</strong> to our list.
        </p>
      </div>
  
      <form v-else @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <input
            v-model.trim="email"
            type="email"
            placeholder="you@example.com"
            class="w-full px-4 py-3 rounded border-1 border-[#ccc] text-[#fff] focus:outline-none"
            required
          />
          <p v-if="error" class="text-xs text-yellow-200 mt-2">{{ error }}</p>
        </div>
        <button
          type="submit"
          class="w-full bg-white text-[#570000] font-semibold py-3 rounded hover:opacity-90 transition cursor-pointer"
        >
          Subscribe
        </button>
        <p class="text-[11px] opacity-80">
          By subscribing, you agree to receive email updates from us. You can unsubscribe anytime.
        </p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const email = ref('')
  const submitted = ref(false)
  const error = ref('')
  
  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
  }
  
  function handleSubmit() {
    error.value = ''
    if (!isValidEmail(email.value)) {
      error.value = 'Please enter a valid email address.'
      return
    }
    // Dummy success path
    submitted.value = true
  }
  </script>
  