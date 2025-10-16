<template>
  <div class="space-y-4 p-6">
    <h1 class="text-2xl font-bold">Events Bookings</h1>

    <div v-if="loading" class="text-gray-500">Loading events…</div>
    <div v-else-if="error" class="text-red-600">Error loading data.</div>

    <div v-else class="cards bg-white h-min-[100vh] flex flex-col gap-4 p-4">
      <NuxtLink
        v-for="item in eventsWithCount"
        :key="item.event.id"
        :to="`/admin/events/bookings/${item.event.id}`"
        class="flex justify-between items-start p-4 bg-white border border-[#cccccc] rounded-lg shadow-sm hover:shadow-md transition no-underline text-inherit"
      >
        <!-- Left: Image + Info -->
        <div class="flex gap-4">
          <!-- Image -->
          <div class="w-24 h-24 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-400">
            <img
              v-if="imageSrc(item.event)"
              :src="imageSrc(item.event)"
              alt="Event Image"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
            >
              No Image
            </div>
          </div>

          <!-- Text Info -->
          <div>
            <h3 class="text-lg font-semibold mb-2">{{ item.event.name }}</h3>
            <p class="text-sm text-gray-600 mb-1">
              Date:
              <span class="font-medium text-gray-800">
                {{ formatDate(item.event.date, 'MMM dd, yyyy') }}
              </span>
            </p>
            <p class="text-sm text-gray-600 mb-1">
              Capacity:
              <span class="font-medium text-gray-800">{{ item.event.capacity ?? '—' }}</span>
            </p>
            <p class="text-sm text-gray-600">
              Bookings:
              <span class="font-medium text-gray-800">{{ item.count }}</span>
            </p>
          </div>
        </div>

        <!-- Right: Action -->
        <button
          @click.stop="goToDetails(item.event.id)"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          View Bookings
        </button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useEventsService } from '~/composables/useEventsService'
import { useEventBookingService } from '~/composables/useEventBookingService'
import { useMediaService } from '@/composables/useMediaService'
import { formatDate } from '@/utils/timezone'

const router = useRouter()
const { fetchEvents } = useEventsService()
const { fetchBookings } = useEventBookingService()
const { fullUrl } = useMediaService()

const eventsWithCount = ref([])
const loading = ref(true)
const error = ref(false)

/**
 * Resolve a display image URL for an event.
 * Order of preference:
 * 1) featuredMedia.url/path
 * 2) photoUrl
 * 3) first gallery media url/path (if your API includes it here)
 * Adds `?v=` cache buster from updatedAt fields.
 */
function imageSrc(ev) {
  const rel =
    ev?.featuredMedia?.url ||
    ev?.featuredMedia?.path ||
    ev?.photoUrl ||
    ev?.gallery?.[0]?.media?.url ||
    ev?.gallery?.[0]?.media?.path ||
    ''

  if (!rel) return ''

  const base = fullUrl(rel)
  const ver =
    ev?.featuredMedia?.updatedAt ||
    ev?.updatedAt ||
    ev?.gallery?.[0]?.media?.updatedAt ||
    Date.now()

  // Append cache-buster safely whether or not URL already contains a query string
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

async function loadData() {
  loading.value = true
  try {
    // Your EventsService.findAll() already includes featuredMedia and (optionally) venueRel.
    const evs = await fetchEvents()
    const counts = await Promise.all(
      evs.map(e => fetchBookings(e.id).then(b => b.length).catch(() => 0))
    )
    eventsWithCount.value = evs.map((event, i) => ({ event, count: counts[i] }))
  } catch (e) {
    console.error('Error loading events/bookings:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

function goToDetails(id) {
  router.push(`/admin/events/bookings/${id}`)
}

onMounted(loadData)
</script>

<style scoped>
/* layout entirely via Tailwind utilities */
</style>
