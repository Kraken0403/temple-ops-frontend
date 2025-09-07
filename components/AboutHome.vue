<template>
  <!-- Hide whole section if we don't even have a title/description/image -->
  <section
    v-if="hasContent"
    class="relative py-[100px] bg-[#F5f5f5] overflow-hidden w-full mx-auto"
  >
    <div
      class="relative z-10 mx-auto px-4 overflow-hidden max-w-[1190px] flex flex-col lg:flex-row items-start gap-12"
    >
      <!-- Left: Image -->
      <div class="w-full lg:w-1/2">
        <img
          :src="resolvedImage"
          :alt="resolvedTitle"
          class="w-full h-full object-cover shadow-lg"
        />
      </div>

      <!-- Right: Text + Stats + Buttons -->
      <div class="w-full lg:w-1/2">
        <h2 class="text-[32px] font-bold mb-4">
          {{ resolvedTitle }}
        </h2>

        <p class="text-base mb-[100px]">
          {{ resolvedDescription }}
        </p>

        <div class="grid grid-cols-3 gap-8 mb-[30px]">
          <div class="text-left">
            <div class="text-[40px] font-bold text-[#570000]">
              {{ resolvedStats.years }}
            </div>
            <div class="text-base">Years</div>
          </div>
          <div class="text-left">
            <div class="text-[40px] font-bold text-[#570000]">
              {{ resolvedStats.devotees }}
            </div>
            <div class="text-base">Devotees</div>
          </div>
          <div class="text-left">
            <div class="text-[40px] font-bold text-[#570000]">
              {{ resolvedStats.priests }}
            </div>
            <div class="text-base">Priests</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <NuxtLink
            :to="resolvedLinks.about"
            class="
              bg-[#570000]
              text-white
              px-[40px] py-[12px]
              rounded-[30px]
              text-[16px]
              border-[1px]
              border-[#570000]
              transition-colors duration-200
              hover:bg-transparent hover:text-[#570000]
            "
          >
            Know More
          </NuxtLink>

          <NuxtLink
            :to="resolvedLinks.gallery"
            class="
              border-1 border-[#570000]
              text-[#570000]
              px-[40px] py-[12px]
              rounded-[30px]
              text-[16px]
              transition-colors duration-200
              hover:bg-[#570000] hover:text-white
            "
          >
            Gallery
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRuntimeConfig } from '#app'
import aboutFallback from '@/assets/images/about-temple.png'

// Props mirror the CMS shape saved by HomeEditor
const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' }, // '/uploads/...' or absolute
  stats: {
    type: Object,
    default: () => ({ years: 27, devotees: '1.2m', priests: 14 })
  },
  links: {
    type: Object,
    default: () => ({ about: '/about', gallery: '/gallery' })
  }
})

const config = useRuntimeConfig().public
const apiBase = config?.apiBase || ''

function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${apiBase}${path}`
}

// Fallback content (matches your current static design)
const fallback = {
  title: 'About Sanatan Mandir, Tampa',
  description:
    'We are a Hindu Temple located in Tampa, conceived as a place of worship and cultural growth for our community—a place to educate our children about our religious and cultural values, providing a safe haven for different activities in an effort to acquaint the community at large with our Sanatana Dharma culture, creating a better understanding between a multi-ethnic community.',
  image: aboutFallback,
  stats: { years: 27, devotees: '1.2m', priests: 14 },
  links: { about: '/about', gallery: '/gallery' }
}

// Resolve with safe fallbacks
const resolvedTitle = computed(() => props.title?.trim() || fallback.title)
const resolvedDescription = computed(() => props.description?.trim() || fallback.description)
const resolvedImage = computed(() => fullUrl(props.image) || fallback.image)

const resolvedStats = computed(() => {
  const s = props.stats || {}
  const years = Number.isFinite(Number(s.years)) ? Number(s.years) : fallback.stats.years
  const priests = Number.isFinite(Number(s.priests)) ? Number(s.priests) : fallback.stats.priests
  const devotees =
    (typeof s.devotees === 'string' && s.devotees.trim()) || fallback.stats.devotees
  return { years, devotees, priests }
})

const resolvedLinks = computed(() => {
  const l = props.links || {}
  return {
    about: (typeof l.about === 'string' && l.about.trim()) ? l.about : fallback.links.about,
    gallery: (typeof l.gallery === 'string' && l.gallery.trim()) ? l.gallery : fallback.links.gallery
  }
})

const hasContent = computed(() => Boolean(resolvedTitle.value && resolvedDescription.value && resolvedImage.value))
</script>

<style scoped>
/* All styling via Tailwind utility classes in template */
</style>
