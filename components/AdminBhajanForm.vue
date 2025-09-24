<template>
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4" @click.self="$emit('close')">
      <!-- Modal -->
      <div
        class="relative bg-white rounded-lg w-full max-w-2xl flex flex-col shadow-lg
               max-h-[92vh] h-[88vh] overflow-hidden"
        @click.stop
      >
        <!-- Header (sticky) -->
        <div class="px-5 py-3 border-b bg-[#f5f5f5] sticky top-0 z-10">
          <h3 class="text-xl font-semibold">{{ bhajan ? 'Edit Bhajan' : 'Add Bhajan' }}</h3>
        </div>
  
        <!-- Scrollable Content -->
        <div class="px-5 py-4 overflow-auto flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Title -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Title <span class="text-red-600">*</span>
              </label>
              <input v-model.trim="form.title" placeholder="e.g. Om Jai Jagdish Hare" class="border rounded px-3 py-2 w-full" />
              <p v-if="touched && !form.title" class="text-xs text-red-600 mt-1">Title is required.</p>
            </div>
  
            <!-- PDF URL + Gallery -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                PDF <span class="text-red-600">*</span>
              </label>
              <div class="flex gap-2">
                <input v-model.trim="form.pdfUrl" placeholder="PDF URL" class="border rounded px-3 py-2 flex-1" />
                <button type="button" class="px-3 py-2 border rounded hover:bg-gray-50 text-sm" @click="chooseFromGallery('pdf')">
                  Choose from gallery
                </button>
              </div>
              <p v-if="touched && !form.pdfUrl" class="text-xs text-red-600 mt-1">PDF is required.</p>
              <p v-if="pdfName" class="text-xs text-gray-500 mt-1">Selected: {{ pdfName }}</p>
            </div>
  
            <!-- Thumbnail URL + Gallery + Upload -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Thumbnail (optional)</label>
              <div class="flex items-start gap-3">
                <!-- Preview -->
                <div class="w-28 h-28 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden shrink-0">
                  <span v-if="!previewUrl" class="text-gray-400 text-xs">No image</span>
                  <img v-else :key="imgKey" :src="previewUrl" alt="Preview" class="object-cover w-full h-full" />
                </div>
  
                <!-- Inputs/Actions -->
                <div class="flex-1 space-y-2">
                  <div class="flex gap-2">
                    <input v-model.trim="form.thumbnailUrl" placeholder="Thumbnail image URL" class="border rounded px-3 py-2 w-full" />
                    <button type="button" class="px-3 py-2 border rounded hover:bg-gray-50 text-sm whitespace-nowrap" @click="chooseFromGallery('image')">
                      Choose from gallery
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <label class="px-3 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 text-sm">
                      Upload image…
                      <input type="file" accept="image/*" @change="onLocalUploadImage" class="hidden" />
                    </label>
                    <button
                      v-if="form.thumbnailUrl"
                      type="button"
                      class="px-3 py-2 bg-gray-100 border border-[#ccc] rounded text-sm"
                      @click="clearThumbnail"
                    >
                      Clear
                    </button>
                  </div>
                  <p v-if="thumbName" class="text-xs text-gray-500">Selected: {{ thumbName }}</p>
                </div>
              </div>
            </div>
  
            <!-- Audio URL -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Audio URL (optional)</label>
              <input v-model.trim="form.audioUrl" placeholder="https://..." class="border rounded px-3 py-2 w-full" />
            </div>
  
            <!-- Lyrics -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Lyrics (HTML)</label>
              <textarea v-model="form.lyricsHtml" class="border rounded px-3 py-2 w-full min-h-[140px]" placeholder="<p>Stanza...</p>"></textarea>
            </div>
  
            <!-- Tags -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input v-model="tagsText" placeholder="Krishna, Aarti, Evening" class="border rounded px-3 py-2 w-full" />
            </div>
  
            <!-- Published -->
            <label class="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" v-model="form.isPublished" />
              <span>Published</span>
            </label>
          </div>
        </div>
  
        <!-- Footer (sticky) -->
        <div class="px-5 py-3 border-t bg-[#f5f5f5] sticky bottom-0 z-10">
          <div class="flex justify-end gap-2">
            <button class="border rounded px-3 py-2" @click="$emit('close')">Cancel</button>
            <button
              class="text-white rounded px-3 py-2"
              :class="canSave ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'"
              :disabled="!canSave"
              @click="save"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, watch, computed } from 'vue'
  import { useBhajansService } from '~/composables/useBhajansService'
  import { useMediaStore } from '@/stores/useMediaStore'
  import { useMediaService } from '@/composables/useMediaService'
  
  const props = defineProps({ bhajan: Object })
  const emit = defineEmits(['close','saved'])
  
  const svc = useBhajansService()
  const mediaStore = useMediaStore()
  const { uploadMedia, fullUrl } = useMediaService?.() || {}
  
  /* ── Form state ── */
  const form = reactive({
    title: '',
    pdfUrl: '',
    lyricsHtml: '',
    audioUrl: '',
    thumbnailUrl: '',
    isPublished: true,
    tags: []
  })
  
  const touched = ref(false)
  const pdfName = ref('')
  const thumbName = ref('')
  
  /* Thumbnail preview */
  const previewUrl = ref(null)
  const imgKey = ref(0)
  
  /* Helpers to normalize your media object fields */
  const getRel = (a) => a?.url ?? a?.path ?? a?.pathname ?? a?.fileUrl ?? a?.src ?? a?.location ?? null
  const getName = (a) => a?.name ?? a?.filename ?? a?.originalname ?? ''
  
  /* Tags text ⇄ array */
  const tagsText = computed({
    get: () => form.tags?.join(', ') || '',
    set: (val) => { form.tags = val.split(',').map(s => s.trim()).filter(Boolean) }
  })
  
  /* Load from existing bhajan */
  watch(() => props.bhajan, (b) => {
    if (!b) {
      Object.assign(form, {
        title:'', pdfUrl:'', lyricsHtml:'', audioUrl:'', thumbnailUrl:'', isPublished: true, tags: []
      })
      pdfName.value = ''
      thumbName.value = ''
      previewUrl.value = null
      imgKey.value++
      return
    }
    Object.assign(form, {
      title: b.title || '',
      pdfUrl: b.pdfUrl || '',
      lyricsHtml: b.lyricsHtml || '',
      audioUrl: b.audioUrl || '',
      thumbnailUrl: b.thumbnailUrl || '',
      isPublished: b.isPublished ?? true,
      tags: b.tagsJson ? JSON.parse(b.tagsJson) : []
    })
    pdfName.value = b.pdfUrl ? b.pdfUrl.split('/').pop() : ''
    thumbName.value = b.thumbnailUrl ? b.thumbnailUrl.split('/').pop() : ''
    if (form.thumbnailUrl) {
      previewUrl.value = form.thumbnailUrl
      imgKey.value++
    } else {
      previewUrl.value = null
      imgKey.value++
    }
  }, { immediate: true })
  
  /* Validation */
  const canSave = computed(() => !!form.title && !!form.pdfUrl)
  
  /* Gallery picks */
  async function chooseFromGallery(kind) {
    const accept = kind === 'pdf' ? 'application/pdf' : 'image/*'
    const selection = await mediaStore.open({ multiple: false, accept })
    const asset = Array.isArray(selection) ? selection[0] : selection
    if (!asset) return
  
    const rel = getRel(asset)
    if (!rel) return
  
    const absolute = typeof fullUrl === 'function' ? fullUrl(rel) : rel
    if (kind === 'pdf') {
      form.pdfUrl = absolute
      pdfName.value = getName(asset) || (form.pdfUrl.split('/').pop() || '')
    } else {
      form.thumbnailUrl = absolute
      thumbName.value = getName(asset) || (form.thumbnailUrl.split('/').pop() || '')
      previewUrl.value = versioned(absolute, asset?.updatedAt || asset?.updated_at || Date.now())
      imgKey.value++
    }
  }
  
  function versioned(u, v) {
    if (!u) return u
    const s = String(v || Date.now())
    return `${u}${u.includes('?') ? '&' : '?'}v=${encodeURIComponent(s)}`
  }
  
  /* Local upload for thumbnail image (optional) */
  async function onLocalUploadImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      if (typeof uploadMedia !== 'function') {
        console.warn('uploadMedia not configured; skipping upload.')
        return
      }
      const asset = await uploadMedia(file)  // should return { url, name, ... }
      const rel = getRel(asset)
      if (rel) {
        const absolute = typeof fullUrl === 'function' ? fullUrl(rel) : rel
        form.thumbnailUrl = absolute
        thumbName.value = getName(asset) || (absolute.split('/').pop() || '')
        previewUrl.value = versioned(absolute, asset?.updatedAt || asset?.updated_at || Date.now())
        imgKey.value++
      }
    } finally {
      e.target.value = ''
    }
  }
  
  /* Clear thumbnail */
  function clearThumbnail() {
    form.thumbnailUrl = ''
    thumbName.value = ''
    previewUrl.value = null
    imgKey.value++
  }
  
  /* Save */
  async function save() {
    touched.value = true
    if (!canSave.value) return
    try {
      if (props.bhajan?.id) {
        await svc.update(props.bhajan.id, form)
      } else {
        await svc.create(form)
        // reset for new
        Object.assign(form, {
          title:'', pdfUrl:'', lyricsHtml:'', audioUrl:'', thumbnailUrl:'', isPublished: true, tags: []
        })
        pdfName.value = ''
        thumbName.value = ''
        previewUrl.value = null
        imgKey.value++
        touched.value = false
      }
      emit('saved')
      emit('close')
    } catch (e) {
      console.error('❌ Error saving bhajan', e)
    }
  }
  </script>
  
  <style scoped>
  /* Keep styles minimal; Tailwind handles layout. */
  </style>
  