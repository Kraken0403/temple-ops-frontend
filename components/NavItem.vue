<template>
  <NuxtLink
    :to="to"
    class="flex text-[14px] items-center space-x-2 px-2 py-3 rounded hover:bg-gray-100 transition"
    :class="isActive ? 'bg-gray-100 text-blue-600' : 'text-gray-800'"
  >
    <span v-if="icon" class="material-icons text-base">{{ icon }}</span>
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup>
import { useRoute } from 'vue-router'

const props = defineProps({
  to:    { type: String, required: true },
  label: { type: String, required: true },
  icon:  { type: String, default: '' }
})

const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>
