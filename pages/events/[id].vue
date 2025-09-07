<!-- pages/events/[id].vue -->
<template>
  <section class="py-10 px-4 max-w-6xl mx-auto">
    <!-- Loading / Not Found -->
    <div v-if="loading" class="flex items-center justify-center h-60 text-gray-500">
      Loading event details...
    </div>
    <div v-else-if="!event" class="flex items-center justify-center h-60 text-red-500">
      Event not found
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left: Image -->
      <div class="w-full">
        <div class="relative overflow-hidden rounded-xl bg-gray-100 shadow">
          <img
            v-if="event.imageUrl"
            :src="fullUrl(event.imageUrl)"
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
            {{ formatDate(event.date) }}
            <template v-if="event.endDate"> – {{ formatDate(event.endDate) }}</template>
          </span>

          <span v-if="event.startTime" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
            <span class="material-icons text-[16px]">schedule</span>
            {{ formatTime(event.startTime) }}
          </span>
          <span v-if="event.endTime" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
            <span class="material-icons text-[16px]">more_time</span>
            {{ formatTime(event.endTime) }}
          </span>

          <span
            v-if="event.venue"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
          >
            <span class="material-icons text-[16px]">place</span>
            {{ event.venue }}
          </span>

          <span
            v-if="event.capacity != null"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm"
          >
            <span class="material-icons text-[16px]">groups</span>
            Capacity {{ event.capacity }}
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

        <!-- Map -->
        <div v-if="event.mapLink" class="border rounded-lg p-4 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-700 mb-1">Location</h3>
          <a
            :href="event.mapLink"
            target="_blank"
            class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
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
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRuntimeConfig } from '#app'
import { useEventsService } from '~/composables/useEventsService'
import { useSettingsService } from '~/composables/useSettingsService'

const route = useRoute()
const config = useRuntimeConfig().public
const { getEventById } = useEventsService()
const { getSettings }  = useSettingsService()

const event = ref(null)
const loading = ref(true)
const settingsCurrency = ref('INR')

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

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
    event.value = await getEventById(route.params.id)
  } catch (e) {
    console.error('❌ Failed to load event:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.material-icons {
  vertical-align: -3px;
}
.prose :where(p):not(:first-child) {
  margin-top: 0.5rem;
}
</style>
