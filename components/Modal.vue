<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div class="flex justify-between p-4 border-b">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-black">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="p-4">
          <slot />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({ title: String })
  </script>
  