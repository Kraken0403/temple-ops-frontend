<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">
      <div v-if="error" class="p-6 text-center text-red-600">Error loading event</div>
      <div v-else-if="!event" class="p-6 text-center text-gray-600">Loading...</div>

      <div v-else class="md:flex">
        <!-- Left: Details -->
        <div class="md:w-2/3 p-6 space-y-6">
          <h2 class="text-3xl font-bold mb-4">{{ event.name }}</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-if="event.price != null">
              <h3 class="text-sm font-semibold text-gray-500">Price</h3>
              <p class="mt-1 text-gray-800">{{ formatMoney(event.price, settingsCurrency) }}</p>
            </div>
            <div v-if="event.capacity != null">
              <h3 class="text-sm font-semibold text-gray-500">Capacity</h3>
              <p class="mt-1 text-gray-800">{{ event.capacity }}</p>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-500">Public</h3>
              <p class="mt-1 text-gray-800">{{ event.isPublic ? 'Yes' : 'No' }}</p>
            </div>

            <div v-if="event.date">
              <h3 class="text-sm font-semibold text-gray-500">Date</h3>
              <p class="mt-1 text-gray-800">{{ formatDate(event.date) }}</p>
            </div>
            <div v-if="event.endDate">
              <h3 class="text-sm font-semibold text-gray-500">End Date</h3>
              <p class="mt-1 text-gray-800">{{ formatDate(event.endDate) }}</p>
            </div>
            <div v-if="event.startTime">
              <h3 class="text-sm font-semibold text-gray-500">Start Time</h3>
              <p class="mt-1 text-gray-800">{{ formatTime(event.startTime) }}</p>
            </div>
            <div v-if="event.endTime">
              <h3 class="text-sm font-semibold text-gray-500">End Time</h3>
              <p class="mt-1 text-gray-800">{{ formatTime(event.endTime) }}</p>
            </div>

            <!-- Venue -->
            <div class="sm:col-span-2" v-if="event.venueRel || event.venue">
              <h3 class="text-sm font-semibold text-gray-500">Venue</h3>
              <div class="mt-1 text-gray-800">
                <template v-if="event.venueRel">
                  <div class="font-medium">
                    {{ event.venueRel.title }}
                    <span v-if="event.venueRel.zipcode" class="text-gray-500">— {{ event.venueRel.zipcode }}</span>
                  </div>
                  <div v-if="event.venueRel.address" class="text-gray-700">{{ event.venueRel.address }}</div>
                  <div v-if="event.venueRel.mapLink" class="mt-1">
                    <a :href="event.venueRel.mapLink" target="_blank" class="text-blue-600 hover:underline">View Venue Map</a>
                  </div>
                </template>
                <template v-else>
                  <span class="text-gray-700">{{ event.venue }}</span>
                  <span v-if="event.mapLink" class="ml-2">
                    <a :href="event.mapLink" target="_blank" class="text-blue-600 hover:underline">Map</a>
                  </span>
                </template>
              </div>
            </div>

            <div v-if="event.organizer">
              <h3 class="text-sm font-semibold text-gray-500">Organizer</h3>
              <p class="mt-1 text-gray-800">{{ event.organizer }}</p>
            </div>
            <div v-if="event.contactInfo">
              <h3 class="text-sm font-semibold text-gray-500">Contact</h3>
              <p class="mt-1 text-gray-800">{{ event.contactInfo }}</p>
            </div>

            <div v-if="event.tags?.length" class="sm:col-span-2">
              <h3 class="text-sm font-semibold text-gray-500">Tags</h3>
              <p class="mt-1 text-gray-800">{{ event.tags.join(', ') }}</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="event.description" class="pt-6 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-500">Description</h3>
            <p class="mt-2 text-gray-800 whitespace-pre-line">{{ event.description }}</p>
          </div>

          <!-- Assigned Sponsorships (inline list) -->
          <div class="pt-6 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-500 mb-2">Sponsorships</h3>
            <div v-if="loadingSponsorships" class="text-gray-500 text-sm">Loading sponsorships…</div>
            <div v-else-if="!eventSponsorships.length" class="text-gray-500 text-sm">No sponsorships yet.</div>
            <div v-else class="space-y-2">
              <div
                v-for="es in eventSponsorships"
                :key="es.id"
                class="flex items-center justify-between border rounded p-3"
              >
                <div class="text-sm">
                  <div class="font-medium">
                    {{ es.sponsorshipType?.name || 'Type' }}
                  </div>
                  <div class="text-gray-600">
                    Price: {{ formatMoney(es.price, settingsCurrency) }} ·
                    Slots: {{ es.maxSlots }} ·
                    Booked: {{ (es.bookings && es.bookings.length) || 0 }}
                  </div>
                </div>
                <button
                  @click="removeSponsorship(es.id)"
                  class="px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-700 border-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Image + Actions + Add Sponsorship button -->
        <div class="md:w-1/3 relative p-6 border-top md:border-t-0 md:border-l border-gray-200 flex flex-col items-center">
          <!-- Edit/Delete Actions (top-right) -->
          <div class="absolute right-2 top-2 flex gap-2">
            <button
              @click="openEditModal"
              class="icon-wrapper p-[10px] rounded-full border border-gray-400 flex justify-center items-center hover:bg-gray-50"
              title="Edit"
            >
              <span class="material-icons text-[15px]">edit</span>
            </button>

            <button
              @click="onDeleteEvent"
              class="icon-wrapper p-[10px] rounded-full border border-gray-400 flex justify-center items-center hover:bg-red-50"
              title="Delete"
            >
              <span class="material-icons text-[15px] text-red-600">delete</span>
            </button>
          </div>

          <!-- Featured Image -->
          <img
            v-if="imageSrc(event)"
            :src="imageSrc(event)"
            alt="Event image"
            class="rounded-lg max-h-[360px] object-cover w-full"
          />
          <div v-else class="w-full h-[360px] bg-gray-100 flex items-center justify-center text-gray-400 rounded">
            No Image
          </div>

          <!-- Add Sponsorship Button (inside the box area) -->
          <button
            class="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            @click="openSponsorshipModal"
          >
            Add Sponsorship
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Event Modal -->
    <AddEditEventModal
      v-if="showModal"
      :event="event"
      :settingsCurrency="settingsCurrency"
      @close="showModal = false"
      @updated="onUpdated"
    />

    <!-- Add Sponsorship Modal -->
    <transition name="fade">
      <div
        v-if="showSponsorModal"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50"
        @click="closeSponsorModal"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-[520px] mt-10 flex flex-col" @click.stop>
          <!-- Header -->
          <div class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
            <h3 class="text-[18px] font-semibold text-gray-800">Assign Sponsorship</h3>
            <button @click="closeSponsorModal" class="text-gray-500 cursor-pointer hover:text-gray-700">
              <i class="material-icons">close</i>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sponsorship Type</label>
                <select
                  v-model.number="sponsorForm.sponsorshipTypeId"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-emerald-600"
                  @change="onTypeChange"
                >
                  <option :value="null" disabled>Select a type</option>
                  <option v-for="t in sponsorshipTypes" :key="t.id" :value="t.id">
                    {{ t.name }} — {{ formatMoney(t.price, settingsCurrency) }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Slots</label>
                  <input
                    v-model.number="sponsorForm.maxSlots"
                    type="number"
                    min="1"
                    class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price ({{ settingsCurrency }})</label>
                  <input
                    v-model.number="sponsorForm.price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-emerald-600"
                  />
                  <p class="text-xs text-gray-500 mt-1">Defaults to the type’s price; you can override.</p>
                </div>
              </div>

              <div v-if="typePreview" class="border rounded p-3 text-sm bg-gray-50">
                <div class="font-medium">{{ typePreview.name }}</div>
                <div class="text-gray-600">Base Price: {{ formatMoney(typePreview.price, settingsCurrency) }}</div>
                <div class="text-gray-600" v-if="typePreview.description">{{ typePreview.description }}</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end gap-3">
            <button @click="closeSponsorModal" class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer">Cancel</button>
            <button
              @click="assignSponsorship"
              :disabled="!sponsorForm.sponsorshipTypeId || sponsorForm.maxSlots < 1"
              class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import AddEditEventModal from '@/components/events/AddEditEventModal.vue'
import { useSettingsService } from '~/composables/useSettingsService'
import { useEventsService } from '~/composables/useEventsService'
import { useMediaService } from '~/composables/useMediaService'
import { useSponsorshipService } from '@/composables/useSponsorshipService'

const route = useRoute()
const router = useRouter()

const { getSettings } = useSettingsService()
const { getEventById, deleteEvent } = useEventsService()
const { fullUrl } = useMediaService()
const {
  fetchSponsorshipTypes,
  getSponsorshipsForEvent,
  assignToEvent,
  deleteEventSponsorshipById
} = useSponsorshipService()

const settingsCurrency = ref('INR')
const event = ref(null)
const error = ref(false)
const showModal = ref(false)

const showSponsorModal = ref(false)
const sponsorshipTypes = ref([])
const eventSponsorships = ref([])
const loadingSponsorships = ref(false)

const sponsorForm = ref({
  sponsorshipTypeId: null,
  maxSlots: 1,
  price: null
})

const typePreview = computed(() =>
  sponsorshipTypes.value.find(t => t.id === sponsorForm.value.sponsorshipTypeId) || null
)

function imageSrc(item) {
  if (!item) return ''
  const rel = item?.featuredMedia?.url || item?.featuredMedia?.path || item?.photoUrl || null
  if (!rel) return ''
  const base = fullUrl(rel)
  const ver  = item?.featuredMedia?.updatedAt || item?.updatedAt || Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

function formatDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString() } catch { return '—' }
}
function formatTime(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleTimeString() } catch { return '—' }
}

