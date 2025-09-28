<template>
    <transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
          <p class="text-gray-700 mb-6">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button @click="$emit('cancel')" class="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button @click="$emit('confirm')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Yes, Delete</button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  defineProps({
    open: { type: Boolean, required: true },
    title: { type: String, default: 'Confirm' },
    message: { type: String, default: 'Are you sure?' }
  })
  defineEmits(['confirm', 'cancel'])
  </script>
  
  <style scoped>
  .fade-enter-active, .fade-leave-active { transition: opacity .2s; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
  </style>
  