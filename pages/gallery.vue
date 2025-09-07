<template>
  <section class="w-full mx-auto">
    <!-- Hero (CMS) -->
    <PageHero :title="heroTitle" :caption="heroCaption" :imageUrl="heroBg" />

    <!-- Albums Section (new) -->
    <section class="bg-white py-16 max-w-[1190px] mx-auto">
      <h2 class="text-[32px] font-bold text-center mb-[50px]">Photo Albums</h2>

      <!-- Albums Grid -->
      <div v-if="albums.items?.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="a in albums.items"
          :key="a.id"
          :to="`/gallery/${a.slug}`"
          class="border rounded overflow-hidden hover:shadow cursor-pointer"
        >
          <div class="w-full h-60 bg-gray-100">
            <img v-if="a.cover?.url" :src="full(a.cover.url)" class="w-full h-full object-cover" />
          </div>
          <div class="p-3">
            <div class="font-semibold truncate">{{ a.title }}</div>
            <div class="text-xs text-gray-500">{{ a._count?.items || 0 }} photos</div>
          </div>
        </NuxtLink>
      </div>

      <!-- Legacy Fallback: if no albums yet, show old images array -->
      <div v-else>
        <h3 class="text-lg font-semibold text-center text-gray-600 mb-6">All Photos</h3>
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
      </div>

      <!-- Simple pagination (albums) -->
      <div v-if="albums.items?.length && albums.pages > 1" class="mt-8 flex items-center justify-center gap-3">
        <button class="px-3 py-1 border rounded" :disabled="page<=1" @click="prev">Prev</button>
        <span class="text-sm text-gray-600">Page {{ page }} / {{ albums.pages }}</span>
        <button class="px-3 py-1 border rounded" :disabled="page>=albums.pages" @click="next">Next</button>
      </div>
    </section>

    <!-- Lightbox Modal (used only for legacy images fallback) -->
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
import { useAlbumService } from '@/composables/useAlbumService'
import { useMediaService } from '@/composables/useMediaService'

import PageHero from '@/components/PageHero.vue'
import heroBgFallback from '@/assets/images/sample-2.webp'

/* ---------- CMS page (hero stays the same) ---------- */
const { fetchPage } = useStaticPages()
const { data: pageRow } = await useAsyncData('gallery-page', () => fetchPage('gallery'))
const content = computed(() => pageRow.value?.content || {})

const { public: pub } = useRuntimeConfig()
const apiBase = pub?.apiBase || ''

const { listAlbums } = useAlbumService()
const { fullUrl } = useMediaService()
const full = fullUrl

const heroTitle   = computed(() => content.value?.hero?.title?.trim() || 'Gallery')
const heroCaption = computed(() => content.value?.hero?.caption?.trim() || '')
const heroBg      = computed(() => {
  const p = content.value?.hero?.image
  return p ? (String(p).startsWith('http') ? p : `${apiBase}${p}`) : heroBgFallback
})

/* ---------- Albums (new system) ---------- */
const page = ref(1)
const albums = ref({ items: [], pages: 1 })

async function fetchAlbums() {
  albums.value = await listAlbums({ page: page.value, pageSize: 24 })
}
function prev(){ if (page.value>1){ page.value--; fetchAlbums() } }
function next(){ if (page.value<albums.value.pages){ page.value++; fetchAlbums() } }
await fetchAlbums()

/* ---------- Legacy fallback images (old system) ---------- */
const images = computed(() =>
  (Array.isArray(content.value?.images) ? content.value.images : []).map((p) =>
    p?.startsWith?.('http') ? p : `${apiBase}${p || ''}`
  )
)

/* ---------- Lightbox (legacy only) ---------- */
const showLightbox = ref(false)
const currentIndex = ref(0)
function openLightbox(idx){ currentIndex.value = idx; showLightbox.value = true }
function closeLightbox(){ showLightbox.value = false }
function prevImg(){ const n = images.value.length; if (!n) return; currentIndex.value = (currentIndex.value + n - 1) % n }
function nextImg(){ const n = images.value.length; if (!n) return; currentIndex.value = (currentIndex.value + 1) % n }
</script>
