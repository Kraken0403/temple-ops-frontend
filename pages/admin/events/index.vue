<template>
  <div class="space-y-6">
    <!-- Top Bar -->
    <UtilsBar title="Events List" buttonLabel="Add New Event" @action="openCreate" />

    <!-- Filters -->
    <div class="bg-white border mb-[15px] border-gray-200 rounded-[3px] p-4 flex flex-col md:flex-row md:items-end md:gap-4 gap-3">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-600 mb-1">Search</label>
        <input
          v-model="filters.q"
          @input="applyFilters"
          type="text"
          placeholder="Search by name, venue..."
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">From Date</label>
        <input
          v-model="filters.from"
          @change="applyFilters"
          type="date"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">To Date</label>
        <input
          v-model="filters.to"
          @change="applyFilters"
          type="date"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-1">Capacity</label>
        <select
          v-model="filters.capacity"
          @change="applyFilters"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="small">0–100</option>
          <option value="medium">101–500</option>
          <option value="large">500+</option>
        </select>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center text-red-600">Error loading events.</div>

    <!-- Cards -->
    <div class="grid mx-[15px] grid-cols-1 md:grid-cols-2 gap-2">
      <NuxtLink
        v-for="ev in filteredEvents"
        :key="ev.id"
        :to="`/admin/events/${ev.id}`"
        class="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-[3px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition transform duration-200 no-underline text-inherit"
      >
        <!-- Image -->
        <div class="sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-gray-100 border-b sm:border-b-0 sm:border-r border-gray-200">
          <img
            v-if="imageSrc(ev)"
            :src="imageSrc(ev)"
            class="w-full h-full object-cover"
            alt="Event image"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        </div>

        <!-- Details -->
        <div class="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{{ ev.name }}</h3>

            <p class="text-sm text-gray-600 mb-1">
              <span class="font-medium text-gray-700">Date:</span>
              {{ formatDate(ev.date, 'MMM dd, yyyy') }}
            </p>

            <p class="text-sm text-gray-600 mb-1">
              <span class="font-medium text-gray-700">Venue:</span>
              {{ ev.venueRel?.title || ev.venue || '—' }}
            </p>

            <p v-if="ev.capacity != null" class="text-sm text-gray-600">
              <span class="font-medium text-gray-700">Capacity:</span> {{ ev.capacity }}
            </p>
          </div>

          <p class="text-xs text-gray-400 mt-3">
            Created: {{ formatDate(ev.createdAt, 'MMM dd, yyyy') }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- Add/Edit Modal -->
    <AddEditEventModal
      v-if="showModal"
      :event="null"
      :settingsCurrency="settingsCurrency"
      @close="showModal = false"
      @created="onCreated"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, computed, onMounted } from 'vue'
import { useRouter } from '#app'
import UtilsBar from '~/components/UtilsBar.vue'
import AddEditEventModal from '@/components/events/AddEditEventModal.vue'
import { useEventsService } from '~/composables/useEventsService'
import { useSettingsService } from '@/composables/useSettingsService'
import { useMediaService } from '@/composables/useMediaService'
import { formatDate } from '@/utils/timezone'

const router = useRouter()
const { fetchEvents } = useEventsService()
const { getSettings } = useSettingsService()
const { fullUrl } = useMediaService()

const events = ref([])
const error = ref(null)
const showModal = ref(false)
const settingsCurrency = ref('INR')

const filters = ref({
  q: '',
  from: '',
  to: '',
  capacity: ''
})

function imageSrc(ev) {
  const rel = ev?.featuredMedia?.url || ev?.featuredMedia?.path || ev?.photoUrl || null
  if (!rel) return ''
  const base = fullUrl(rel)
  const ver  = ev?.featuredMedia?.updatedAt || ev?.updatedAt || Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

async function load() {
  try {
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch { settingsCurrency.value = 'INR' }

    const res = await fetchEvents()
    // Sort by createdAt descending
    events.value = res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    error.value = e
    console.error('Failed to load:', e)
  }
}

function openCreate() { showModal.value = true }
async function onCreated() { showModal.value = false; await load() }

function applyFilters() {
  // trigger computed refresh
}

const filteredEvents = computed(() => {
  return events.value.filter(ev => {
    // Search
    if (filters.value.q) {
      const q = filters.value.q.toLowerCase()
      if (!ev.name.toLowerCase().includes(q) && !(ev.venue || '').toLowerCase().includes(q)) {
        return false
      }
    }
    // Date range
    if (filters.value.from && new Date(ev.date) < new Date(filters.value.from)) return false
    if (filters.value.to && new Date(ev.date) > new Date(filters.value.to)) return false
    // Capacity
    if (filters.value.capacity === 'small' && ev.capacity > 100) return false
    if (filters.value.capacity === 'medium' && (ev.capacity < 101 || ev.capacity > 500)) return false
    if (filters.value.capacity === 'large' && ev.capacity < 501) return false
    return true
  })
})

onMounted(load)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
