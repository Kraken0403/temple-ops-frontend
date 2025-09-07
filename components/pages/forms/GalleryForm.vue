<template>
    <div>
      <h2 class="font-bold mb-2">Images</h2>
      <div v-for="(url, i) in modelValue" :key="i" class="flex items-center mb-2">
        <input v-model="modelValue[i]" placeholder="Image URL"
               class="flex-1 border px-2 py-1"/>
        <button type="button"
          @click="$emit('update:modelValue', modelValue.filter((_, j) => j !== i))"
          class="ml-2 text-red-600"
        >
          X
        </button>
      </div>
      <button type="button"
        @click="$emit('update:modelValue', [...modelValue, ''])"
        class="bg-gray-200 px-3 py-1 rounded"
      >
        + Add Image
      </button>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    modelValue: { type: Array, default: () => [] }
  })
  const emit = defineEmits(['update:modelValue'])
  </script>
  