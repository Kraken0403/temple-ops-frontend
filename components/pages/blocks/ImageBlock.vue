<!-- src/components/pages/blocks/ImageBlock.vue -->
<template>
    <div>
      <input type="text" v-model="data.url" placeholder="Image URL" class="w-full mb-2" />
      <input type="text" v-model="data.alt" placeholder="Alt text" class="w-full mb-2" />
      <img v-if="data.url" :src="data.url" :alt="data.alt" class="max-w-full" />
    </div>
</template>
  <script setup>
  const data = defineProps({ modelValue: Object })
  const emit = defineEmits(['update:modelValue'])
  watch(data, v => emit('update:modelValue', v), { deep: true })
  </script>
  