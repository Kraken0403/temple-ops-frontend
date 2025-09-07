<!-- File: pages/admin/events/index.vue -->
<template>
  <div class="space-y-4">
    <UtilsBar
      title="Events List"
      buttonLabel="Add New Event"
      @action="toggleModal"
    />

    <!-- Error -->
    <div v-if="error" class="text-center text-red-600">
      Error loading events.
    </div>

    <!-- Events List -->
    <div class="cards bg-white min-h-[100vh] flex flex-col gap-2 p-4">
      <NuxtLink
        v-for="ev in events"
        :key="ev.id"
        :to="`/admin/events/${ev.id}`"
        class="flex justify-between items-start p-4 bg-white border border-gray-300 rounded shadow-sm hover:shadow-md transition no-underline text-inherit"
      >
        <div class="flex gap-4">
          <div class="w-24 h-24 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-400">
            <img v-if="ev.imageUrl" :src="getImageUrl(ev.imageUrl)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ ev.name }}</h3>
            <p class="text-sm text-gray-600 mb-1">
              Date: <span class="font-medium text-gray-700">{{ formatDate(ev.date) }}</span>
            </p>
            <p class="text-sm text-gray-600 mb-1">
              Venue: <span class="font-medium text-gray-700">{{ ev.venue }}</span>
            </p>
            <p v-if="ev.capacity != null" class="text-sm text-gray-600">
              Capacity: <span class="font-medium text-gray-700">{{ ev.capacity }}</span>
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-end space-x-2">
          <button @click.stop="goToEdit(ev.id)" class="text-blue-600 hover:text-blue-800">
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[18px]">edit</span>
            </div>
          </button>
          <button @click.stop="handleDelete(ev.id)" class="text-red-600 hover:text-red-800">
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[18px]">delete</span>
            </div>
          </button>
        </div>
      </NuxtLink>
    </div>

    <!-- Create Event Modal -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 h-screen flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
            <h3 class="text-[18px] font-semibold text-gray-800">Create New Event</h3>
            <button @click="toggleModal" class="text-gray-500 hover:text-gray-700">
              <i class="material-icons">close</i>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
            <form @submit.prevent="submitForm" class="space-y-6">
              <!-- Event Info -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Name <span class="text-red-600">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    required
                    placeholder="Event name"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Venue <span class="text-red-600">*</span>
                  </label>
                  <input
                    v-model="form.venue"
                    required
                    placeholder="Venue"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span class="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    v-model="form.date"
                    required
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Date  <span class="text-red-600">*</span></label>
                  <input type="date" required v-model="form.endDate" class="w-full p-2 border border-gray-300 rounded" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" v-model="form.startTime" class="w-full p-2 border border-gray-300 rounded" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" v-model="form.endTime" class="w-full p-2 border border-gray-300 rounded" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
                  <input v-model="form.mapLink" placeholder="https://..." class="w-full p-2 border border-gray-300 rounded" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    v-model.number="form.capacity"
                    placeholder="e.g. 100"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <!-- Price with read-only currency from Settings -->
                <div class="col-span-2 sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price (per ticket)</label>
                  <div class="flex">
                    <span
                      class="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-50 text-gray-700 text-sm"
                      title="Currency is controlled in Settings"
                    >
                      {{ currencySymbol(settingsCurrency) }} {{ settingsCurrency }}
                    </span>
                    <input
                      type="number"
                      v-model.number="form.price"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      class="w-full p-2 border border-gray-300 rounded-r"
                    />
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Currency comes from <strong>Settings</strong> and can’t be edited here.
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input v-model="form.tags" placeholder="music,festival" class="w-full p-2 border border-gray-300 rounded" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div class="flex items-end space-x-4">
                    <div class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                      <span v-if="!previewUrl" class="text-gray-400">No image</span>
                      <img v-else :src="previewUrl" class="object-cover w-full h-full" />
                    </div>
                    <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                      Browse…
                      <input type="file" accept="image/*" @change="onFileChange" class="hidden" />
                    </label>
                  </div>
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea v-model="form.description" rows="3" placeholder="Event details..." class="w-full p-2 border border-gray-300 rounded"></textarea>
                </div>
              </div>

              <!-- Sponsorship Assignment -->
              <div>
                <label class="block text-base font-semibold mb-2 text-gray-800">Assign Sponsorship Types</label>

                <div class="space-y-4">
                  <div
                    v-for="(sel, i) in sponsorshipSelections"
                    :key="i"
                    class="grid grid-cols-12 gap-3 items-center"
                  >
                    <select
                      v-model="sel.sponsorshipTypeId"
                      class="w-full p-2 border border-gray-300 rounded col-span-4"
                      required
                    >
                      <option disabled value="">Select Type</option>
                      <option
                        v-for="opt in sponsorshipOptions"
                        :key="opt.id"
                        :value="opt.id"
                      >
                        {{ opt.name }}
                      </option>
                    </select>

                    <input
                      v-model.number="sel.maxSlots"
                      type="number"
                      min="1"
                      placeholder="Max slots"
                      required
                      class="w-full p-2 border border-gray-300 rounded col-span-3"
                    />

                    <!-- Custom price (optional) with read-only currency) -->
                    <div class="col-span-4">
                      <div class="flex">
                        <span
                          class="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-50 text-gray-700 text-sm"
                          title="Currency is controlled in Settings"
                        >
                          {{ currencySymbol(settingsCurrency) }} {{ settingsCurrency }}
                        </span>
                        <input
                          v-model.number="sel.price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Custom price (optional)"
                          class="w-full p-2 border border-gray-300 rounded-r"
                        />
                      </div>
                    </div>

                    <!-- Delete Icon -->
                    <button
                      type="button"
                      @click="sponsorshipSelections.splice(i, 1)"
                      class="text-red-600 hover:text-red-800 col-span-1"
                    >
                      <span class="material-icons text-[20px]">delete</span>
                    </button>
                  </div>

                  <!-- Add More Button -->
                  <button
                    type="button"
                    @click="sponsorshipSelections.push({ sponsorshipTypeId: '', maxSlots: 1, price: null })"
                    class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
                  >
                    + Add More
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
            <button @click="toggleModal" class="px-4 py-2 text-gray-700 hover:text-gray-900">Cancel</button>
            <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRuntimeConfig } from '#app'
