<template>
  <section class="py-0 w-full mx-auto bg-[#f5f5f5]">
    <!-- HERO -->
    <PageHero
      title="Events"
      caption="Experience the heart of our community."
      :imageUrl="heroBg"
    />

    <div class="max-w-[1190px] mx-auto py-16">

      <h1 class="text-4xl font-bold text-center mb-8">
        Upcoming Events
      </h1>

      <!-- FILTER BAR -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <!-- SEARCH -->
        <div class="relative flex-1">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events"
            class="w-full bg-white border border-gray-300 rounded-[8px] py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#570000]/30"
          />
        </div>

        <!-- VENUE -->
        <select
          v-model="venueFilter"
          class="w-full md:w-[220px] px-4 py-3 rounded-[8px] border border-gray-300 bg-white"
        >
          <option value="">All Venues</option>
          <option value="temple">Temple</option>
          <option value="outside">Outside Venue</option>
        </select>

        <!-- SORT -->
        <select
          v-model="sortBy"
          class="w-full md:w-[220px] px-4 py-3 rounded-[8px] border border-gray-300 bg-white"
        >
          <option value="date">Sort: Date</option>
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
        </select>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="animate-pulse h-[340px] bg-gray-200 rounded-xl" />
      </div>

      <!-- EMPTY -->
      <div v-else-if="pagedOccurrences.length === 0" class="text-center py-20 text-gray-500">
        No events found.
      </div>

      <!-- CARDS -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="occ in pagedOccurrences"
          :key="occ.key"
          class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
        >
          <!-- IMAGE -->
          <div class="h-48 bg-gray-100 overflow-hidden">
            <img
              v-if="occ.image"
              :src="occ.image"
              class="w-full h-full object-cover"
            />
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          </div>

          <!-- CONTENT -->
          <div class="p-4 flex flex-col flex-1">
            <h3 class="text-lg font-semibold mb-2">
              {{ occ.name }}
            </h3>

            <div class="text-sm text-gray-600 space-y-2 mb-4">
              <div class="flex items-center gap-2">
                <span class="material-icons text-[#570000] text-[18px]">calendar_today</span>
                {{ formatDate(occ.startAt) }}
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-[#570000] text-[18px]">schedule</span>
                {{ formatTime(occ.startAt) }}
              </div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-[#570000] text-[18px]">location_on</span>
                {{ occ.venue }}
              </div>
            </div>

            <div class="mt-auto flex justify-end">
              <NuxtLink
                :to="`/events/${occ.eventId}?occurrenceId=${occ.occurrenceId}`"
                class="bg-[#570000] text-white px-6 py-2 rounded-[30px] text-sm font-medium hover:bg-opacity-90"
              >
                Book Now
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGINATION -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center gap-2 flex-wrap">
        <button
          v-for="p in totalPages"
          :key="p"
          class="px-3 py-2 rounded-lg border"
          :class="p === page ? 'bg-[#570000] text-white border-[#570000]' : ''"
          @click="page = p"
        >
          {{ p }}
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PageHero from '@/components/PageHero.vue'
import heroBg from '@/assets/images/sample-2.webp'
import { useEventsService } from '@/composables/useEventsService'
import { useRuntimeConfig } from '#app'

const { fetchEvents } = useEventsService()
const config = useRuntimeConfig().public

const loading = ref(true)
const searchQuery = ref('')
const venueFilter = ref('')
const sortBy = ref('date')
const page = ref(1)
const perPage = 12

const rawEvents = ref([])

/* ---------------- FETCH ---------------- */
onMounted(async () => {
  rawEvents.value = await fetchEvents()
  loading.value = false
})

/* ---------------- FLATTEN EVENTS → OCCURRENCES ---------------- */
const allOccurrences = computed(() => {
  const now = new Date()

  return rawEvents.value.flatMap(event =>
    (event.occurrences || [])
      .filter(o => new Date(o.startAt) > now)
      .map(o => ({
        key: `${event.id}-${o.id}`,
        eventId: event.id,
        occurrenceId: o.id,
        name: event.name,
        startAt: o.startAt,
        price: o.priceOverride ?? event.price ?? 0,
        venue:
          event.venueRel?.title ||
          event.venue ||
          '—',
        venueType: event.isInVenue ? 'temple' : 'outside',
        image: fullImage(event.featuredMedia?.url),
      }))
  )
})

/* ---------------- FILTER + SORT ---------------- */
const filtered = computed(() => {
  let list = allOccurrences.value.filter(o => {
    const q = searchQuery.value.toLowerCase()
    const searchMatch =
      !q || o.name.toLowerCase().includes(q) || o.venue.toLowerCase().includes(q)

    const venueMatch =
      !venueFilter.value || o.venueType === venueFilter.value

    return searchMatch && venueMatch
  })

  if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'price') {
    list.sort((a, b) => a.price - b.price)
  } else {
    list.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
  }

  return list
})

/* ---------------- PAGINATION ---------------- */
const totalPages = computed(() =>
  Math.ceil(filtered.value.length / perPage)
)

const pagedOccurrences = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

watch([searchQuery, venueFilter, sortBy], () => {
  page.value = 1
})

/* ---------------- HELPERS ---------------- */
function fullImage(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${config.apiBase}${path}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.material-icons {
  vertical-align: middle;
}
</style>
