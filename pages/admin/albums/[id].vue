<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Edit Album</h1>
      <NuxtLink to="/admin/albums" class="text-blue-700 text-sm">Back</NuxtLink>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Left -->
      <div class="md:col-span-1 space-y-4">
        <div class="bg-white border rounded p-4 space-y-3">
          <label class="text-sm font-medium">Title</label>
          <input v-model.trim="form.title" class="border rounded px-3 py-2 w-full" />
          <label class="text-sm font-medium">Slug</label>
          <input v-model.trim="form.slug" class="border rounded px-3 py-2 w-full" />
          <label class="text-sm font-medium">Description</label>
          <textarea v-model.trim="form.description" class="border rounded px-3 py-2 w-full" rows="3"></textarea>
          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.isPublic" /> Public
          </label>
        </div>

        <div class="bg-white border rounded p-4 space-y-3">
          <label class="text-sm font-medium">Cover Image</label>
          <div class="w-full h-40 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            <img v-if="coverPreview" :src="coverPreview" class="object-cover w-full h-full" />
            <span v-else class="text-gray-400 text-sm">No cover</span>
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="chooseCover">Choose…</button>
            <button class="px-3 py-2 border rounded" @click="unsetCover" :disabled="!form.coverId">Remove</button>
          </div>
          <p v-if="!hasGlobalPicker" class="text-xs text-amber-600">
            Using local picker fallback (global picker not mounted).
          </p>
        </div>

        <div class="flex gap-2">
          <button class="px-4 py-2 bg-green-600 text-white rounded" @click="save">Save</button>
          <button class="px-4 py-2 border rounded text-red-600" @click="doDelete">Delete</button>
        </div>
      </div>

      <!-- Right -->
      <div class="md:col-span-2 bg-white border rounded p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold">Photos</h2>
          <button class="px-3 py-2 border rounded" @click="chooseFromLibrary">Add from Library</button>
        </div>

        <draggable v-model="items" item-key="id" handle=".handle" class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <template #item="{ element }">
            <div class="border rounded overflow-hidden group relative">
              <div class="absolute top-2 left-2 text-xs bg-white/80 px-2 py-1 rounded handle cursor-move">⇳</div>
              <img :src="full(element.media.url)" class="w-full h-40 object-cover" />
              <div class="p-2 flex items-center justify-between text-sm">
                <span class="text-gray-500 truncate">#{{ element.id }}</span>
                <button class="text-red-600" @click="removeItem(element.id)">Remove</button>
              </div>
            </div>
          </template>
        </draggable>

        <div v-if="!items.length" class="text-gray-500 text-center py-12">No photos yet.</div>

        <div class="mt-4">
          <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="saveOrder" :disabled="!items.length">Save Order</button>
        </div>
      </div>
    </div>

    <!-- Local fallback modal (only shown if global picker is not mounted) -->
    <MediaModal
      v-if="!hasGlobalPicker"
      :open="localOpen"
      :multiple="localMultiple"
      :accept="localAccept"
      @close="cancelLocal"
      @apply="applyLocal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useRoute, useRouter } from 'vue-router'
import { useAlbumService } from '@/composables/useAlbumService'
import { useMediaService } from '@/composables/useMediaService'
import MediaModal from '@/components/media/MediaModal.vue' // used for local fallback

const { getAlbumBySlug, updateAlbum, deleteAlbum, addItems, reorderItems, removeItem: removeItemApi } = useAlbumService()
const { fullUrl } = useMediaService()
const full = fullUrl

// Global picker (if plugin is mounted)
const nuxt = useNuxtApp()
const $media = nuxt?.$media

// Detect if global picker is available
const hasGlobalPicker = computed(() => !!($media && typeof $media.pick === 'function'))

// Local fallback state
const localOpen = ref(false)
const localMultiple = ref(false)
const localAccept = ref('image/*')
let localResolve = null
let localReject = null

// One function that always returns a Promise: tries global, else uses local modal.
function openPicker(opts = { multiple: false, accept: 'image/*' }) {
  if (hasGlobalPicker.value) {
    return $media.pick(opts)
  }
  // fallback: open local modal
  localMultiple.value = !!opts?.multiple
  localAccept.value = opts?.accept || 'image/*'
  localOpen.value = true
  return new Promise((resolve, reject) => {
    localResolve = resolve
    localReject = reject
  })
}
function cancelLocal() {
  localOpen.value = false
  localReject?.(new Error('cancelled'))
  localResolve = null
  localReject = null
}
function applyLocal(selection) {
  localOpen.value = false
  localResolve?.(selection)
  localResolve = null
  localReject = null
}

const route = useRoute()
const router = useRouter()
// Accept either ?slug=... or /admin/albums/:id style
const slug = String(route.query.slug || route.params?.id || '')

const album = ref(null)
const form  = ref({ title: '', slug: '', description: '', isPublic: true, coverId: null })
const items = ref([])

const pickedCover = ref(null)
const coverPreview = computed(() => {
  if (pickedCover.value?.url) return full(pickedCover.value.url)
  if (album.value?.cover?.url) return full(album.value.cover.url)
  return ''
})

async function load() {
  if (!slug) { alert('Missing album slug'); return router.push('/admin/albums') }
  const data = await getAlbumBySlug(slug)
  album.value = data
  form.value = {
    title: data.title,
    slug: data.slug,
    description: data.description || '',
    isPublic: !!data.isPublic,
    coverId: data.cover?.id ?? null,
  }
  items.value = [...data.items]
}
onMounted(load)

/** Choose cover via picker (global or local) */
async function chooseCover() {
  try {
    const asset = await openPicker({ multiple: false, accept: 'image/*' })
    if (asset) {
      pickedCover.value = asset
      form.value.coverId = asset.id
    }
  } catch (_) {}
}

/** Add photos via picker (global or local) */
async function chooseFromLibrary() {
  try {
    const assets = await openPicker({ multiple: true, accept: 'image/*' })
    if (Array.isArray(assets) && assets.length) {
      const updated = await addItems(album.value.id, assets.map(a => a.id))
      album.value = updated
      items.value = [...updated.items]
    } else if (assets && assets.id) {
      // in case a single asset was returned
      const updated = await addItems(album.value.id, [assets.id])
      album.value = updated
      items.value = [...updated.items]
    }
  } catch (_) {}
}

async function save() {
  const payload = {
    title: form.value.title,
    slug: form.value.slug || undefined,
    description: form.value.description || undefined,
    isPublic: form.value.isPublic,
    coverId: form.value.coverId ?? undefined,
  }
  const updated = await updateAlbum(album.value.id, payload)
  album.value = updated
}

function unsetCover(){ form.value.coverId = null; pickedCover.value = null }

async function saveOrder() {
  const order = items.value.map((it, idx) => ({ itemId: it.id, sortOrder: idx }))
  await reorderItems(album.value.id, order)
}

async function removeItem(itemId) {
  await removeItemApi(album.value.id, itemId)
  await load()
}

async function doDelete() {
  if (!confirm('Delete this album?')) return
  await deleteAlbum(album.value.id)
  router.push('/admin/albums')
}
</script>
