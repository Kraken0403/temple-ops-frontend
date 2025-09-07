<template>
    <div>
      <h2 class="font-bold mb-2">Sections</h2>
      <div v-for="(sec, i) in modelValue" :key="i" class="mb-4 p-2 border rounded">
        <label class="block mb-1">Heading</label>
        <input v-model="modelValue[i].heading" class="w-full border px-2 py-1 mb-2"/>
        <label class="block mb-1">Body</label>
        <textarea v-model="modelValue[i].body" class="w-full border px-2 py-1" rows="3"/>
        <button type="button"
          @click="$emit('update:modelValue', modelValue.filter((_, j) => j !== i))"
          class="text-red-600"
        >
          Remove
        </button>
      </div>
      <button type="button"
        @click="$emit('update:modelValue', [...modelValue, { heading: '', body: '' }])"
        class="bg-gray-200 px-3 py-1 rounded"
      >
        + Add Section
      </button>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    modelValue: { type: Array, default: () => [] }
  })
  const emit = defineEmits(['update:modelValue'])
  </script>
  