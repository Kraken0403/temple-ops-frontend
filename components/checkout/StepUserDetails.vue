<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Your Details</h2>

    <div class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          id="name"
          v-model="user.name"
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
          v-model="user.phone"
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
          v-model="user.email"
          placeholder="Enter your email"
          type="email"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

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
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['next', 'update-user'])

const nextStep = () => {
  const { name, phone, email } = props.user
  if (!name || !phone || !email) {
    alert('Please fill all fields')
    return
  }
  emit('update-user', props.user)
  emit('next')
}
</script>
