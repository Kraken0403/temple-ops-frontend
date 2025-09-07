<template>
  <section
    class="relative bg-cover bg-center bg-no-repeat w-full h-[450px] flex items-center justify-center"
    :style="bgStyle"
  >
    <!-- img fallback (helps when backgroundImage fails) -->
    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
      style="opacity:0; /* keep invisible; just for debugging/fallback */"
    />

    <!-- dark overlay -->
    <div class="absolute inset-0 bg-black/70"></div>

    <!-- content -->
    <div class="relative z-10 text-center px-4 max-w-[800px]">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-3">{{ title }}</h1>
      <p v-if="caption" class="text-lg md:text-xl text-white/90">{{ caption }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  imageUrl: { type: String, required: true }
})

// Quote the URL to avoid issues with special chars/parentheses/spaces
const bgStyle = computed(() => ({
  backgroundImage: props.imageUrl ? `url("${props.imageUrl}")` : 'none'
}))
</script>

<style scoped>
/* nothing extra */
</style>
