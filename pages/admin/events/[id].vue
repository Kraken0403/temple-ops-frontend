<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">
      <div v-if="error" class="p-6 text-center text-red-600">Error loading event</div>
      <div v-else-if="!event" class="p-6 text-center text-gray-600">Loading...</div>
      <div v-else class="md:flex">
        <!-- Left: Details -->
        <div class="md:w-2/3 p-6 space-y-6">
          <h2 class="text-3xl font-bold">{{ event.name }}</h2>

          <!-- Price & Currency -->
          <p class="text-gray-600">
            <span class="font-semibold">
              {{ event.price != null ? formatMoney(event.price, settingsCurrency) : 'Free' }}
            </span>
          </p>

          <!-- Dates Side by Side -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Start Date</h3>
              <p class="mt-1 text-gray-800">{{ formatDate(event.date) }}</p>
            </div>
            <div v-if="event.endDate">
              <h3 class="text-sm font-semibold text-gray-500">End Date</h3>
              <p class="mt-1 text-gray-800">{{ formatDate(event.endDate) }}</p>
            </div>
          </div>

          <!-- Times Side by Side -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-if="event.startTime">
              <h3 class="text-sm font-semibold text-gray-500">Start Time</h3>
              <p class="mt-1 text-gray-800">{{ formatTime(event.startTime) }}</p>
            </div>
            <div v-if="event.endTime">
              <h3 class="text-sm font-semibold text-gray-500">End Time</h3>
              <p class="mt-1 text-gray-800">{{ formatTime(event.endTime) }}</p>
            </div>
          </div>

          <!-- Venue & Map -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Venue</h3>
              <p class="mt-1 text-gray-800">{{ event.venue }}</p>
            </div>
            <div v-if="event.mapLink">
              <h3 class="text-sm font-semibold text-gray-500">Map</h3>
              <a
                :href="event.mapLink"
                target="_blank"
                class="mt-1 block text-blue-600 hover:underline"
              >View Location</a>
            </div>
          </div>

          <!-- Capacity, Tags, Description -->
          <div class="space-y-4">
            <div v-if="event.capacity != null">
              <h3 class="text-sm font-semibold text-gray-500">Capacity</h3>
              <p class="mt-1 text-gray-800">{{ event.capacity }}</p>
            </div>
            <div v-if="event.tags?.length">
              <h3 class="text-sm font-semibold text-gray-500">Tags</h3>
              <p class="mt-1 text-gray-800">{{ event.tags.join(', ') }}</p>
            </div>
            <div v-if="event.description">
              <h3 class="text-sm font-semibold text-gray-500">Description</h3>
              <p class="mt-1 text-gray-800 whitespace-pre-line">{{ event.description }}</p>
            </div>
          </div>

          <!-- Sponsorships -->
          <div class="pt-6">
            <h3 class="text-xl font-semibold mb-4 text-gray-800">Sponsorships</h3>

            <div v-if="sponsorships.length" class="space-y-3">
              <div
                v-for="s in sponsorships"
                :key="s.id"
                class="p-4 border border-gray-200 rounded bg-gray-50"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <h4 class="text-base font-semibold text-gray-800">
                      {{ s.sponsorshipType?.name || 'Untitled' }}
                    </h4>
                    <p class="text-sm text-gray-600">
                      Max Slots: {{ s.maxSlots ?? 0 }} |
                      Booked: {{ s.bookings?.length ?? 0 }} |
                      Price: {{ formatMoney(s.price ?? 0, settingsCurrency) }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ s.sponsorshipType?.description || 'No description available.' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-sm text-gray-500">0 sponsorships assigned.</div>
          </div>
        </div>


                <!-- Right: Photo -->
                <div class="md:w-1/3 relative p-6 border-t md:border-t-0 md:border-l border-gray-200 flex items-center justify-center">
          <div @click="openEditModal" class="absolute cursor-pointer right-[10px] top-[10px] icon-wrapper p-[10px] rounded-full border border-gray-400 flex justify-center items-center">
            <span class="material-icons text-[15px]">edit</span>
          </div>
          <img
            v-if="event.imageUrl"
            :src="fullImageUrl(event.imageUrl)"
            alt="Event image"
            class="rounded-lg max-h-[400px] object-cover w-full"
          />
          <div
            v-else
            class="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-400"
          >
            No Image
          </div>
        </div>
      </div>
    </div>


     <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
          <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 h-screen flex flex-col">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
              <h3 class="text-[18px] font-semibold text-gray-800">Edit Event</h3>
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
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input v-model="form.name" required placeholder="Event name" class="w-full p-2 border border-gray-300 rounded" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <input v-model="form.venue" required placeholder="Venue" class="w-full p-2 border border-gray-300 rounded" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" v-model="form.date" required class="w-full p-2 border border-gray-300 rounded" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" v-model="form.endDate" class="w-full p-2 border border-gray-300 rounded" />
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
                    <input type="number" v-model.number="form.capacity" placeholder="e.g. 100" class="w-full p-2 border border-gray-300 rounded" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" v-model.number="form.price" placeholder="e.g. 500" class="w-full p-2 border border-gray-300 rounded" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <input v-model="form.currency" disabled placeholder="USD" class="w-full p-2 border border-gray-300 rounded" />
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

                      <input
                        v-model.number="sel.price"
                        type="number"
                        min="0"
                        placeholder="Custom price"
                        required
                        class="w-full p-2 border border-gray-300 rounded col-span-4"
                      />

                      <!-- Delete Icon -->
                      <button
                        type="button"
                        @click="handleDeleteSponsorship(sel, i)"
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
              <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
            </div>
          </div>
        </div>
      </transition>

  </div>

  
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRoute, useRuntimeConfig } from '#app'
import { useEventsService } from '~/composables/useEventsService'
import { useSponsorshipService } from '~/composables/useSponsorshipService'
import { useSettingsService } from '~/composables/useSettingsService' // ⬅️ NEW

