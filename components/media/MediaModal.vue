<!-- components/media/MediaModal.vue -->
<template>
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
  
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="w-full max-w-5xl bg-white rounded-xl shadow-lg flex flex-col">
          <!-- Header -->
          <div class="px-4 py-3 border-b flex items-center justify-between">
            <div class="flex gap-4">
              <button :class="tab==='library' ? activeTab : baseTab" @click="tab='library'">Media Library</button>
              <button :class="tab==='upload' ? activeTab : baseTab" @click="tab='upload'">Upload New</button>
            </div>
            <button class="text-sm text-gray-500" @click="$emit('close')">Close</button>
          </div>
  
          <!-- Toolbar (library) -->
          <div v-if="tab==='library'" class="px-4 pt-3 flex items-center gap-3">
            <input v-model="q" @input="debouncedFetch" placeholder="Search…" class="border rounded px-3 py-2 w-64" />
            <div class="ml-auto text-sm text-gray-500">{{ multiple ? selected.length + ' selected' : (selected[0]?.filename || 'None') }}</div>
          </div>
  
          <!-- Body -->
          <div class="p-4 overflow-y-auto" style="max-height: 70vh">
            <!-- Library -->
            <div v-if="tab==='library'">
              <div v-if="items.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <button
                  v-for="m in items" :key="m.id"
                  @click="toggle(m)"
                  class="relative border rounded overflow-hidden group"
                  :class="isSelected(m) ? 'ring-2 ring-blue-600' : ''"
                >
                  <img :src="full(m.url)" class="w-full h-32 object-cover" />
                  <div class="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                    {{ m.filename }}
                  </div>
                </button>
              </div>
              <div v-else class="text-gray-500 text-center py-10">No media found.</div>
  
              <div class="mt-4 flex justify-between">
                <button class="px-3 py-1 border rounded" :disabled="page<=1" @click="prev">Prev</button>
                <button class="px-3 py-1 border rounded" @click="next">Next</button>
              </div>
            </div>
  
            <!-- Upload -->
            <div v-else class="flex flex-col items-center justify-center gap-4 py-10">
              <div
                class="w-full border-2 border-dashed rounded-lg p-8 text-center"
                @dragover.prevent
                @drop.prevent="onDrop"
              >
                <p class="text-gray-600">Drag & drop files here</p>
                <p class="text-gray-400 text-sm">or</p>
                <label class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer inline-block">
                  Choose File
                  <input type="file" class="hidden" :accept="accept" @change="onPick" />
                </label>
              </div>
              <div v-if="uploading" class="text-sm text-gray-600">Uploading…</div>
            </div>
          </div>
  
          <!-- Footer -->
          <div class="px-4 py-3 border-t flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ multiple ? selected.length + ' selected' : (selected[0]?.filename || 'None') }}
            </div>
            <div class="flex gap-2">
              <button class="px-3 py-2 border rounded" @click="refresh">Refresh</button>
              <button class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                      :disabled="!selected.length"
                      @click="apply">
                Use {{ multiple ? 'Selected' : 'This' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import _debounce from 'lodash.debounce'
  import { useMediaService } from '@/composables/useMediaService'
  
  const props = defineProps({
    open: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    accept: { type: String, default: 'image/*' },
  })
  const emit = defineEmits(['close', 'apply'])
  
  const { listMedia, uploadMedia, fullUrl } = useMediaService()
  const full = fullUrl
  
  const tab = ref('library')
  const items = ref([])
  const selected = ref([])
  const q = ref('')
  const page = ref(1); const pageSize = 40
  const uploading = ref(false)
  
  const baseTab = 'px-3 py-2 rounded border bg-white hover:bg-gray-50 text-sm'
  const activeTab = 'px-3 py-2 rounded border bg-blue-600 text-white text-sm'
  
  function isSelected(m){ return !!selected.value.find(s => s.id === m.id) }
  function toggle(m){
    if (!props.multiple) selected.value = [m]
    else {
      const i = selected.value.findIndex(s => s.id === m.id)
      i === -1 ? selected.value.push(m) : selected.value.splice(i, 1)
    }
  }
  function apply(){ emit('apply', props.multiple ? selected.value : (selected[0] || null)) }
  
  async function fetchList(rescan=false){
    const data = await listMedia({ q: q.value, page: page.value, pageSize, rescan })
    items.value = data.items || data
  }
  const debouncedFetch = _debounce(() => fetchList(false), 300)
  
  function prev(){ if (page.value>1){ page.value--; fetchList(false) } }
  function next(){ page.value++; fetchList(false) }
  function refresh(){ fetchList(true) }
  
  async function onPick(e){
    const file = e.target.files?.[0]; if (!file) return
    await doUpload(file)
  }
  async function onDrop(e){
    const file = e.dataTransfer?.files?.[0]; if (!file) return
    await doUpload(file)
  }
  async function doUpload(file){
    uploading.value = true
    try {
      const asset = await uploadMedia(file)
      items.value.unshift(asset)
      selected.value = [asset]
      tab.value = 'library'
    } finally {
      uploading.value = false
    }
  }
  
  watch(() => props.open, (o) => {
    if (o) { tab.value = 'library'; page.value = 1; q.value = ''; selected.value = []; fetchList(false) }
  })
  </script>
  