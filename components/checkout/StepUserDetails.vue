<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Your Details</h2>

    <div class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          v-model="localUser.name"
          placeholder="Enter your full name"
          type="text"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          v-model="localUser.phone"
          type="tel"
          required
          placeholder="Enter your phone number"
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          v-model="localUser.email"
          placeholder="Enter your email"
          type="email"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <!-- ✅ CHECKBOXES -->
      <div class="space-y-3 pt-2">
        <!-- Terms -->
        <label class="flex items-start space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            v-model="localUser.acceptTerms"
            class="mt-1 cursor-pointer"
          />
          <span>
            I agree to the
            <NuxtLink
              to="/terms-and-conditions"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              Terms & Conditions
            </NuxtLink>
          </span>
        </label>

        <!-- Subscribe -->
        <label class="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            v-model="localUser.subscribe"
            class="cursor-pointer"
          />
          <span>
            Text me updates and offers from <strong>Sanatan Mandir Tampa</strong>.
          </span>
        </label>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between mt-6">
        <button
          @click="$emit('goBack')"
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          @click="nextStep"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      <p class="mt-2 text-xs text-gray-500 text-center">
        Your account will be billed by <strong>LITPODS</strong>.
      </p>
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

// Local editable copy
const localUser = ref({
  name: '',
  phone: '',
  email: '',
  acceptTerms: false,
  subscribe: false,
  ...props.user,
})

// Sync if parent updates user
watch(
  () => props.user,
  (val) => {
    localUser.value = { ...localUser.value, ...val }
  },
  { deep: true }
)

const nextStep = () => {
  const { name, phone, email, acceptTerms } = localUser.value

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

  if (!acceptTerms) {
    showNotification('You must accept the Terms & Conditions', 'error')
    return
  }

  emit('update-user', localUser.value)
  showNotification('User details saved', 'success')
  emit('next')
}
</script>

