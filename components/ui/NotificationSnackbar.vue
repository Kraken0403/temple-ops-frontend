<template>
    <transition name="fade">
      <div v-if="visible" class="fixed bottom-4 right-4 z-50">
        <div
          class="px-4 py-2 rounded shadow text-white"
          :class="{
            'bg-green-600': type === 'success',
            'bg-red-600': type === 'error'
          }"
        >
          {{ message }}
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useNotification } from '@/composables/useNotification'
  
  const { notification } = useNotification()
  
  const visible = computed(() => notification.value.visible)
  const message = computed(() => notification.value.message)
  const type = computed(() => notification.value.type)
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  