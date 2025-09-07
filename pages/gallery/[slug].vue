<template>
    <section>
      <PageHero :title="album?.title || 'Album'" :caption="album?.description || ''" :imageUrl="coverUrl" />
  
      <div class="max-w-6xl mx-auto px-4 py-10">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button v-for="it in album?.items || []" :key="it.id" @click="open(it.media.url)" class="group relative">
            <img :src="full(it.media.url)" class="w-full h-48 object-cover rounded border" />
          </button>
        </div>
      </div>
  
      <div v-if="lightboxOpen" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" @click.self="close">
        <img :src="full(lightboxUrl)" class="max-w-[90vw] max-h-[85vh] object-contain rounded" />
        <button class="absolute top-6 right-6 text-white text-2xl" @click="close">×</button>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAlbumService } from '@/composables/useAlbumService'
  import { useMediaService } from '@/composables/useMediaService'
  
  const route = useRoute()
  const slug = String(route.params.slug)
  const { getAlbumBySlug } = useAlbumService()
  const { fullUrl } = useMediaService()
  const full = fullUrl
  
  const album = ref(await getAlbumBySlug(slug))
  const coverUrl = computed(() => album.value?.cover?.url ? full(album.value.cover.url) : '')
  
  const lightboxOpen = ref(false)
  const lightboxUrl = ref('')
  function open(url){ lightboxUrl.value = url; lightboxOpen.value = true }
  function close(){ lightboxOpen.value = false }
  </script>
  