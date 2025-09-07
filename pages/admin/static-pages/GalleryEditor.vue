<template>
    <section class="max-w-full mx-auto">
      <!-- Header -->
      <!-- <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h2 class="text-2xl font-bold text-gray-800">Edit Gallery Page</h2>
  
        <div class="flex items-center gap-3">
          <span
            v-if="hasErrors"
            class="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200"
          >
            Please fix the highlighted fields
          </span>
          <button
            @click="save"
            :disabled="saving || !isValid || !form"
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div> -->
  
      <div v-if="!form" class="text-gray-500">Loading editor…</div>
  
      <div v-else class="space-y-8">
        <!-- ========== PAGE HERO ========== -->
        <div class="bg-white shadow     overflow-hidden" ref="heroRef">
          <div class="px-5 py-4 border-b bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-700">Page Hero</h3>
            <p class="text-sm text-gray-500">Shown on top via <code>PageHero</code>.</p>
          </div>
  
          <div class="p-5 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  v-model.trim="form.hero.title"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="Gallery"
                />
                <p v-if="errors['hero.title']" class="text-xs text-red-600 mt-1">{{ errors['hero.title'] }}</p>
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input
                  v-model.trim="form.hero.caption"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="Short caption for the gallery page"
                />
                <p v-if="errors['hero.caption']" class="text-xs text-red-600 mt-1">{{ errors['hero.caption'] }}</p>
              </div>
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
              <div class="flex items-end space-x-4">
                <div class="w-48 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                  <span v-if="!previews.heroImage" class="text-gray-400">No image</span>
                  <img v-else :src="previews.heroImage" class="object-cover w-full h-full" />
                </div>
                <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                  Browse…
                  <input type="file" accept="image/*" @change="handleHeroUpload" class="hidden" />
                </label>
              </div>
              <p v-if="errors['hero.image']" class="text-xs text-red-600 mt-1">{{ errors['hero.image'] }}</p>
              <p v-else-if="form.hero.image" class="text-xs text-gray-500 mt-1">Saved Path: {{ form.hero.image }}</p>
            </div>
          </div>
        </div>
  
        <!-- ========== IMAGES ========== -->
        <div class="bg-white shadow     overflow-hidden" ref="imagesRef">
          <div class="px-5 py-4 border-b bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-700">Gallery Images</h3>
            <p class="text-sm text-gray-500">Upload, reorder, and remove images shown in the gallery grid.</p>
          </div>
  
          <div class="p-5 space-y-5">
            <!-- Upload controls -->
            <div class="flex flex-wrap items-center gap-3">
              <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                Add Images…
                <input type="file" accept="image/*" multiple @change="handleAddImages" class="hidden" />
              </label>
              <button
                type="button"
                class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
                @click="clearAllImages"
                :disabled="!form.images.length"
                title="Remove all images"
              >
                Clear All
              </button>
            </div>
            <p v-if="errors['images']" class="text-xs text-red-600">{{ errors['images'] }}</p>
  
            <!-- Grid -->
            <div v-if="form.images.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="(img, i) in form.images"
                :key="i"
                class="border     overflow-hidden bg-white"
              >
                <div class="w-full h-48 bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
                  <img :src="previews.images[i]" alt="Gallery" class="w-full h-full object-cover" />
                </div>
  
                <div class="p-3 flex items-center justify-between gap-2 text-sm">
                  <div class="text-gray-500 truncate" :title="img">…{{ img.split('/').pop() }}</div>
                  <div class="flex items-center gap-2">
                    <button
                      class="px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                      :disabled="i === 0"
                      @click="moveImage(i, -1)"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      class="px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                      :disabled="i === form.images.length - 1"
                      @click="moveImage(i, +1)"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      class="px-2 py-1 rounded border bg-white hover:bg-gray-50 text-red-600"
                      @click="removeImage(i)"
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Empty state -->
            <div v-else class="text-gray-500">No images yet. Use “Add Images…” to upload.</div>
          </div>
        </div>
  
        <!-- SAVE -->
        <div class="flex justify-end pt-2">
          <button
            @click="save"
            :disabled="saving || !isValid || !form"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, watch, toRaw, computed, nextTick } from 'vue'
  import { useRuntimeConfig } from '#app'
  import { useStaticPages } from '~/composables/useStaticPages'
  
  const props = defineProps({
    slug: { type: String, required: true },     // e.g. 'gallery'
    content: { type: Object, default: null }
  })
  const emit = defineEmits(['saved'])
  
  const { updatePage, uploadPhoto } = useStaticPages()
  const config = useRuntimeConfig().public
  const apiBase = config?.apiBase || ''
  
  /* ---------- State ---------- */
  const form = ref(null)
  const previews = ref({
    heroImage: '',
    images: []
  })
  const errors = ref({})
  const saving = ref(false)
  
  /* ---------- Refs for scroll ---------- */
  const heroRef = ref(null)
  const imagesRef = ref(null)
  
  /* ---------- Helpers ---------- */
  const fullUrl = (p) => (p ? (String(p).startsWith('http') ? p : `${apiBase}${p}`) : '')
  
  /* ---------- Init ---------- */
  watch(
    () => props.content,
    (c) => {
      if (!c) return
      form.value = {
        hero: {
          title:   c?.hero?.title   ?? 'Gallery',
          caption: c?.hero?.caption ?? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc quam lectus, luctus sed feugiat nec, cursus a nibh.',
          image:   c?.hero?.image   ?? ''
        },
        images: Array.isArray(c?.images) ? c.images : []
      }
  
      previews.value.heroImage = fullUrl(form.value.hero.image)
      previews.value.images = form.value.images.map((p) => fullUrl(p))
  
      validateAll()
    },
    { immediate: true }
  )
  
  /* ---------- Validation ---------- */
  function setError(key, msg) {
    if (msg) errors.value[key] = msg
    else delete errors.value[key]
  }
  function validateAll() {
    if (!form.value) return
    const f = form.value
    errors.value = {}
  
    setError('hero.title',   f.hero.title?.trim() ? '' : 'Title is required')
    setError('hero.caption', f.hero.caption?.trim() ? '' : 'Caption is required')
    setError('hero.image',   f.hero.image ? '' : 'Hero image is required')
  
    const hasImages = Array.isArray(f.images) && f.images.length > 0
    setError('images', hasImages ? '' : 'Please add at least one image to the gallery')
  }
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)
  const isValid   = computed(() => !hasErrors.value)
  watch(form, validateAll, { deep: true })
  
  /* ---------- Upload handlers ---------- */
  async function handleHeroUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { url } = await uploadPhoto(file)
      form.value.hero.image = url
      previews.value.heroImage = fullUrl(url)
      validateAll()
    } catch (err) {
      console.error('Hero upload error:', err)
      alert('Upload failed')
    }
  }
  
  async function handleAddImages(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
  
    try {
      for (const f of files) {
        const { url } = await uploadPhoto(f)
        form.value.images.push(url)           // store CMS path
        previews.value.images.push(fullUrl(url)) // store absolute for preview
      }
      validateAll()
      // reset input to allow re-selecting same files if needed
      e.target.value = ''
    } catch (err) {
      console.error('Images upload error:', err)
      alert('One or more uploads failed')
    }
  }
  
  /* ---------- Images CRUD ---------- */
  function moveImage(i, delta) {
    const j = i + delta
    const arr = form.value.images
    const prv = previews.value.images
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    ;[prv[i], prv[j]] = [prv[j], prv[i]]
  }
  function removeImage(i) {
    form.value.images.splice(i, 1)
    previews.value.images.splice(i, 1)
    validateAll()
  }
  function clearAllImages() {
    form.value.images = []
    previews.value.images = []
    validateAll()
  }
  
  /* ---------- Save ---------- */
  async function save() {
    validateAll()
    if (!isValid.value) {
      await nextTick()
      scrollToFirstError()
      return
    }
    try {
      saving.value = true
      await updatePage(props.slug, toRaw(form.value))
      alert('Gallery updated!')
      emit('saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      saving.value = false
    }
  }
  
  /* ---------- Scroll to first error ---------- */
  function scrollToFirstError() {
    const keys = Object.keys(errors.value)
    if (!keys.length) return
    const first = keys[0]
    if (first.startsWith('hero.')) heroRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else if (first === 'images')   imagesRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  </script>
  
  <style scoped>
  /* Using your bookings/admin form vibe: simple borders, rounded, hover states already applied inline */
  </style>
  