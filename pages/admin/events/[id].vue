<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">
      <div v-if="error" class="p-6 text-center text-red-600">Error loading event</div>
      <div v-else-if="!event" class="p-6 text-center text-gray-600">Loading...</div>

      <div v-else class="md:flex">
        <!-- Left: Details -->
        <div class="md:w-2/3 p-6 space-y-6">
          <h2 class="text-3xl font-bold mb-6">{{ event.name }}</h2>

          <!-- Info Section -->
          <div class="bg-gray-50 rounded-lg p-4 border space-y-4">
            <h3 class="text-base font-semibold text-gray-700">Event Info</h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><dt class="text-sm text-gray-500">ID</dt><dd class="font-medium">{{ event.id || '—' }}</dd></div>
              <div><dt class="text-sm text-gray-500">Public</dt><dd class="font-medium">{{ event.isPublic ? 'Yes' : 'No' }}</dd></div>
              <div><dt class="text-sm text-gray-500">Price</dt><dd class="font-medium">{{ formatMoney(event.price, settingsCurrency) }}</dd></div>
              <div><dt class="text-sm text-gray-500">Capacity</dt><dd class="font-medium">{{ event.capacity ?? '—' }}</dd></div>
              <div><dt class="text-sm text-gray-500">In Venue</dt><dd class="font-medium">{{ event.isInVenue ? 'Yes' : 'No' }}</dd></div>
              <div><dt class="text-sm text-gray-500">Outside Venue</dt><dd class="font-medium">{{ event.isOutsideVenue ? 'Yes' : 'No' }}</dd></div>
              <div><dt class="text-sm text-gray-500">Date</dt><dd class="font-medium">{{ event.date ? formatDate(event.date, 'MMM dd, yyyy') : '—' }}</dd></div>
              <div><dt class="text-sm text-gray-500">End Date</dt><dd class="font-medium">{{ event.endDate ? formatDate(event.endDate, 'MMM dd, yyyy') : '—' }}</dd></div>
              <div><dt class="text-sm text-gray-500">Start Time</dt><dd class="font-medium">{{ event.startTime ? formatTime(event.startTime, 'hh:mm a') : '—' }}</dd></div>
              <div><dt class="text-sm text-gray-500">End Time</dt><dd class="font-medium">{{ event.endTime ? formatTime(event.endTime, 'hh:mm a') : '—' }}</dd></div>
              <div><dt class="text-sm text-gray-500">Created At</dt><dd class="font-medium">{{ formatDate(event.createdAt, 'MMM dd, yyyy HH:mm') }}</dd></div>
              <div><dt class="text-sm text-gray-500">Updated At</dt><dd class="font-medium">{{ formatDate(event.updatedAt, 'MMM dd, yyyy HH:mm') }}</dd></div>
            </dl>
          </div>

          <!-- Venue -->
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h3 class="text-base font-semibold text-gray-700 mb-2">Venue</h3>

            <!-- In-Venue -->
            <div v-if="event.venueRel">
              <div class="font-medium">
                {{ event.venueRel.title || '—' }}
                <span v-if="event.venueRel.zipcode" class="text-gray-500">— {{ event.venueRel.zipcode }}</span>
              </div>
              <div class="text-gray-700">{{ event.venueRel.address || '—' }}</div>
              <div v-if="event.venueRel.mapLink" class="mt-1">
                <a :href="event.venueRel.mapLink" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                  View Venue Map
                </a>
              </div>
            </div>

            <!-- Outside-Venue -->
            <div v-else>
              <div class="text-gray-700">{{ event.venue || '—' }}</div>
              <div v-if="event.mapLink" class="mt-1">
                <a :href="event.mapLink" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                  Map
                </a>
              </div>
            </div>
          </div>

          <!-- Organizer / Contact -->
          <div class="bg-gray-50 rounded-lg p-4 border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Organizer</h3>
              <p class="mt-1 text-gray-800">{{ event.organizer || '—' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Contact</h3>
              <p class="mt-1 text-gray-800">{{ event.contactInfo || '—' }}</p>
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h3 class="text-sm font-semibold text-gray-500">Tags</h3>
            <p class="mt-1 text-gray-800">{{ event.tags?.length ? event.tags.join(', ') : '—' }}</p>
          </div>

          <!-- Description -->
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h3 class="text-sm font-semibold text-gray-500">Description</h3>
            <p class="mt-2 text-gray-800 whitespace-pre-line">{{ event.description || '—' }}</p>
          </div>

          <!-- Gallery -->
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h3 class="text-sm font-semibold text-gray-500">Gallery</h3>
            <div v-if="event.gallery?.length" class="grid grid-cols-2 gap-3 mt-2">
              <img v-for="g in event.gallery" :key="g.id" :src="fullUrl(g.media?.url)" class="rounded object-cover h-32 w-full" />
            </div>
            <p v-else class="text-gray-500 text-sm mt-1">—</p>
          </div>

          <!-- Bookings -->
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h3 class="text-sm font-semibold text-gray-500 flex items-center justify-between">
              <span>Bookings</span>
              <NuxtLink
                v-if="bookings.length"
                :to="`/admin/events/bookings/${event.id}`"
                class="text-blue-600 hover:underline text-sm"
              >
                View all ({{ bookings.length }})
              </NuxtLink>
            </h3>
            <ul v-if="bookings.length" class="mt-2 space-y-1 text-sm">
              <li v-for="b in bookings.slice(0, 3)" :key="b.id">
                {{ b.userName || 'Guest' }} · {{ b.pax }} pax ({{ b.status }})
              </li>
              <li v-if="bookings.length > 3" class="text-gray-500 text-xs">…and {{ bookings.length - 3 }} more</li>
            </ul>
            <p v-else class="text-gray-500 text-sm mt-1">—</p>
          </div>

          <!-- Sponsorships -->
          <div class="bg-gray-50 rounded-lg p-4 border">
            <h3 class="text-base font-semibold text-gray-700 mb-3">Sponsorships</h3>
            <div v-if="loadingSponsorships" class="text-gray-500 text-sm">Loading sponsorships…</div>
            <div v-else-if="!eventSponsorships.length" class="text-gray-500 text-sm">—</div>
            <div v-else class="space-y-2">
              <div v-for="es in eventSponsorships" :key="es.id" class="flex items-center justify-between border rounded p-3 bg-white">
                <div class="text-sm">
                  <div class="font-medium">{{ es.sponsorshipType?.name || '—' }}</div>
                  <div class="text-gray-600">
                    Price: {{ formatMoney(es.price, settingsCurrency) }} ·
                    Slots: {{ es.maxSlots }} ·
                    Booked: {{ (es.bookings && es.bookings.length) || 0 }}
                  </div>
                </div>
                <button @click="removeSponsorship(es.id)" class="px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-700 border-red-200">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Image + Actions -->
        <div class="md:w-1/3 relative p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col items-center">
          <div class="absolute right-2 top-2 flex gap-2">
            <button @click="openEditModal" class="icon-wrapper p-[10px] rounded-full border border-gray-400 flex justify-center items-center hover:bg-gray-50" title="Edit">
              <span class="material-icons text-[15px]">edit</span>
            </button>
            <button @click="confirmDelete = true" class="icon-wrapper p-[10px] rounded-full border border-gray-400 flex justify-center items-center hover:bg-red-50" title="Delete">
              <span class="material-icons text-[15px] text-red-600">delete</span>
            </button>
          </div>

          <img v-if="imageSrc(event)" :src="imageSrc(event)" alt="Event image" class="rounded-lg max-h-[360px] object-cover w-full" />
          <div v-else class="w-full h-[360px] bg-gray-100 flex items-center justify-center text-gray-400 rounded">No Image</div>

          <button class="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700" @click="openSponsorshipModal">
            Add Sponsorship
          </button>
        </div>
      </div>
    </div>

    <!-- Modals + Snackbar -->
    <!-- Modals + Snackbar -->
    <AddEditEventModal
      v-if="showModal"
      :event="event"
      :settingsCurrency="settingsCurrency"
      @close="showModal = false"
      @updated="onUpdated"
    />

    <SponsorshipModal
      :visible="showSponsorModal"
      :settingsCurrency="settingsCurrency"
      :sponsorshipTypes="sponsorshipTypes"
      v-model:form="sponsorForm"
      @close="closeSponsorModal"
      @assign="assignSponsorship"
    />

    <ConfirmDialog
      :open="confirmDelete"
      title="Delete Event"
      message="Are you sure you want to delete this event? This action cannot be undone."
      @confirm="onDeleteEvent"
      @cancel="confirmDelete = false"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import AddEditEventModal from '@/components/events/AddEditEventModal.vue'
import SponsorshipModal from '@/components/events/SponsorshipModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useSettingsService } from '~/composables/useSettingsService'
import { useEventsService } from '~/composables/useEventsService'
import { useMediaService } from '~/composables/useMediaService'
import { useSponsorshipService } from '@/composables/useSponsorshipService'
import { useEventBookingService } from '@/composables/useEventBookingService'
import { useNotification } from '@/composables/useNotification'
import { formatDate, formatTime } from '@/utils/timezone'

const route = useRoute()
const router = useRouter()

const { getSettings } = useSettingsService()
const { getEventById, deleteEvent } = useEventsService()
const { fullUrl } = useMediaService()
const { fetchSponsorshipTypes, getSponsorshipsForEvent, assignToEvent, deleteEventSponsorshipById } = useSponsorshipService()
const { fetchBookings } = useEventBookingService()
const { showNotification } = useNotification()

const settingsCurrency = ref('INR')
const event = ref(null)
const error = ref(false)
const showModal = ref(false)

const showSponsorModal = ref(false)
const sponsorshipTypes = ref([])
const eventSponsorships = ref([])
const loadingSponsorships = ref(false)
const bookings = ref([])

const sponsorForm = ref({ sponsorshipTypeId: null, maxSlots: 1, price: null })

const confirmDelete = ref(false)

function imageSrc(item) {
  if (!item) return ''
  const rel = item?.featuredMedia?.url || item?.featuredMedia?.path || item?.photoUrl || null
  if (!rel) return ''
  const base = fullUrl(rel)
  const ver = item?.featuredMedia?.updatedAt || item?.updatedAt || Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

function openEditModal() { showModal.value = true }

async function onUpdated() {
  try {
    event.value = await getEventById(route.params.id)
    await loadBookings()
    showNotification('Event updated', 'success')
  } catch (e) {
    console.error('Failed to refresh event:', e)
    showNotification('Failed to refresh event', 'error')
  } finally {
    showModal.value = false
  }
}

async function onDeleteEvent() {
  console.log('Attempting delete', event.value.id, typeof event.value.id)

  if (!event.value) return

  // Ensure we have the latest bookings
  try {
    bookings.value = await fetchBookings(event.value.id)
    console.log('Fetched bookings:', bookings.value)
  } catch (e) {
    console.error('Failed to refresh bookings before delete:', e)
    bookings.value = []
  }

  // ❌ Block if bookings exist
  if (bookings.value && bookings.value.length > 0) {
    console.log('Blocking delete, bookings found:', bookings.value.length)
    showNotification(`❌ Cannot delete: Event has ${bookings.value.length} active booking(s)`, 'error')
    confirmDelete.value = false
    return
  }

  try {
    console.log('Proceeding with delete...')
    showNotification('Deleting event…', 'info')

    await deleteEvent(Number(event.value.id))   // backend handles sponsorship unassign
    showNotification('✅ Event deleted successfully', 'success')
    router.push('/admin/events')
  } catch (e) {
    console.error('Delete event failed:', e)
    showNotification(e?.message || 'Failed to delete event', 'error')
  } finally {
    confirmDelete.value = false
  }
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
    return `${Number(amount).toLocaleString()} ${code}`
  }
}

/* ---------- Sponsorship helpers ---------- */
async function openSponsorshipModal() {
  try {
    if (!sponsorshipTypes.value.length) {
      sponsorshipTypes.value = await fetchSponsorshipTypes()
    }
    sponsorForm.value = { sponsorshipTypeId: null, maxSlots: 1, price: null }
    showSponsorModal.value = true
  } catch (e) {
    console.error('Failed to open sponsorship modal:', e)
    showNotification(e?.message || 'Unable to load sponsorship types', 'error')
  }
}

function closeSponsorModal() { showSponsorModal.value = false }

async function assignSponsorship() {
  try {
    const payload = {
      eventId: Number(event.value.id),
      sponsorshipTypeId: Number(sponsorForm.value.sponsorshipTypeId),
      maxSlots: Number(sponsorForm.value.maxSlots),
      ...(sponsorForm.value.price != null && { price: Number(sponsorForm.value.price) })
    }
    await assignToEvent(payload)
    await loadEventSponsorships()
    closeSponsorModal()
    showNotification('Sponsorship assigned', 'success')
  } catch (e) {
    console.error('Assign sponsorship failed:', e)
    showNotification(e?.message || 'Failed to assign sponsorship', 'error')
  }
}

async function loadEventSponsorships() {
  if (!event.value) return
  loadingSponsorships.value = true
  try {
    eventSponsorships.value = await getSponsorshipsForEvent(event.value.id)
  } catch {
    eventSponsorships.value = []
  } finally {
    loadingSponsorships.value = false
  }
}

async function removeSponsorship(eventSponsorshipId) {
  try {
    await deleteEventSponsorshipById(eventSponsorshipId)
    await loadEventSponsorships()
    showNotification('Sponsorship removed', 'success')
  } catch (e) {
    console.error('Delete event sponsorship failed:', e)
    showNotification(e?.message || 'Failed to remove sponsorship', 'error')
  }
}

/* ---------- Booking helpers ---------- */
async function loadBookings() {
  if (!event.value) return
  try {
    bookings.value = await fetchBookings(event.value.id)
  } catch (e) {
    bookings.value = []
    console.error('Failed to load bookings:', e)
  }
}

/* ---------- Mounted ---------- */
onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
  } catch { settingsCurrency.value = 'INR' }

  try {
    event.value = await getEventById(route.params.id)
  } catch (e) {
    console.error('Error fetching event:', e)
    error.value = true
    showNotification('Failed to load event', 'error')
    return
  }
  await loadEventSponsorships()
  await loadBookings()
})
</script>



<style scoped>
.icon-wrapper { width: 36px; height: 36px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
