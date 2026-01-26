<template>
  <div
    class="relative p-8 rounded-[0px] shadow bg-[#570000] text-white flex flex-col justify-between min-h-[280px]"
  >
    <div class="mb-6">
      <h3 class="text-[24px] font-semibold mb-2">
        Subscribe to our Newsletter
      </h3>
      <p class="text-sm opacity-90">
        Get event updates, pooja schedules, and temple news in your inbox.
      </p>
    </div>

    <!-- SUCCESS STATE -->
    <div v-if="submitted" class="bg-white/10 rounded p-4">
      <p class="text-sm">
        Thank you for subscribing! 🎉  
        We’ve added <strong>{{ email }}</strong> to our list.
      </p>
    </div>

    <!-- FORM -->
    <form
      v-else
      @submit.prevent="handleSubmit"
      class="space-y-3"
    >
      <input
        v-model.trim="email"
        type="email"
        placeholder="you@example.com"
        class="w-full px-4 py-3 rounded border border-[#ccc] bg-transparent text-white focus:outline-none"
        required
      />

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-white text-[#570000] font-semibold py-3 rounded
               hover:opacity-90 transition cursor-pointer disabled:opacity-60"
      >
        {{ loading ? 'Subscribing…' : 'Subscribe' }}
      </button>

      <p class="text-[11px] opacity-80">
        By subscribing, you agree to receive email updates from us.
        You can unsubscribe anytime.
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNewsletterService } from '@/composables/useNewsletterService'
import { useNotification } from '@/composables/useNotification'

/* ================= STATE ================= */
const email = ref('')
const submitted = ref(false)
const loading = ref(false)

/* ================= COMPOSABLES ================= */
const { subscribe } = useNewsletterService()
const { showNotification } = useNotification()

/* ================= HELPERS ================= */
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
}

/* ================= ACTION ================= */
async function handleSubmit() {
  if (!isValidEmail(email.value)) {
    showNotification('Please enter a valid email address.', 'error')
    return
  }

  loading.value = true

  try {
    await subscribe({
      email: email.value,
      source: 'FOOTER',
    })

    submitted.value = true
    showNotification('You’re successfully subscribed!', 'success')
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.data?.message ||
      err?.message ||
      'Something went wrong. Please try again.'

    // Gracefully handle already subscribed
    if (message.toLowerCase().includes('already')) {
      submitted.value = true
      showNotification('You are already subscribed.', 'success')
    } else {
      showNotification(message, 'error')
    }
  } finally {
    loading.value = false
  }
}
</script>
