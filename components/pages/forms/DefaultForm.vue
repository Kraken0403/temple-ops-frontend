<template>
    <div>
      <label class="block mb-1">Body</label>
      <textarea v-model="local.body" class="w-full border px-2 py-1" rows="6"/>
    </div>
  </template>
  
  <script setup>
  import { reactive, watch } from 'vue'
  
  const props = defineProps({
    modelValue: { type: Object, default: () => ({ body: '' }) }
  })
  const emit = defineEmits(['update:modelValue'])
  
  const local = reactive({ body: props.modelValue.body || '' })
  
  watch(local, () => emit('update:modelValue', { ...local }), { deep: true })
  </script>
  