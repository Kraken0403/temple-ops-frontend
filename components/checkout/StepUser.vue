<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">Your Information</h2>
      <p class="text-sm text-gray-500">We’ll send your booking confirmation to these details.</p>
    </div>

    <div class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          v-model="local.userName"
          type="text"
          placeholder="Enter your name"
          class="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          v-model="local.userEmail"
          type="email"
          placeholder="you@example.com"
          class="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          v-model="local.userPhone"
          type="tel"
          placeholder="10-digit mobile number"
          class="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>

    <div class="flex justify-between pt-8 border-t border-gray-200">
      <button
        @click="onBack"
        class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
      >
        Back
      </button>
      <button
        @click="onNext"
        class="px-6 py-2 rounded-md bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

const props = defineProps({
  user: { type: Object, required: true },
  stepIndex: { type: Number, default: 1 }
})
const emit = defineEmits(['update-user', 'next', 'back'])

const local = reactive({ ...props.user })
watch(local, () => emit('update-user', { ...local }))

function onNext() {
  if (!local.userName || !local.userEmail || !local.userPhone) {
    showNotification('Please fill in all fields', 'error')
    return
  }
  if (!/^\d{7,15}$/.test(local.userPhone)) {
    showNotification('Phone number must be 7–15 digits', 'error')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(local.userEmail)) {
    showNotification('Enter a valid email address', 'error')
    return
  }

  showNotification('User details saved', 'success')
  emit('next')
}
function onBack() {
  emit('back')
}
</script>
