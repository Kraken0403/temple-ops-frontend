<template>
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">Event Bookings</h1>

    <div v-if="loading" class="text-gray-500">Loading events…</div>
    <div v-else-if="error" class="text-red-600">Failed to load events.</div>

    <div v-else class="grid grid-cols-1 gap-4">
      <NuxtLink
        v-for="event in events"
        :key="event.id"
        :to="`/admin/events/bookings/${event.id}`"
        class="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow transition no-underline text-inherit"
      >
        <div class="flex gap-4">
          <div class="w-24 h-24 rounded bg-gray-100 overflow-hidden border">
            <img
              v-if="imageSrc(event)"
              :src="imageSrc(event)"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-xs text-gray-400"
            >
              No Image
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold">{{ event.name }}</h3>
            <p class="text-sm text-gray-600">
              Total Occurrences:
              <span class="font-medium">{{ event.occurrences?.length ?? 0 }}</span>
            </p>
            <p class="text-sm text-gray-600">
              Event Capacity:
              <span class="font-medium">{{ event.capacity ?? '—' }}</span>
            </p>
          </div>
        </div>

        <span class="px-4 py-2 text-sm bg-blue-600 text-white rounded">
          View Occurrences →
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useEventsService } from '~/composables/useEventsService'
import { useMediaService } from '@/composables/useMediaService'

const { fetchEvents } = useEventsService()
const { fullUrl } = useMediaService()

const events = ref([])
const loading = ref(true)
const error = ref(false)

function imageSrc(ev) {
  const path =
    ev?.featuredMedia?.url ||
    ev?.featuredMedia?.path ||
    ev?.gallery?.[0]?.media?.url ||
    ev?.gallery?.[0]?.media?.path

  return path ? fullUrl(path) : ''
}

onMounted(async () => {
  try {
    events.value = await fetchEvents()
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
