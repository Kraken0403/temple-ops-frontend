<template>
  <section class="py-[100px] bg-[#F8F9FA] w-full mx-auto" v-if="hasContent">
    <div class="mx-auto px-4 max-w-[1190px]">
      <!-- Heading + Intro -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-[80px]">
        <h2 class="text-[32px] font-bold text-[#570000]">
          {{ resolvedHeading }}
        </h2>
        <p class="text-[18px] text-[#797979]">
          {{ resolvedIntro }}
        </p>
      </div>

      <!-- Cards + Newsletter -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Render only first two regular cards -->
        <div
          v-for="(card, i) in resolvedCards.slice(0, 2)"
          :key="`card-${i}`"
          class="relative p-8 shadow rounded-[0px] transition hover:shadow-md cursor-pointer"
          :class="card.variant === 'light' ? 'bg-[#F4F1EC] text-[#111]' : 'text-white'"
          :style="card.variant === 'image' ? bgStyle(card.bgImage) : undefined"
        >
          <!-- overlay for image card -->
          <div
            v-if="card.variant === 'image'"
            class="absolute w-full h-full top-0 left-0 bg-[#570000] bg-opacity-[0.5] opacity-50"
            aria-hidden="true"
          ></div>

          <div
            class="flex justify-between flex-col gap-[10px] mb-[60px]"
            :class="card.variant === 'image' ? 'relative z-[1]' : ''"
          >
            <i class="material-icons text-[32px]"
               :class="card.variant === 'light' ? 'text-[#570000]' : ''">
              {{ card.icon }}
            </i>
            <h3
              class="text-[24px] font-semibold mb-4"
              :class="card.variant === 'light' ? 'text-[#570000]' : ''"
            >
              {{ card.title }}
            </h3>
          </div>

          <div class="flex justify-between items-end" :class="card.variant === 'image' ? 'relative z-[1]' : ''">
            <p class="text-sm max-w-[80%]">
              {{ card.description }}
            </p>
            <NuxtLink
              :to="card.link"
              class="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-90"
              :class="card.variant === 'light' ? 'bg-[#570000] text-white' : 'bg-white text-[#570000]'"
            >
              <i class="material-icons">arrow_forward</i>
            </NuxtLink>
          </div>
        </div>

        <!-- Newsletter card replaces the old "Contact Us" slot -->
        <NewsletterSubscribe />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRuntimeConfig } from '#app'
import NewsletterSubscribe from '@/components/NewsLetterSubscribe.vue'
import contactFallback from '@/assets/images/contact.png'

const props = defineProps({
  heading: { type: String, default: '' },
  intro: { type: String, default: '' },
  cards: {
    type: Array,
    default: () => []
  }
})

const config = useRuntimeConfig().public
const apiBase = config?.apiBase || ''

function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${apiBase}${path}`
}

/* ---------- Fallbacks ---------- */
const fallbackHeading = 'Join us in improving the overall experience'
const fallbackIntro =
  'We are a Hindu Temple located in Tampa, conceived as place of worship and cultural growth for our community; A place to educate our children'

// Kept only two regular cards; the third will be the subscribe widget
const fallbackCards = [
  {
    title: 'Donate',
    icon: 'attach_money',
    description:
      'Contribute to support our temple activities and community initiatives.',
    link: '/donations',
    variant: 'light',
    bgImage: ''
  },
  {
    title: 'Volunteer',
    icon: 'volunteer_activism',
    description:
      'Join our volunteer programs and help us serve the community better.',
    link: '/volunteer',
    variant: 'light',
    bgImage: ''
  }
]

/* ---------- Resolve CMS data ---------- */
const resolvedHeading = computed(() => props.heading?.trim() || fallbackHeading)
const resolvedIntro = computed(() => props.intro?.trim() || fallbackIntro)

const resolvedCards = computed(() => {
  const input = Array.isArray(props.cards) ? props.cards : []
  // We’ll map and then take first 2; subscribe will always be the 3rd block
  const cleaned = input
    .map((c) => {
      const variant = c?.variant === 'image' ? 'image' : 'light'
      const bgImage = variant === 'image' ? (fullUrl(c?.bgImage) || contactFallback) : ''
      return {
        title: (c?.title || '').trim() || '',
        icon: (c?.icon || '').trim() || 'chevron_right',
        description: (c?.description || '').trim() || '',
        link: (c?.link || '').trim() || '#',
        variant,
        bgImage
      }
    })
    .filter((c) => c.title && c.description && c.link)

  // If CMS empty/invalid, fallback to 2 cards
  return cleaned.length ? cleaned : fallbackCards
})

const hasContent = computed(() => resolvedCards.value.length > 0)

function bgStyle(url) {
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
}
</script>

<style scoped>
.material-icons {
  font-size: 32px;
}
</style>
