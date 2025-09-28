<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Your Information</h2>

    <div class="space-y-4">
      <div>
        <label for="userName" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input id="userName" v-model="local.userName" placeholder="Enter your name" type="text"
               class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]" />
      </div>

      <div>
        <label for="userEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input id="userEmail" v-model="local.userEmail" placeholder="Enter your email" type="email"
               class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]" />
      </div>

      <div>
        <label for="userPhone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input id="userPhone" v-model="local.userPhone" placeholder="Enter your phone number" type="tel"
               class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]" />
      </div>
    </div>

    <div class="flex justify-between mt-6">
      <button @click="onBack" class="px-4 cursor-pointer py-2 bg-gray-300 rounded hover:bg-gray-400">Back</button>
      <button @click="onNext" class="px-4 cursor-pointer py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Next</button>
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
    showNotification('All fields are required', 'error')
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

  emit('next')
  showNotification('User details saved', 'success')
}
function onBack() { emit('back') }
</script>
