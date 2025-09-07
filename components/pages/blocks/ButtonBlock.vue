<!-- src/components/pages/blocks/ButtonBlock.vue -->
<template>
    <div>
      <input type="text" v-model="data.text" placeholder="Button text" class="w-full mb-2" />
      <input type="text" v-model="data.href" placeholder="Link URL" class="w-full mb-2" />
      <a :href="data.href" class="inline-block bg-blue-600 text-white px-4 py-2">{{ data.text }}</a>
    </div>
</template>
  <script setup>
    const data = defineProps({ modelValue: Object })
    const emit = defineEmits(['update:modelValue'])
    watch(data, v => emit('update:modelValue', v), { deep: true })
  </script>
  