<template>
    <transition name="fade">
      <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50" @click="close">
        <div
          class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
            <h3 class="text-[18px] font-semibold text-gray-800">
              {{ event && event.id ? 'Edit Event' : 'Add New Event' }}
            </h3>
            <button @click="close" class="text-gray-500 cursor-pointer hover:text-gray-700">
              <i class="material-icons">close</i>
            </button>
          </div>
  
          <!-- Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
            <form @submit.prevent="submitForm" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  v-model="form.name"
                  required
                  placeholder="e.g. Navratri Mahotsav"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                />
              </div>
  
              <!-- Photo / Featured image -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div class="flex items-end gap-2">
                  <!-- Preview -->
                  <div class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                    <span v-if="!previewUrl" class="text-gray-400 text-xs">No image</span>
                    <img v-else :key="imgKey" :src="previewUrl" alt="Preview" class="object-cover w-full h-full" />
                  </div>
  
                  <!-- Actions -->
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      @click.stop="chooseFromGallery"
                    >
                      Choose from gallery
                    </button>
  
                    <label class="px-3 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 text-sm">
                      Upload file…
                      <input type="file" accept="image/*" @change="onLocalUpload" class="hidden" />
                    </label>
  
                    <button
                      v-if="form.featuredMediaId"
                      type="button"
                      class="px-3 py-2 bg-gray-100 border border-[#ccc] rounded text-sm"
                      @click="clearPhoto"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2" v-if="form.featuredMediaId">Selected mediaId: {{ form.featuredMediaId }}</p>
              </div>
  
              <!-- Dates / Times -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input v-model="form.date" type="date" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input v-model="form.endDate" type="date" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input v-model="form.startTime" type="time" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input v-model="form.endTime" type="time" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
              </div>
  
              <!-- Venue (single dropdown) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <select
                  v-model.number="form.venueId"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                >
                  <option :value="null" disabled>Select a venue</option>
                  <option v-for="v in venues" :key="v.id" :value="v.id">
                    {{ v.title }} — {{ v.zipcode }}
                  </option>
                </select>
              </div>
  
              <!-- Meta -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input v-model.number="form.capacity" type="number" min="0" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price ({{ settingsCurrency }})</label>
                  <input v-model.number="form.price" type="number" min="0" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
              </div>
  
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                  <input v-model="form.organizer" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                  <input v-model="form.contactInfo" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
              </div>
  
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input v-model="form.tags" placeholder="music, cultural" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600" />
                </div>
                <div class="flex items-center gap-3">
                  <input id="isPublic" v-model="form.isPublic" type="checkbox" class="form-checkbox h-5 w-5 text-green-600" />
                  <label for="isPublic" class="text-sm text-gray-700">Public event</label>
                </div>
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea v-model="form.description" rows="3" class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"></textarea>
              </div>
            </form>
          </div>
  
          <!-- Footer -->
          <div class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end gap-3">
            <button @click="close" class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer">Cancel</button>
            <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
              Save
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { reactive, ref, watch, onMounted } from 'vue'
  import { useEventsService } from '@/composables/useEventsService'
  import { useVenueService } from '@/composables/useVenueService'
  import { useMediaStore } from '@/stores/useMediaStore'
  import { useMediaService } from '@/composables/useMediaService'
  
  const props = defineProps({
    event: { type: Object, default: null },
    settingsCurrency: { type: String, default: 'INR' }
  })
  const emit = defineEmits(['close', 'created', 'updated'])
  
  const { createEvent, updateEvent } = useEventsService()
  const { fetchVenues } = useVenueService()
  const mediaStore = useMediaStore()
  const { uploadMedia, fullUrl } = useMediaService()
  
  const venues = ref([])
  
  const form = reactive({
    name: '',
    description: '',
    // dates/times
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    // single venue
    venueId: null,
    // misc
    tags: '',
    capacity: null,
    price: null,
    organizer: '',
    contactInfo: '',
    isPublic: true,
    // media
    featuredMediaId: null,
    clearFeaturedMedia: false,
  })
  
  const previewUrl = ref(null)
  const imgKey = ref(0)
  
  const getId  = (a) => a?.id ?? a?._id ?? null
  const getRel = (a) => a?.url ?? a?.path ?? a?.pathname ?? a?.fileUrl ?? a?.src ?? a?.location ?? null
  
  function setFromAsset(asset) {
    if (!asset) return
    form.featuredMediaId = getId(asset)
    const rel = getRel(asset)
    if (rel) {
      const base = fullUrl(rel)
      const ver  = asset.updatedAt || asset.updated_at || asset.version || Date.now()
      previewUrl.value = `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
      imgKey.value++
    } else {
      previewUrl.value = null
      imgKey.value++
    }
  }
  async function chooseFromGallery() {
    const selection = await mediaStore.open({ multiple: false, accept: 'image/*' })
    const asset = Array.isArray(selection) ? selection[0] : selection
    if (asset) setFromAsset(asset)
  }
  async function onLocalUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const asset = await uploadMedia(file)
    setFromAsset(asset)
    e.target.value = ''
  }
  function clearPhoto() {
    form.featuredMediaId = null
    previewUrl.value = null
    imgKey.value++
  }
  
  function hydrateFromEvent(ev) {
    if (!ev) return
    form.name        = ev.name || ''
    form.description = ev.description || ''
  
    // Dates/times
    form.date      = ev.date ? ev.date.substring(0, 10) : ''
    form.endDate   = ev.endDate ? ev.endDate.substring(0, 10) : ''
    form.startTime = ev.startTime ? new Date(ev.startTime).toISOString().substring(11,16) : ''
    form.endTime   = ev.endTime ? new Date(ev.endTime).toISOString().substring(11,16) : ''
  
    // Venue
    form.venueId   = ev.venueId ?? ev.venueRel?.id ?? null
  
    // Misc
    form.tags        = Array.isArray(ev.tags) ? ev.tags.join(',') : (ev.tags || '')
    form.capacity    = ev.capacity ?? null
    form.price       = ev.price ?? null
    form.organizer   = ev.organizer || ''
    form.contactInfo = ev.contactInfo || ''
    form.isPublic    = typeof ev.isPublic === 'boolean' ? ev.isPublic : true
  
    // Media
    form.featuredMediaId =
      ev.featuredMediaId ??
      ev.featuredMedia?.id ??
      null
  
    // preview
    const rel = ev.featuredMedia?.url || ev.featuredMedia?.path || null
    if (rel) {
      const base = fullUrl(rel)
      const ver  = ev.featuredMedia?.updatedAt || ev.updatedAt || Date.now()
      previewUrl.value = `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
      imgKey.value++
    } else {
      previewUrl.value = null
      imgKey.value++
    }
  }
  
  onMounted(async () => {
    try { venues.value = await fetchVenues() } catch { venues.value = [] }
    hydrateFromEvent(props.event)
  })
  watch(() => props.event, (e) => hydrateFromEvent(e))
  
  function close() { emit('close') }
  
  async function submitForm() {
    try {
      const payload = {
        ...form,
        tags: (form.tags || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      }
  
      if (props.event && props.event.id) {
        await updateEvent(props.event.id, payload, null)
        emit('updated')
      } else {
        await createEvent(payload, null)
        emit('created')
        // reset
        Object.assign(form, {
          name: '', description: '',
          date: '', endDate: '', startTime: '', endTime: '',
          venueId: null,
          tags: '', capacity: null, price: null,
          organizer: '', contactInfo: '', isPublic: true,
          featuredMediaId: null, clearFeaturedMedia: false,
        })
        previewUrl.value = null
        imgKey.value++
      }
      close()
    } catch (err) {
      console.error('❌ Error saving event:', err)
    }
  }
  </script>
  
  <style scoped>
  .material-icons { font-size: 20px; vertical-align: middle; }
  .fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
  </style>
  