function openEditModal() {
  if (!event.value) return
  showModal.value = true
}
async function onUpdated() {
  try {
    event.value = await getEventById(route.params.id)
  } catch (e) {
    console.error('Failed to refresh event:', e)
  } finally {
    showModal.value = false
  }
}

async function onDeleteEvent() {
  if (!event.value) return
  const ok = confirm(`Delete "${event.value.name}"? This cannot be undone.`)
  if (!ok) return
  try {
    await deleteEvent(event.value.id)
    alert('Event deleted')
    router.push('/admin/events')
  } catch (e) {
    console.error(e)
    alert(e?.message || 'Failed to delete event')
  }
}

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return '—'
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    }).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}

/* ───────── Sponsorship helpers ───────── */
function onTypeChange() {
  const t = sponsorshipTypes.value.find(x => x.id === sponsorForm.value.sponsorshipTypeId)
  sponsorForm.value.price = t ? Number(t.price) : null
}

async function openSponsorshipModal() {
  if (!event.value) return
  try {
    if (!sponsorshipTypes.value.length) {
      sponsorshipTypes.value = await fetchSponsorshipTypes()
    }
    // defaults
    sponsorForm.value.sponsorshipTypeId = null
    sponsorForm.value.maxSlots = 1
    sponsorForm.value.price = null
    showSponsorModal.value = true
  } catch (e) {
    console.error('Failed to open sponsorship modal:', e)
    alert(e?.message || 'Unable to load sponsorship types')
  }
}
function closeSponsorModal() { showSponsorModal.value = false }

