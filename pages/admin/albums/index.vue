<template>
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-semibold">Albums</h1>
        <div class="flex gap-2">
          <input v-model="q" placeholder="Search albums…" class="border rounded px-3 py-2" />
          <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="createQuick">+ New Album</button>
        </div>
      </div>
  
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <NuxtLink
          v-for="a in albums.items"
          :key="a.id"
          :to="`/admin/albums/${a.id}?slug=${a.slug}`"
          class="border rounded overflow-hidden hover:shadow"
        >
          <div class="w-full h-40 bg-gray-100">
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
    </div>
  </template>
  
  <script setup>
    definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, watch } from 'vue'
  import { useAlbumService } from '@/composables/useAlbumService'
  import { useMediaService } from '@/composables/useMediaService'
  
  const { listAlbums, createAlbum } = useAlbumService()
  const { fullUrl } = useMediaService()
  const full = fullUrl
  
  const q = ref('')
  const page = ref(1)
  const albums = ref({ items: [], pages: 1 })
  
  async function fetchList(){ albums.value = await listAlbums({ q: q.value, page: page.value, pageSize: 24 }) }
  watch(q, () => { page.value = 1; fetchList() }, { flush: 'post' })
  
  async function createQuick(){
    const title = prompt('Album title')
    if (!title) return
    await createAlbum({ title })
    fetchList()
  }
  
  function prev(){ if (page.value>1){ page.value--; fetchList() } }
  function next(){ if (page.value<albums.value.pages){ page.value++; fetchList() } }
  
  fetchList()
  </script>
  