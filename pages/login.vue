<template>
  <div class="mx-auto max-w-sm mt-20 mb-20 p-6 border-[#ccc] border-[1px] rounded shadow">
    <h1 class="text-2xl mb-4 text-center">Admin Login</h1>
    <form @submit.prevent="onSubmit">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full mb-3 p-2 border rounded"
        required
      />
      <button
        type="submit"
        class="w-full cursor-pointer py-2 bg-[#570000] text-white rounded hover:bg-[#650000]"
      >
        Sign in
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const email    = ref('')
const password = ref('')
const { login } = useAuth()
const router   = useRouter()

async function onSubmit() {
  try {
    await login({ email: email.value, password: password.value })
    router.push('/admin/bookings')
  } catch (err) {
    console.error('Login failed:', err)
    // Display an error notification here
  }
}
</script>
