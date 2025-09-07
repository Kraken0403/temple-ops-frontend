<!-- pages/index.vue -->
<template>
  <div class="w-full">
    <!-- Pass CMS slides (fallback handled inside component) -->
    <HeroSlider :slides="home?.heroSlider?.slides || []" />

    <!-- Marquee already wired -->
    <Marquee
      :items="home?.marquee?.items || defaultMarquee.items"
      :bgColor="home?.marquee?.bgColor ?? defaultMarquee.bgColor"
      :speed="home?.marquee?.speed ?? defaultMarquee.speed"
    />


    <UpcomingEvents />
    <BookPoojas />

    <!-- If you later want About/Experience to be CMS-driven, expose props there too -->
    <AboutHome
      :title="home?.about?.title"
      :description="home?.about?.description"
      :image="home?.about?.image"
      :stats="home?.about?.stats"
      :links="home?.about?.links"
    />
    <Experience
      :heading="home?.experience?.heading"
      :intro="home?.experience?.intro"
      :cards="home?.experience?.cards"
    />

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStaticPages } from '~/composables/useStaticPages'

import HeroSlider from '@/components/HeroSlider.vue'
import Marquee from '@/components/Marquee.vue'
import BookPoojas from '@/components/BookPoojas.vue'
import AboutHome from '@/components/AboutHome.vue'
import Experience from '@/components/Experience.vue'
import UpcomingEvents from '@/components/UpcomingEvents.vue'

const defaultMarquee = {
  items: [
    'Lorem Ipsum Dolor sit amet',
    'Consectetur adipiscing elit',
    'Sed do eiusmod tempor',
    'Incididunt ut labore et dolore'
  ],
  bgColor: '#660000',
  speed: 20
}

const { fetchPage } = useStaticPages()
const { data: pageRow, error } = await useAsyncData('home-page', () => fetchPage('home'))
const home = computed(() => pageRow.value?.content || null)

if (error.value) {
  // Optional: surface error, or log only
  // console.error('Failed to load home page', error.value)
}
</script>
