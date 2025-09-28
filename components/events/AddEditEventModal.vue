<template>
  <transition name="fade">
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50" @click="close">
      <div
        class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                required
                placeholder="e.g. Navratri Mahotsav"
                class="w-full p-2 border border-gray-300 rounded focus:border-green-600 text-base"
              />
            </div>

            <!-- Photo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Photo <span class="text-red-500">*</span>
              </label>
              <div class="flex items-end gap-2">
                <div
                  class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden"
                >
                  <span v-if="!previewUrl" class="text-gray-400 text-xs">No image</span>
                  <img
                    v-else
                    :key="imgKey"
                    :src="previewUrl"
                    alt="Preview"
                    class="object-cover w-full h-full"
                  />
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm cursor-pointer"
                    @click.stop="chooseFromGallery"
                  >
                    Choose from gallery
                  </button>
                  <label
                    class="px-3 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 text-sm"
                  >
                    Upload file…
                    <input type="file" accept="image/*" @change="onLocalUpload" class="hidden" />
                  </label>
                  <button
                    v-if="form.featuredMediaId"
                    type="button"
                    class="px-3 py-2 bg-gray-100 border border-[#ccc] rounded text-sm cursor-pointer"
                    @click="clearPhoto"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <!-- Dates / Times -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.endDate"
                  type="date"
                  required
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.startTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.endTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
            </div>

            <!-- Venue Switch -->
            <div class="space-y-3">
              <div class="flex gap-4">
                <label class="flex items-center gap-2">
                  <input type="radio" value="in" v-model="venueMode" class="text-green-600" />
                  In Venue
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" value="out" v-model="venueMode" class="text-green-600" />
                  Outside Venue
                </label>
              </div>

              <!-- In Venue -->
              <div v-if="venueMode === 'in'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Venue <span class="text-red-500">*</span>
                </label>
                <select
                  v-model.number="form.venueId"
                  required
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                >
                  <option :value="null" disabled>Select a venue</option>
                  <option v-for="v in venues" :key="v.id" :value="v.id">
                    {{ `${v.title} — ${v.zipcode}` }}
                  </option>

                </select>
              </div>

              <!-- Outside Venue -->
              <div v-else>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Venue Address <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.venue"
                    required
                    placeholder="e.g. GMDC Ground, Ahmedabad"
                    class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Map Link <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.mapLink"
                    required
                    placeholder="https://maps.google.com/..."
                    class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                  />
                </div>
              </div>
            </div>

            <!-- Meta -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Capacity <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.capacity"
                  type="number"
                  required
                  min="1"
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Price ({{ settingsCurrency }}) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  required
                  min="0"
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
            </div>

            <!-- Organizer + Contact -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                <input
                  v-model="form.organizer"
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                <input
                  v-model="form.contactInfo"
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
            </div>

            <!-- Tags -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  v-model="form.tags"
                  placeholder="music, cultural"
                  class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
                />
              </div>
              <div class="flex items-center gap-3">
                <input id="isPublic" v-model="form.isPublic" type="checkbox" class="h-5 w-5 text-green-600" />
                <label for="isPublic" class="text-sm text-gray-700">Public event</label>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full p-2 border border-gray-300 rounded focus:border-green-600"
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-between gap-3">
          <div class="ml-auto flex gap-3">
            <button @click="close" class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer">
              Cancel
            </button>
            <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { DateTime } from 'luxon'
import { loadTimezone } from '@/utils/timezone'
import { useEventsService } from '@/composables/useEventsService'
import { useVenueService } from '@/composables/useVenueService'
import { useMediaStore } from '@/stores/useMediaStore'
import { useMediaService } from '@/composables/useMediaService'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

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
const tz = ref('Asia/Kolkata')
const venueMode = ref('in')

const form = reactive({
  name: '', description: '', date: '', endDate: '', startTime: '', endTime: '',
  venueId: null, venue: '', mapLink: '', tags: '', capacity: null, price: null,
  organizer: '', contactInfo: '', isPublic: true, featuredMediaId: null,
  clearFeaturedMedia: false
})

const previewUrl = ref(null)
const imgKey = ref(0)

