<!-- pages/about.vue -->
<template>
  <section class="w-full mx-auto">
    <!-- Page Hero -->
    <PageHero
      :title="heroTitle"
      :caption="heroCaption"
      :imageUrl="heroImage"
    />

    <!-- Intro Paragraph -->
    <section class="w-[992px] mx-auto px-4 py-[100px] space-y-4">
      <p class="text-center text-[26px] mb-[30px] text-[#570000] font-bold">
        {{ introHeadline }}
      </p>

      <p class="text-center text-[18px] mb-[30px] whitespace-pre-line">
        {{ introVerse }}
      </p>

      <p class="whitespace-pre-line text-center text-[18px]">
        {{ introTranslation }}
      </p>
    </section>

    <!-- Wide Banner Image -->
    <section class="bg-white" v-if="bannerImage">
      <div class="w-full mx-auto h-[400px]">
        <img class="w-full h-full object-cover rounded-[8px]" :src="bannerImage" alt="About banner">
      </div>
    </section>

    <!-- Our Vision -->
    <section class="bg-white my-[100px]" v-if="visionBody || visionImage">
      <div class="w-[1190px] mx-auto flex flex-col md:flex-row items-stretch gap-8">
        <!-- Image (left) -->
        <div class="md:w-1/2 flex" v-if="visionImage">
          <img
            :src="visionImage"
            alt="Our Vision"
            class="w-full h-full object-cover rounded-lg shadow"
          />
        </div>
        <!-- Text (right) -->
        <div class="md:w-1/2 space-y-4">
          <h2 class="text-[32px] text-[#570000] font-bold">{{ visionTitle }}</h2>
          <p class="text-[18px] text-[#797979] whitespace-pre-line">
            {{ visionBody }}
          </p>
        </div>
      </div>
    </section>

    <!-- Our Mission -->
    <section class="bg-white my-[100px]" v-if="missionBody || missionImage">
      <div class="w-[1190px] mx-auto flex flex-col md:flex-row-reverse items-stretch gap-8">
        <!-- Image (right) -->
        <div class="md:w-1/2 flex" v-if="missionImage">
          <img
            :src="missionImage"
            alt="Our Mission"
            class="w-full h-full object-cover rounded-lg shadow"
          />
        </div>
        <!-- Text (left) -->
        <div class="md:w-1/2 space-y-4">
          <h2 class="text-[32px] text-[#570000] font-bold">{{ missionTitle }}</h2>
          <div class="text-[18px] text-[#797979] space-y-4">
            <p class="whitespace-pre-line">
              {{ missionBody }}
            </p>
            <ul class="list-disc list-inside mt-2 space-y-1" v-if="missionBullets.length">
              <li v-for="(b, i) in missionBullets" :key="i">{{ b }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- You can keep Experience here (it has internal fallbacks),
         or pass CMS-driven props if you later add them to the About CMS -->
    <!-- <Experience /> -->
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { useStaticPages } from '~/composables/useStaticPages'

import PageHero from '@/components/PageHero.vue'
import Experience from '@/components/Experience.vue'

/* Local fallback assets (used when CMS is empty) */
import heroBgFallback    from '@/assets/images/sample-2.png'
import visionImgFallback from '@/assets/images/sample.png'
import missionImgFallback from '@/assets/images/sample.png'

/* Fetch CMS: the row is { slug, content } and we want content */
const { fetchPage } = useStaticPages()
const { data: pageRow, error } = await useAsyncData('about-page', () => fetchPage('about'))
const content = computed(() => pageRow.value?.content || {})

const config = useRuntimeConfig().public
const apiBase = config?.apiBase || ''
const fullUrl = (p) => (p ? (String(p).startsWith('http') ? p : `${apiBase}${p}`) : '')

/* ------- Hero ------- */
const heroTitle   = computed(() => content.value?.hero?.title?.trim() || 'About Us')
const heroCaption = computed(() => content.value?.hero?.caption?.trim() || '')
const heroImage   = computed(() => fullUrl(content.value?.hero?.image) || heroBgFallback)

/* ------- Intro ------- */
const introHeadline    = computed(() =>
  content.value?.intro?.headline?.trim()
  || 'Namaste Devotees, Sanatan Mandir Tampa welcomes you to our community.'
)
const introVerse       = computed(() =>
  content.value?.intro?.verse?.trim()
  || 'Om sarve bhavantu sukhinaha\nSarve santu niraamayaah\nSarve bhadraani pashyantu\nMaa kaschit dukkha bhaag bhavet\nOm shaanti shaanti shaanti'
)
const introTranslation = computed(() =>
  content.value?.intro?.translation?.trim()
  || 'May all be happy.\nMay all be free from disabilities.\nMay all see the good of others.\nMay none be in misery.\nOm, peace, peace, peace!'
)

/* ------- Banner ------- */
const bannerImage = computed(() => fullUrl(content.value?.banner?.image) || '')

/* ------- Vision ------- */
const visionTitle = computed(() => content.value?.vision?.title?.trim() || 'Our Vision')
const visionBody  = computed(() =>
  content.value?.vision?.body?.trim()
  || 'We are a Hindu Temple located in Tampa, conceived as place of worship and cultural growth for our community; \n\nA place to educate our children about our religious and cultural values, providing a safe haven for different activities in an effort to acquaint the community at large with our Sanatana Dharma culture. \n\nCreating a better understanding between a multi-ethnic community.'
)
const visionImage = computed(() => fullUrl(content.value?.vision?.image) || visionImgFallback)

/* ------- Mission ------- */
const missionTitle = computed(() => content.value?.mission?.title?.trim() || 'Our Mission')
const missionBody  = computed(() =>
  content.value?.mission?.body?.trim()
  || 'The idea of establishing a place of worship was conceived in 1989 and Hindu Samaj Inc, a non-profit religious organization, was established to pursue this idea. The main objectives and goals of Hindu Samaj Inc., are:'
)
const missionBullets = computed(() => {
  const arr = Array.isArray(content.value?.mission?.bullets) ? content.value.mission.bullets : []
  return arr.map(s => (s || '').trim()).filter(Boolean)
})
const missionImage = computed(() => fullUrl(content.value?.mission?.image) || missionImgFallback)

/* Optional: surface load errors in dev */
if (error.value) {
  // console.error('Failed to load about page', error.value)
}
</script>

<style scoped>
/* nothing additional */
</style>