async function assignSponsorship() {
  try {
    const payload = {
      eventId: Number(event.value.id),
      sponsorshipTypeId: Number(sponsorForm.value.sponsorshipTypeId),
      maxSlots: Number(sponsorForm.value.maxSlots),
      // omit price if empty so backend uses type default
      ...(sponsorForm.value.price != null && { price: Number(sponsorForm.value.price) })
    }
    await assignToEvent(payload)
    await loadEventSponsorships()
    closeSponsorModal()
  } catch (e) {
    console.error('Assign sponsorship failed:', e)
    alert(e?.message || 'Failed to assign sponsorship')
  }
}

async function loadEventSponsorships() {
  if (!event.value) return
  loadingSponsorships.value = true
  try {
    eventSponsorships.value = await getSponsorshipsForEvent(event.value.id)
  } catch (e) {
    console.warn('No sponsorships or failed to fetch:', e)
    eventSponsorships.value = []
  } finally {
    loadingSponsorships.value = false
  }
}
async function removeSponsorship(eventSponsorshipId) {
  const ok = confirm('Remove this sponsorship from the event?')
  if (!ok) return
  try {
    await deleteEventSponsorshipById(eventSponsorshipId)
    await loadEventSponsorships()
  } catch (e) {
    console.error('Delete event sponsorship failed:', e)
    alert(e?.message || 'Failed to remove sponsorship')
  }
}

/* ───────── Mounted ───────── */
onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
  } catch {
    settingsCurrency.value = 'INR'
  }

  try {
    event.value = await getEventById(route.params.id)
  } catch (e) {
    console.error('Error fetching event:', e)
    error.value = true
    return
  }

  // Preload sponsorships for this event
  await loadEventSponsorships()
})
</script>

<style scoped>
.icon-wrapper { width: 36px; height: 36px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
