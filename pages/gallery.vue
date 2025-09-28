<template>
  <section class="w-full mx-auto">
    <!-- Hero -->
    <PageHero :title="heroTitle" :caption="heroCaption" :imageUrl="heroBg" />

    <!-- Gallery Grid -->
    <section class="bg-white py-16 max-w-[1190px] mx-auto">
      <!-- <h2 class="text-[32px] font-bold text-center mb-[50px]">Gallery</h2> -->

      <div v-if="images.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(src, i) in images"
          :key="i"
          class="cursor-pointer overflow-hidden rounded-[8px]"
          @click="openLightbox(i)"
        >
          <img
            :src="src"
            alt="Gallery image"
            class="w-full h-60 object-cover transform hover:scale-105 transition"
          />
        </div>
      </div>
      <p v-else class="text-center text-gray-500">No photos yet.</p>
    </section>

    <!-- Lightbox Modal -->
    <div
      v-if="showLightbox"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <button @click="closeLightbox" class="absolute top-4 right-4 text-white text-3xl">&times;</button>
      <button @click="prevImg" class="absolute left-4 text-white text-4xl" aria-label="Previous">&lsaquo;</button>
      <img :src="images[currentIndex]" alt="Enlarged gallery image" class="max-w-full max-h-full rounded" />
      <button @click="nextImg" class="absolute right-4 text-white text-4xl" aria-label="Next">&rsaquo;</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { useStaticPages } from '~/composables/useStaticPages'

import PageHero from '@/components/PageHero.vue'
import heroBgFallback from '@/assets/images/sample-2.webp'

/* ---------- CMS page ---------- */
const { fetchPage } = useStaticPages()
const { data: pageRow } = await useAsyncData('gallery-page', () => fetchPage('gallery'))
const content = computed(() => pageRow.value?.content || {})

const { public: pub } = useRuntimeConfig()
const apiBase = pub?.apiBase || ''

const heroTitle   = computed(() => content.value?.hero?.title?.trim() || 'Gallery')
const heroCaption = computed(() => content.value?.hero?.caption?.trim() || '')
const heroBg      = computed(() => {
  const p = content.value?.hero?.image
  return p ? (String(p).startsWith('http') ? p : `${apiBase}${p}`) : heroBgFallback
})

/* ---------- Images from CMS ---------- */
const images = computed(() =>
  (Array.isArray(content.value?.images) ? content.value.images : []).map((p) =>
    p?.startsWith?.('http') ? p : `${apiBase}${p || ''}`
  )
)

/* ---------- Lightbox ---------- */
const showLightbox = ref(false)
const currentIndex = ref(0)

function openLightbox(idx){ currentIndex.value = idx; showLightbox.value = true }
function closeLightbox(){ showLightbox.value = false }
function prevImg(){ const n = images.value.length; if (!n) return; currentIndex.value = (currentIndex.value + n - 1) % n }
function nextImg(){ const n = images.value.length; if (!n) return; currentIndex.value = (currentIndex.value + 1) % n }
</script>