function setFromAsset(asset) {
  if (!asset) return
  form.featuredMediaId = asset.id ?? null
  if (asset.url || asset.path) {
    const base = fullUrl(asset.url || asset.path)
    const ver = asset.updatedAt || Date.now()
    previewUrl.value = `${base}?v=${encodeURIComponent(ver)}`
    imgKey.value++
  }
}

async function chooseFromGallery() {
  const selection = await mediaStore.open({ multiple: false, accept: 'image/*' })
  if (selection) setFromAsset(Array.isArray(selection) ? selection[0] : selection)
}

async function onLocalUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const asset = await uploadMedia(file)
    setFromAsset(asset)
  } catch (err) {
    showNotification(err?.message || 'Failed to upload image', 'error')
  }
  e.target.value = ''
}

function clearPhoto() {
  form.featuredMediaId = null
  previewUrl.value = null
  imgKey.value++
}

function hydrateFromEvent(ev) {
  if (!ev) return
  form.name = ev.name || ''
  form.description = ev.description || ''
  form.date = ev.date ? DateTime.fromISO(ev.date, { zone: 'utc' }).setZone(tz.value).toFormat('yyyy-LL-dd') : ''
  form.endDate = ev.endDate ? DateTime.fromISO(ev.endDate, { zone: 'utc' }).setZone(tz.value).toFormat('yyyy-LL-dd') : ''
  form.startTime = ev.startTime ? DateTime.fromISO(ev.startTime, { zone: 'utc' }).setZone(tz.value).toFormat('HH:mm') : ''
  form.endTime = ev.endTime ? DateTime.fromISO(ev.endTime, { zone: 'utc' }).setZone(tz.value).toFormat('HH:mm') : ''

  if (ev.isInVenue) {
    venueMode.value = 'in'
    form.venueId = ev.venueId ?? ev.venueRel?.id ?? null
    form.venue = ''; form.mapLink = ''
  } else {
    venueMode.value = 'out'
    form.venue = ev.venue || ''
    form.mapLink = ev.mapLink || ''
    form.venueId = null
  }

  form.tags = Array.isArray(ev.tags) ? ev.tags.join(',') : ev.tags || ''
  form.capacity = ev.capacity ?? null
  form.price = ev.price ?? null
  form.organizer = ev.organizer || ''
  form.contactInfo = ev.contactInfo || ''
  form.isPublic = typeof ev.isPublic === 'boolean' ? ev.isPublic : true
  form.featuredMediaId = ev.featuredMedia?.id ?? null
  if (ev.featuredMedia?.url) {
    const base = fullUrl(ev.featuredMedia.url)
    const ver = ev.featuredMedia.updatedAt || ev.updatedAt || Date.now()
    previewUrl.value = `${base}?v=${encodeURIComponent(ver)}`
    imgKey.value++
  }
}

onMounted(async () => {
  tz.value = await loadTimezone()
  try { venues.value = await fetchVenues() } catch { venues.value = [] }
  hydrateFromEvent(props.event)
})
watch(() => props.event, (e) => hydrateFromEvent(e))

function close() { emit('close') }

async function submitForm() {
  try {
    // Validate required image
    if (!form.featuredMediaId) {
      showNotification('❌ Please upload or select a photo', 'error')
      return
    }
    // Validate dates
    if (form.date && form.endDate) {
      const start = DateTime.fromISO(form.date)
      const end = DateTime.fromISO(form.endDate)
      if (end < start) {
        showNotification('❌ End date must be same or later than start date', 'error')
        return
      }
    }
    // Validate venue
    if (venueMode.value === 'in' && !form.venueId) {
      showNotification('❌ Please select a venue', 'error')
      return
    }
    if (venueMode.value === 'out' && (!form.venue || !form.mapLink)) {
      showNotification('❌ Please fill venue address and map link', 'error')
      return
    }

    const payload = {
      ...form,
      tags: (form.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      isInVenue: venueMode.value === 'in',
      isOutsideVenue: venueMode.value === 'out'
    }

    if (props.event?.id) {
      await updateEvent(props.event.id, payload, null, tz.value)
      emit('updated')
      showNotification('✅ Event updated successfully', 'success')
    } else {
      await createEvent(payload, null, tz.value)
      emit('created')
      showNotification('✅ Event created successfully', 'success')
    }
    close()
  } catch (err) {
    console.error('❌ Error saving event:', err)
    showNotification(err?.message || 'Failed to save event', 'error')
  }
}
</script>
