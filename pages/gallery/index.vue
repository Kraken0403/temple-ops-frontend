<template>
    <section>
      <PageHero :title="hero.title" :caption="hero.caption" :imageUrl="heroImage" />
  
      <section class="max-w-6xl mx-auto px-4 py-10">
        <h2 class="text-2xl font-semibold mb-4">Photo Albums</h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="a in albums.items"
            :key="a.id"
            :to="`/gallery/${a.slug}`"
            class="border rounded overflow-hidden hover:shadow"
          >
            <div class="w-full h-48 bg-gray-100">
              <img v-if="a.cover?.url" :src="full(a.cover.url)" class="w-full h-full object-cover" />
            </div>
            <div class="p-3">
              <div class="font-semibold truncate">{{ a.title }}</div>
              <div class="text-xs text-gray-500">{{ a._count?.items || 0 }} photos</div>
            </div>
          </NuxtLink>
        </div>
  
        <div class="mt-6 flex items-center gap-2">
          <button class="px-2 py-1 border rounded" :disabled="page<=1" @click="prev">Prev</button>
          <span class="text-sm text-gray-600">Page {{ page }} / {{ albums.pages || 1 }}</span>
          <button class="px-2 py-1 border rounded" :disabled="page>=albums.pages" @click="next">Next</button>
        </div>
      </section>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRuntimeConfig } from '#app'
  import { useAlbumService } from '@/composables/useAlbumService'
  import { useMediaService } from '@/composables/useMediaService'
  
  const config = useRuntimeConfig().public
  const api = config.apiBase
  const { listAlbums } = useAlbumService()
  const { fullUrl } = useMediaService()
  const full = fullUrl
  
  const hero = ref({ title: 'Gallery', caption: '', image: '' })
  const heroImage = ref('')
  
  const page = ref(1)
  const albums = ref({ items: [], pages: 1 })
  
  async function fetchHero() {
    const res = await fetch(`${api}/static-pages/gallery`)
    const pageData = await res.json()
    const c = pageData?.content || {}
    hero.value = { title: c?.hero?.title || 'Gallery', caption: c?.hero?.caption || '', image: c?.hero?.image || '' }
    heroImage.value = hero.value.image ? full(hero.value.image) : ''
  }
  async function fetchAlbums(){ albums.value = await listAlbums({ page: page.value, pageSize: 24 }) }
  function prev(){ if(page.value>1){ page.value--; fetchAlbums() } }
  function next(){ if(page.value<albums.value.pages){ page.value++; fetchAlbums() } }
  
  await fetchHero()
  await fetchAlbums()
  </script>
  