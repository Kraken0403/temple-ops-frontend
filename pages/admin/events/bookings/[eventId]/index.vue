<template>
    <section class="p-6 space-y-4">
      <button
        @click="goBack"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Events
      </button>
  
      <h1 class="text-2xl font-bold">
        Occurrences — {{ event?.name }}
      </h1>
  
      <div v-if="loading" class="text-gray-500">Loading occurrences…</div>
      <div v-else-if="error" class="text-red-600">Failed to load data.</div>
  
      <div v-else class="grid grid-cols-1 gap-4">
        <div
          v-for="occ in occurrences"
          :key="occ.id"
          class="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
        >
          <!-- LEFT -->
          <div>
            <p class="font-semibold">
              {{ formatDate(occ.occurrenceDate, 'MMM dd, yyyy') }}
            </p>
  
            <p class="text-sm text-gray-600">
              {{ formatTime(occ.startAt) }} → {{ formatTime(occ.endAt) }}
            </p>
  
            <p class="text-sm mt-1">
              Capacity:
              <span class="font-medium">
                {{ occ.capacity ?? '—' }}
              </span>
              |
              Booked:
              <span class="font-medium">
                {{ occ.bookedCount }}
              </span>
              |
              Remaining:
              <span
                class="font-medium"
                :class="remaining(occ) === 0 ? 'text-red-600' : 'text-emerald-600'"
              >
                {{ remaining(occ) }}
              </span>
            </p>
          </div>
  
          <!-- RIGHT -->
          <NuxtLink
                :to="`/admin/events/bookings/${eventId}/${occ.id}`"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                View Bookings →
          </NuxtLink>

        </div>
  
        <div
          v-if="occurrences.length === 0"
          class="text-center text-gray-500 py-8"
        >
          No occurrences found.
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from '#app'
  import { useEventsService } from '~/composables/useEventsService'
  import { formatDate } from '@/utils/timezone'
  
  const route = useRoute()
  const router = useRouter()
  
  const eventId = Number(route.params.eventId)
  
  const { getEventById } = useEventsService()
  
  const event = ref(null)
  const occurrences = ref([])
  const loading = ref(true)
  const error = ref(false)
  
  function remaining(occ) {
    if (occ.capacity == null) return '∞'
    return Math.max(occ.capacity - occ.bookedCount, 0)
  }
  
  function formatTime(dt) {
    return new Date(dt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  function goBack() {
    router.push('/admin/events/bookings')
  }
  
  onMounted(async () => {
    try {
      event.value = await getEventById(eventId)
      console.log(eventId)
      occurrences.value = Array.isArray(event.value?.occurrences)
        ? event.value.occurrences
        : []
      console.log('The Array', occurrences.value)

      console.log('The ID', occurrences.value[0].id)
    } catch (e) {
      console.error(e)
      error.value = true
    } finally {
      loading.value = false
    }
  })
  </script>
  