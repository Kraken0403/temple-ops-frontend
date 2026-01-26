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

            <div class="text-2xl font-semibold text-[#570000]">
              {{ event.price != null ? formatMoney(event.price, settingsCurrency) : 'Free' }}
            </div>

            <p v-if="event.description" class="text-gray-600 whitespace-pre-line">
              {{ event.description }}
            </p>
          </div>

          <!-- Chips -->
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
              <span class="material-icons text-[16px]">event</span>
              {{ displayDate ? formatDate(displayDate, 'dd LLL yyyy') : 'Date TBA' }}
            </span>

            <span
              v-if="displayStartTime"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
            >
              <span class="material-icons text-[16px]">schedule</span>
              {{ formatTime(displayStartTime, 'hh:mm a') }}
              <template v-if="displayEndTime">
                – {{ formatTime(displayEndTime, 'hh:mm a') }}
              </template>
            </span>

            <span
              v-if="event.venue || event.venueRel"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
            >
              <span class="material-icons text-[16px]">place</span>
              {{ event.venueRel?.title || event.venue }}
            </span>

            <span
              v-if="nextOccurrence?.capacity != null"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm"
            >
              <span class="material-icons text-[16px]">groups</span>
              Capacity {{ nextOccurrence.capacity }}
            </span>

            <span
              v-if="nextOccurrence?.capacity != null"
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

          <!-- Venue Address -->
          <div v-if="event.venueRel?.address || event.venue" class="border rounded-lg p-4 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-700 mb-1">Venue Address</h3>
            <p class="text-gray-800">
              {{ event.venueRel?.address || event.venue }}
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
              v-if="isOpenForRegistration && activeOccurrence"
              :to="`/events/checkout?eventId=${event.id}&occurrenceId=${activeOccurrence.id}`"
              class="inline-flex items-center gap-2 bg-[#570000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#650000] transition"
            >
              <span class="material-icons text-[18px]">event_available</span>
              Book Your Seats
            </NuxtLink>

            <button
              v-else
              disabled
              class="inline-flex items-center gap-2 bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
            >
              Registrations Closed
            </button>
          </div>
        </div>
      </div>

      <!-- Sponsorships -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Sponsorships</h2>

        <div v-if="loadingSponsorships" class="text-gray-500">
          Loading sponsorships…
        </div>

        <div v-else-if="!sponsorships.length" class="text-gray-500">
          No sponsorships available
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="s in sponsorships"
            :key="s.id"
            class="border rounded-lg bg-white shadow p-4 flex flex-col justify-between"
          >
            <div>
              <h3 class="font-semibold text-gray-900">
                {{ s.sponsorshipType?.name }}
              </h3>
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
  import { useNextOccurrence } from '~/composables/useEventOccurrences'

  const route = useRoute()
  const config = useRuntimeConfig().public

  const { getEventById } = useEventsService()
  const { getSettings } = useSettingsService()
  const { getSponsorshipsForEvent } = useSponsorshipService()

  const event = ref(null)
  const sponsorships = ref([])
  const loading = ref(true)
  const loadingSponsorships = ref(false)
  const settingsCurrency = ref('INR')

  const nextOccurrence = useNextOccurrence(event)

  const selectedOccurrenceId = computed(() =>
    Number(route.query.occurrenceId || null)
  )

  const activeOccurrence = computed(() => {
  if (!event.value?.occurrences?.length) return null

  // If URL explicitly specifies an occurrence → use it
  if (selectedOccurrenceId.value) {
    return (
      event.value.occurrences.find(
        o => o.id === selectedOccurrenceId.value
      ) || null
    )
  }

  // Otherwise fallback to next upcoming occurrence
  return nextOccurrence.value
})


const remainingSeats = computed(() => {
  const occ = activeOccurrence.value
  if (!occ || occ.capacity == null) return 0
  return Math.max(occ.capacity - (occ.bookedCount || 0), 0)
})


const isOpenForRegistration = computed(() => {
  const occ = activeOccurrence.value
  if (!occ) return false
  if (occ.capacity == null) return true
  return remainingSeats.value > 0
})

  const displayDate = computed(() =>
    nextOccurrence.value?.occurrenceDate || event.value?.date || null
  )

  const displayStartTime = computed(() =>
    nextOccurrence.value?.startAt || null
  )

  const displayEndTime = computed(() =>
    nextOccurrence.value?.endAt || null
  )

  /* ───────────── Helpers ───────────── */

  function fullUrl(path) {
    if (!path) return ''
    return path.startsWith('http') ? path : `${config.apiBase}${path}`
  }

  function formatMoney(amount, code) {
    if (amount == null) return 'Free'
    return new Intl.NumberFormat(
      code === 'INR' ? 'en-IN' : 'en-US',
      { style: 'currency', currency: code, maximumFractionDigits: 0 }
    ).format(amount)
  }

  /* ───────────── Init ───────────── */

  onMounted(async () => {
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
      await loadTimezone()

      event.value = await getEventById(route.params.id)
      console.log('Single Event: ', event.value)
      if (event.value?.id) {
        loadingSponsorships.value = true
        sponsorships.value = await getSponsorshipsForEvent(event.value.id)
      }
    } catch (e) {
      console.error('Failed to load event:', e)
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
