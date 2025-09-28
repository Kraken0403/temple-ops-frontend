<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Your Details</h2>

    <div class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          id="name"
          v-model="localUser.name"
          placeholder="Enter your full name"
          type="text"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          id="phone"
          v-model="localUser.phone"
          type="tel"
          required
          placeholder="Enter your phone number"
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          v-model="localUser.email"
          placeholder="Enter your email"
          type="email"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div class="flex justify-between mt-6">
        <button
          @click="$emit('goBack')"
          class="px-4 py-2 bg-gray-300 cursor-pointer rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          @click="nextStep"
          class="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'
const { showNotification } = useNotification()

const props = defineProps({
  user: { type: Object, required: true }
})
const emit = defineEmits(['next', 'goBack', 'update-user'])

// ✅ create a local copy of props.user for v-model
const localUser = ref({ ...props.user })

// keep localUser in sync if parent updates user externally
watch(
  () => props.user,
  (newVal) => {
    localUser.value = { ...newVal }
  },
  { deep: true }
)

const nextStep = () => {
  const { name, phone, email } = localUser.value

  if (!name || !phone || !email) {
    showNotification('Please fill all fields', 'error')
    return
  }
  if (!/^\d{7,15}$/.test(phone)) {
    showNotification('Phone number must be 7–15 digits', 'error')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showNotification('Enter a valid email address', 'error')
    return
  }

  emit('update-user', localUser.value) // ✅ send back to parent
  showNotification('User details saved', 'success')
  emit('next')
}
</script>
