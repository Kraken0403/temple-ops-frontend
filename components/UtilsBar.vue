<template>
    <div class="flex justify-between items-center mb-[5px] bg-[#ffffff] p-[15px]">
      <h2 class="text-[16px] text-[#111111] font-500">{{ title }}</h2>
      <button
        v-if="buttonLabel"
        @click="emitAction"
        class="flex justify-between cursor-pointer items-center gap-x-[5px] p-[10px] bg-blue-600 text-white rounded text-[14px] hover:bg-blue-700"
      >
      <span class="material-icons text-[15px]">add</span>

        {{ buttonLabel }}
      </button>
    </div>
  </template>
  
  <script setup>
  // Props for the heading text and button label
  const props = defineProps({
    title:       { type: String, required: true },
    buttonLabel: { type: String, default: '' }
  })
  
  // Emit an "action" event when the button is clicked
  const emit = defineEmits(['action'])
  function emitAction() {
    emit('action')
  }
  </script>
  