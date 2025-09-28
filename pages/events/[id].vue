<!-- File: pages/events/[id].vue -->
<template>
  <section class="py-10 px-4 max-w-6xl mx-auto">
    <!-- Loading / Not Found -->
    <div v-if="loading" class="flex items-center justify-center h-60 text-gray-500">
      Loading event details...
    </div>
    <div v-else-if="!event" class="flex items-center justify-center h-60 text-red-500">
      Event not found
    </div>

    <div v-else>
      <!-- Event Info Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Left: Image -->
        <div class="w-full">
          <div class="relative overflow-hidden rounded-xl bg-gray-100 shadow">
            <img
              v-if="event.featuredMedia?.url || event.imageUrl"
              :src="fullUrl(event.featuredMedia?.url || event.imageUrl)"
              :alt="event.name"
              class="w-full h-[380px] object-cover"
            />
            <div
              v-else
              class="w-full h-[380px] flex items-center justify-center text-gray-400"
            >
              No Image
            </div>
          </div>
        </div>

        <!-- Right: Event Info -->
        <div class="space-y-6">
          <!-- Title & Price -->
          <div class="space-y-2">
            <h1 class="text-3xl font-bold text-gray-900">{{ event.name }}</h1>

            <!-- Highlighted Price (or Free) -->
            <div class="text-2xl font-semibold text-[#570000]">
              {{ event.price != null ? formatMoney(event.price, settingsCurrency) : 'Free' }}
            </div>

            <p v-if="event.description" class="text-gray-600 whitespace-pre-line">
              {{ event.description }}
            </p>
          </div>

          <!-- Quick chips (date/time/venue/capacity/tags) -->
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
              <span class="material-icons text-[16px]">event</span>
              {{ formatDate(event.date, 'dd LLL yyyy') }}
              <template v-if="event.endDate"> – {{ formatDate(event.endDate, 'dd LLL yyyy') }}</template>
            </span>

            <span v-if="event.startTime" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
              <span class="material-icons text-[16px]">schedule</span>
              {{ formatTime(event.startTime, 'hh:mm a') }}
            </span>
            <span v-if="event.endTime" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
              <span class="material-icons text-[16px]">more_time</span>
              {{ formatTime(event.endTime, 'hh:mm a') }}
            </span>

            <!-- Venue chip -->
            <span
              v-if="event.venue || event.venueRel"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
            >
              <span class="material-icons text-[16px]">place</span>
              {{ event.venueRel?.title || event.venue }}
            </span>

            <span
              v-if="event.capacity != null"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm"
            >
              <span class="material-icons text-[16px]">groups</span>
              Capacity {{ event.capacity }}
            </span>

            <!-- ✅ Remaining Seats -->
            <span
              v-if="event.capacity != null"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-sm"
            >
              <span class="material-icons text-[16px]">event_seat</span>
              Remaining {{ remainingSeats }}
            </span>

            <span
              v-for="tag in (event.tags || [])"
              :key="tag"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm"
            >
              <span class="material-icons text-[16px]">sell</span>
              {{ tag }}
            </span>
          </div>

          <!-- Venue Address details -->
          <div v-if="event.venueRel?.address || event.venue" class="border rounded-lg p-4 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-700 mb-1">Venue Address</h3>
            <p class="text-gray-800">
              {{ event.venueRel?.address || event.venue }}
              <template v-if="event.venueRel?.zipcode">
                – {{ event.venueRel.zipcode }}
              </template>
            </p>
            <a
              v-if="event.mapLink || event.venueRel?.mapLink"
              :href="event.mapLink || event.venueRel?.mapLink"
              target="_blank"
              class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
            >
              <span class="material-icons text-[16px]">map</span>
              View on Map
            </a>
          </div>

          <!-- CTA -->
          <div class="pt-2">
            <NuxtLink
              :to="`/events/checkout?eventId=${event.id}`"
              class="inline-flex items-center gap-2 bg-[#570000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#650000] transition"
            >
              <span class="material-icons text-[18px]">event_available</span>
              Book Your Seats
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Sponsorships Section -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Sponsorships</h2>
        <div v-if="loadingSponsorships" class="text-gray-500">Loading sponsorships…</div>
        <div v-else-if="!sponsorships.length" class="text-gray-500">No sponsorships available</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="s in sponsorships"
            :key="s.id"
            class="border rounded-lg bg-white shadow p-4 flex flex-col justify-between"
          >
            <div>
              <h3 class="font-semibold text-gray-900">{{ s.sponsorshipType?.name }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                Price: {{ formatMoney(s.price, settingsCurrency) }}<br />
                Slots: {{ s.maxSlots }} 
              </p>
            </div>
            <NuxtLink
              :to="`/sponsorships/checkout?sponsorshipId=${s.id}`"
              class="mt-4 inline-flex justify-center items-center px-4 py-2 bg-[#570000] text-white text-sm font-medium rounded-lg hover:bg-[#650000] transition"
            >
              Book Now
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#app'
import { useEventsService } from '~/composables/useEventsService'
import { useSettingsService } from '~/composables/useSettingsService'
import { useSponsorshipService } from '~/composables/useSponsorshipService'
import { loadTimezone, formatDate, formatTime } from '~/utils/timezone'

const route = useRoute()
const config = useRuntimeConfig().public
const { getEventById } = useEventsService()
const { getSettings }  = useSettingsService()
const { getSponsorshipsForEvent } = useSponsorshipService()

const event = ref(null)
const sponsorships = ref([])
const loading = ref(true)
const loadingSponsorships = ref(false)
const settingsCurrency = ref('INR')

const remainingSeats = computed(() => {
  if (!event.value || event.value.capacity == null) return 0
  const booked = event.value.bookedCount || (event.value.registrations?.length || 0)
  return Math.max(event.value.capacity - booked, 0)
})

function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${config.apiBase}${path}`
}

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return currencySymbol(code) + '0'
  try {
    return new Intl.NumberFormat(
      code === 'INR' ? 'en-IN' : 'en-US',
      { style: 'currency', currency: code, maximumFractionDigits: 0 }
    ).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}

onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
    await loadTimezone() // ✅ init timezone from settings
    event.value = await getEventById(route.params.id)

    if (event.value?.id) {
      loadingSponsorships.value = true
      sponsorships.value = await getSponsorshipsForEvent(event.value.id)
    }
  } catch (e) {
    console.error('❌ Failed to load event:', e)
  } finally {
    loading.value = false
    loadingSponsorships.value = false
  }
})
</script>

<style scoped>
.material-icons {
  vertical-align: -3px;
}
</style>
