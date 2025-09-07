<template>
    <div class="space-y-4">
      <div>
        <label class="block mb-1">Address</label>
        <input v-model="local.address" class="w-full border px-2 py-1"/>
      </div>
      <div>
        <label class="block mb-1">Phone</label>
        <input v-model="local.phone" class="w-full border px-2 py-1"/>
      </div>
      <div>
        <label class="block mb-1">Email</label>
        <input v-model="local.email" class="w-full border px-2 py-1"/>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, watch } from 'vue'
  
  const props = defineProps({
    modelValue: { type: Object, default: () => ({}) }
  })
  const emit = defineEmits(['update:modelValue'])
  
  // local copy so v-model works on nested fields
  const local = reactive({
    address: props.modelValue.address || '',
    phone:   props.modelValue.phone   || '',
    email:   props.modelValue.email   || ''
  })
  
  // sync back up whenever local changes
  watch(local, () => emit('update:modelValue', { ...local }), { deep: true })
  </script>
  