const route  = useRoute()
const config = useRuntimeConfig().public

const { getEventById, updateEvent, uploadPhoto } = useEventsService()
const { getSponsorshipsForEvent, assignToEvent, deleteSponsorshipAssignment, fetchSponsorshipTypes } = useSponsorshipService()
const { getSettings } = useSettingsService() // ⬅️ NEW

const sponsorshipOptions = ref([])

const event = ref(null)
const sponsorships = ref([])
const error = ref(false)

const showModal = ref(false)
const form = ref({})
const file = ref(null)
const deletedSponsorships = ref([])
const previewUrl = ref('')
const sponsorshipSelections = ref([])

const settingsCurrency = ref('INR') // ⬅️ NEW

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return '0'
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    }).format(Number(amount))
  } catch {
    // fallback
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}

function toggleModal() {
  showModal.value = !showModal.value
}

function handleDeleteSponsorship(sel, index) {
  if (sel.sponsorshipTypeId) {
    deletedSponsorships.value.push(sel.sponsorshipTypeId)
  }
  sponsorshipSelections.value.splice(index, 1)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function onFileChange(e) {
  const f = e.target.files[0]
  if (!f) return
  file.value = f
  previewUrl.value = URL.createObjectURL(f)
}

function openEditModal() {
  if (!event.value) return

  form.value = {
    name: event.value.name,
    venue: event.value.venue,
    date: event.value.date?.slice(0, 10),
    endDate: event.value.endDate?.slice(0, 10) || '',
    startTime: event.value.startTime?.slice(11, 16) || '',
    endTime: event.value.endTime?.slice(11, 16) || '',
    mapLink: event.value.mapLink || '',
    capacity: event.value.capacity,
    price: event.value.price,
    // prefer event currency, else default to settings currency
    currency: event.value.currency || settingsCurrency.value, // ⬅️ UPDATED
    tags: event.value.tags?.join(', ') || '',
    description: event.value.description || '',
    imageUrl: event.value.imageUrl || ''
  }

  previewUrl.value = fullImageUrl(event.value.imageUrl)
  file.value = null

  sponsorshipSelections.value = (sponsorships.value || []).map(s => ({
    sponsorshipTypeId: s.sponsorshipType?.id || '',
    maxSlots: s.maxSlots || 1,
    price: s.price ?? null
  }))

  showModal.value = true
}

async function submitForm() {
  try {
    const tagsArray = form.value.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const updatedForm = { ...form.value, tags: tagsArray }

    // 1️⃣ Update the event itself
    const updatedEvent = await updateEvent(route.params.id, updatedForm, file.value)

    // 2️⃣ Reassign (add/update) sponsorships
    for (const s of sponsorshipSelections.value) {
      if (s.sponsorshipTypeId && s.maxSlots) {
        const payload = {
          eventId: updatedEvent.id,
          sponsorshipTypeId: s.sponsorshipTypeId,
          maxSlots: s.maxSlots,
          ...(typeof s.price === 'number' && s.price >= 0 ? { price: s.price } : {})
        }
        await assignToEvent(payload)
      }
    }

    // 2.5️⃣ Delete removed sponsorships
    for (const typeId of deletedSponsorships.value) {
      try {
        await deleteSponsorshipAssignment(updatedEvent.id, typeId)
      } catch (e) {
        console.warn(`Failed to delete sponsorship type ${typeId}`, e)
      }
    }

    // 3️⃣ Reload fresh event + sponsorships
    event.value = await getEventById(route.params.id)
    sponsorships.value = await getSponsorshipsForEvent(updatedEvent.id)

    // 4️⃣ Reset UI
    showModal.value = false
    deletedSponsorships.value = []
  } catch (err) {
    console.error('Error updating event:', err)
    alert('Error saving changes')
  }
}

function fullImageUrl(path) {
  return path?.startsWith('http') ? path : `${config.apiBase}${path}`
}

onMounted(async () => {
  try {
    // ⬅️ NEW: load settings currency first
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch (e) {
      console.error('Could not load settings:', e)
      settingsCurrency.value = 'INR'
    }

    const eventId = route.params.id
    event.value = await getEventById(eventId)

    const fetchedSponsorships = await getSponsorshipsForEvent(eventId)
    sponsorships.value = Array.isArray(fetchedSponsorships) ? fetchedSponsorships : []

    sponsorshipOptions.value = await fetchSponsorshipTypes()
  } catch (e) {
    console.error('Error fetching data:', e)
    error.value = true
  }
})
</script>


<style scoped>
/* Tailwind handles layout */
</style>