import UtilsBar from '~/components/UtilsBar.vue'
import { useEventsService } from '~/composables/useEventsService'
import { useSponsorshipService } from '~/composables/useSponsorshipService'
import { useSettingsService } from '@/composables/useSettingsService'

const router = useRouter()
const { apiBase } = useRuntimeConfig().public
const { fetchEvents, createEvent, deleteEvent, uploadPhoto } = useEventsService()
const { fetchSponsorshipTypes, assignToEvent } = useSponsorshipService()
const { getSettings } = useSettingsService()

// State
const events = ref([])
const error = ref(null)
const showModal = ref(false)
const previewUrl = ref(null)
const photoFile = ref(null)

const settingsCurrency = ref('INR')

const sponsorshipOptions = ref([])
const sponsorshipSelections = ref([]) // { sponsorshipTypeId, maxSlots, price }

const form = reactive({
  // REQUIRED
  name: '',
  venue: '',
  date: '',
  // Optional
  endDate: '',
  startTime: '',
  endTime: '',
  mapLink: '',
  capacity: null,
  price: null,
  tags: '',
  description: '',
})

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}

function getImageUrl(path) {
  if (path.startsWith('http')) return path
  return `${apiBase}${path}`
}

function toggleModal() {
  showModal.value = !showModal.value
}

function onFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  photoFile.value = file

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
}

async function load() {
  try {
    // currency from Settings
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch {
      settingsCurrency.value = 'INR'
    }

    events.value = await fetchEvents()
    sponsorshipOptions.value = await fetchSponsorshipTypes()
  } catch (e) {
    error.value = e
    console.error('Failed to load:', e)
  }
}

async function submitForm() {
  try {
    // minimal required validation aligned with schema
    if (!form.name?.trim() || !form.venue?.trim() || !form.date) {
      alert('Please fill all required fields: Name, Venue, Date.')
      return
    }

    const tagsArray = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const payload = {
      name: form.name.trim(),
      venue: form.venue.trim(),
      date: form.date,          // backend should parse to DateTime
      endDate: form.endDate || undefined,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      mapLink: form.mapLink || undefined,
      capacity: typeof form.capacity === 'number' ? form.capacity : undefined,
      price: typeof form.price === 'number' ? form.price : undefined,
      tags: tagsArray,
      description: form.description || undefined,
      // NO currency here — taken from Settings
    }

    const newEvent = await createEvent(payload, photoFile.value)

    // Assign sponsorships after event is created
    for (const s of sponsorshipSelections.value) {
      if (s.sponsorshipTypeId && s.maxSlots) {
        const assignPayload = {
          eventId: newEvent.id,
          sponsorshipTypeId: s.sponsorshipTypeId,
          maxSlots: s.maxSlots,
          ...(typeof s.price === 'number' && s.price >= 0 ? { price: s.price } : {})
        }
        await assignToEvent(assignPayload)
      }
    }

    toggleModal()
    await load()

    // Reset form and sponsorship selections
    Object.assign(form, {
      name: '',
      venue: '',
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      mapLink: '',
      capacity: null,
      price: null,
      tags: '',
      description: '',
    })
    sponsorshipSelections.value = []
    photoFile.value = null

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }

  } catch (e) {
    console.error('Create failed:', e)
    alert(e?.message || 'Failed to create event')
  }
}

function goToEdit(id) {
  router.push(`/admin/events/${id}/edit`)
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this event?')) return
  try {
    await deleteEvent(id)
    events.value = events.value.filter(e => e.id !== id)
  } catch (e) {
    console.error('Delete failed:', e)
    alert(e?.message || 'Failed to delete event')
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(load)
</script>

<style scoped>
.icon-wrapper {
  width: 36px;
  height: 36px;
  cursor: pointer;
}
.material-icons {
  font-size: 20px;
}
.fade-enter-active,
.fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
