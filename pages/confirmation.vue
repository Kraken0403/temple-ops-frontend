<template>
    <section class="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <div class="max-w-md bg-white rounded-lg shadow-lg p-8">
        <div class="text-green-600 text-4xl mb-4">✅</div>
        <h1 class="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p class="text-gray-700 mb-6">Thank you for booking your pooja with us. You’ll receive a confirmation email shortly.</p>
  
        <NuxtLink
          to="/"
          class="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Home
        </NuxtLink>
      </div>
    </section>
  </template>
  
  <script setup>
  definePageMeta({
    layout: 'default'
  })
  </script>
  
  <style scoped>
  /* You can add animations or illustrations here later */
  </style>
  