<!-- components/HeroSlider.vue -->
<template>
  <div class="relative w-full h-[80vh] overflow-hidden">
    <client-only>
      <Swiper
        :modules="[Autoplay, Navigation, Pagination, Scrollbar]"
        loop
        :autoplay="{ delay: 7000, disableOnInteraction: false }"
        navigation
        pagination
        scrollbar
        class="w-full h-full"
      >
        <SwiperSlide
          v-for="slide in resolvedSlides"
          :key="slide.id ?? slide.title"
          class="relative w-full h-full"
        >
          <img
            :src="slide.image"
            :alt="slide.title || 'slide'"
            loading="lazy"
            class="w-full h-full object-cover absolute inset-0"
          />
          <div class="absolute inset-0 bg-black bg-opacity-50 opacity-50"></div>
          <div class="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ slide.title }}</h1>
            <p class="text-lg md:text-xl mb-6">{{ slide.caption }}</p>
            <NuxtLink
              v-if="slide.buttonText && slide.buttonLink"
              :to="slide.buttonLink"
              class="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition"
            >
              {{ slide.buttonText }}
            </NuxtLink>
          </div>
        </SwiperSlide>
      </Swiper>
    </client-only>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination, Scrollbar } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import sample from '@/assets/images/sample.png'

const props = defineProps({
  // Expect the exact structure saved from HomeEditor:
  // [{ id, title, caption, image, buttonText, buttonLink }]
  slides: {
    type: Array,
    default: () => []
  }
})

// Local default if CMS empty
const defaultSlides = [
  { id: 1, title: 'Welcome to Sanatan Temple', caption: 'Peace & devotion',        image: sample, buttonText: 'Book Pooja',       buttonLink: '/about' },
  { id: 2, title: 'Spiritual',                  caption: 'Daily rituals',           image: sample, buttonText: 'Explore Services', buttonLink: '/services' },
  { id: 3, title: 'Join Events',                caption: 'Be part…',                image: sample, buttonText: 'View Events',      buttonLink: '/events' },
  { id: 4, title: 'Give Back',                  caption: 'Support our mission',     image: sample, buttonText: 'Donate Now',       buttonLink: '/donations' },
]

const config = useRuntimeConfig().public
const apiBase = config?.apiBase || ''

function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${apiBase}${path}`
}

// Use CMS slides if provided; otherwise fallback
const sourceSlides = computed(() => (props.slides?.length ? props.slides : defaultSlides))

// Ensure images from CMS (/uploads/...) become absolute URLs
const resolvedSlides = computed(() =>
  sourceSlides.value.map(s => ({
    ...s,
    image: typeof s.image === 'string' ? fullUrl(s.image) : s.image
  }))
)
</script>

<style>
.swiper { width: 100%; height: 100%; }
.swiper-button-next, .swiper-button-prev { color: white; }
</style>
