<!-- File: pages/events.vue -->
<template>
  <section class="w-full mx-auto">
    <PageHero
      title="Events"
      caption="Experience the heart of our community."
      :imageUrl="heroBg"
    />

    <div class="mx-auto px-4">
      <div class="max-w-[1190px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-auto py-[100px]">
        <div
          v-for="evt in events"
          :key="evt.id"
          class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
        >
          <!-- Image -->
          <template v-if="evt.featuredMedia?.url || evt.imageUrl">
            <img
              :src="fullImageUrl(evt.featuredMedia?.url || evt.imageUrl)"
              :alt="evt.name"
              class="w-full h-48 object-cover"
            />
          </template>
          <div v-else class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>

          <!-- Content -->
          <div class="p-4 flex-1 flex flex-col">
            <div class="flex items-start justify-between gap-3 mb-2">
              <h3 class="text-[20px] font-semibold">{{ evt.name }}</h3>
              <span
                v-if="!evt.isOpenForRegistration"
                class="inline-flex items-center rounded-full bg-gray-200 text-gray-700 text-xs px-3 py-1"
              >
                Closed
              </span>
            </div>

            <div class="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mb-4">
              <div class="flex items-center gap-2">
                <i class="material-icons text-[#570000]">temple_hindu</i>
                <span>{{ evt.isInVenue ? 'In-Temple' : 'Custom Venue' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="material-icons text-[#570000]">schedule</i>
                <span>{{ formatTime(evt.startTime || evt.date) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="material-icons text-[#570000]">calendar_today</i>
                <span>{{ formatDate(evt.date) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="material-icons text-[#570000]">location_on</i>
                <span>{{ evt.venue || evt.venueRel?.title || '—' }}</span>
              </div>
            </div>

            <p class="text-sm text-gray-700 flex-1 line-clamp-3">
              {{ evt.description || ' ' }}
            </p>

            <div class="mt-4 flex justify-end">
              <!-- ✅ Back to original route -->
              <NuxtLink
                v-if="evt.isOpenForRegistration"
                :to="`/events/${evt.id}`"
                class="bg-[#004B21] text-white px-6 py-2 rounded-[30px] text-sm font-medium hover:bg-green-700"
              >
                Attend
              </NuxtLink>
              <button
                v-else
                disabled
                class="bg-gray-300 text-gray-600 px-6 py-2 rounded-[30px] text-sm font-medium cursor-not-allowed"
                title="Registrations closed"
              >
                Registrations Closed
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-red-600 mt-4 text-center">
        Error loading events.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEventsService } from '@/composables/useEventsService'
import { useRuntimeConfig } from '#app'
import PageHero from '@/components/PageHero.vue'
import heroBg   from '@/assets/images/sample-2.webp'

const events = ref([])
const error  = ref(false)
const { fetchEvents } = useEventsService()
const config = useRuntimeConfig().public

function fullImageUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${config.apiBase}${path}`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
    year:    'numeric'
  })
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour:   'numeric',
    minute: '2-digit'
  })
}

// Build a comparable startAt for sorting (date + optional startTime)
function buildStartAt(evt) {
  const d = evt?.date ? new Date(evt.date) : null
  if (!d) return null
  if (evt?.startTime) {
    const t = new Date(evt.startTime)
    return new Date(
      d.getFullYear(), d.getMonth(), d.getDate(),
      t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds()
    )
  }
  // if no startTime, treat as midnight of date
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

onMounted(async () => {
  try {
    const rows = await fetchEvents()

    const now = new Date()
    // ensure we have isOpenForRegistration; fallback if backend hasn’t shipped yet
    const decorated = rows.map(r => {
      const startAt = buildStartAt(r)
      const isOpen = typeof r.isOpenForRegistration === 'boolean'
        ? r.isOpenForRegistration
        : (startAt ? now < startAt : false)
      return { ...r, isOpenForRegistration: isOpen, __startAt: startAt }
    })

    // Sort: open first; among open → nearest future first; among closed → most recent past first
    decorated.sort((a, b) => {
      if (a.isOpenForRegistration !== b.isOpenForRegistration) {
        return a.isOpenForRegistration ? -1 : 1
      }
      const aTime = a.__startAt ? a.__startAt.getTime() : 0
      const bTime = b.__startAt ? b.__startAt.getTime() : 0

      if (a.isOpenForRegistration) {
        // future events ascending
        return aTime - bTime
      }
      // closed: show most recent past first (descending)
      return bTime - aTime
    })

    events.value = decorated
  } catch (e) {
    console.error(e)
    error.value = true
  }
})
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
