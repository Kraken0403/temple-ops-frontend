<template>
  <!-- Hide if there are no items to show -->
  <div v-if="resolvedItems.length" class="w-full overflow-hidden" :style="{ backgroundColor: resolvedBg }">
    <div
      class="flex whitespace-nowrap animate-marquee"
      :style="{ animationDuration: resolvedSpeed + 's' }"
    >
      <span
        v-for="(item, i) in resolvedItems"
        :key="i"
        class="text-white mx-8 text-lg flex-shrink-0"
      >
        {{ item }}
      </span>

      <!-- duplicate items for seamless loop -->
      <span
        v-for="(item, i) in resolvedItems"
        :key="'dup-' + i"
        class="text-white mx-8 text-lg flex-shrink-0"
        aria-hidden="true"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Array of strings to scroll */
  items: {
    type: Array,
    default: () => [
      'Lorem Ipsum Dolor sit amet',
      'Consectetur adipiscing elit',
      'Sed do eiusmod tempor',
      'Incididunt ut labore et dolore'
    ]
  },
  /** Background color of the bar */
  bgColor: {
    type: [String, null],
    default: '#660000'
  },
  /** Seconds to complete one loop */
  speed: {
    type: [Number, String],
    default: 15
  }
})

const defaultItems = [
  'Lorem Ipsum Dolor sit amet',
  'Consectetur adipiscing elit',
  'Sed do eiusmod tempor',
  'Incididunt ut labore et dolore'
]

const resolvedItems = computed(() => {
  const raw = Array.isArray(props.items) ? props.items : []
  const cleaned = raw
    .map(v => (typeof v === 'string' ? v : String(v ?? '')))
    .map(s => s.trim())
    .filter(Boolean)
  return cleaned.length ? cleaned : defaultItems
})

const resolvedBg = computed(() => props.bgColor || '#660000')

const resolvedSpeed = computed(() => {
  const n = Number(props.speed)
  return Number.isFinite(n) && n > 0 ? n : 15
})
</script>

<style scoped>
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.animate-marquee {
  display: inline-flex;
  animation-name: marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* Respect users that prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-marquee {
    animation: none !important;
    transform: translateX(0) !important;
  }
}
</style>
