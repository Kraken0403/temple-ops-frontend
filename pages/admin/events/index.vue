<template>
  <div class="space-y-4">
    <UtilsBar title="Events List" buttonLabel="Add New Event" @action="openCreate" />

    <div v-if="error" class="text-center text-red-600">Error loading events.</div>

    <div class="cards bg-white min-h-[100vh] flex flex-col gap-2 p-4">
      <NuxtLink
        v-for="ev in events"
        :key="ev.id"
        :to="`/admin/events/${ev.id}`"
        class="flex justify-between items-start p-4 bg-white border border-gray-300 rounded shadow-sm hover:shadow-md transition no-underline text-inherit"
      >
        <div class="flex gap-4">
          <!-- Image -->
          <div class="w-24 h-24 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-400">
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
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ ev.name }}</h3>

            <p class="text-sm text-gray-600 mb-1">
              Date: <span class="font-medium text-gray-700">{{ formatDate(ev.date) }}</span>
            </p>

            <p class="text-sm text-gray-600 mb-1">
              Venue:
              <span class="font-medium text-gray-700">
                {{ ev.venueRel?.title || ev.venue || '—' }}
              </span>
            </p>

            <p v-if="ev.capacity != null" class="text-sm text-gray-600">
              Capacity: <span class="font-medium text-gray-700">{{ ev.capacity }}</span>
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-end space-x-2">
          <button @click.stop="goToEdit(ev.id)" class="text-blue-600 hover:text-blue-800" title="Edit">
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[18px]">edit</span>
            </div>
          </button>

          <button @click.stop="handleDelete(ev.id)" class="text-red-600 hover:text-red-800" title="Delete">
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[18px]">delete</span>
            </div>
          </button>
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

import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import UtilsBar from '~/components/UtilsBar.vue'
import AddEditEventModal from '@/components/events/AddEditEventModal.vue'
import { useEventsService } from '~/composables/useEventsService'
import { useSettingsService } from '@/composables/useSettingsService'
import { useMediaService } from '@/composables/useMediaService'

const router = useRouter()
const { fetchEvents, deleteEvent } = useEventsService()
const { getSettings } = useSettingsService()
const { fullUrl } = useMediaService()

const events = ref([])
const error = ref(null)
const showModal = ref(false)
const settingsCurrency = ref('INR')

function imageSrc(ev) {
  const rel = ev?.featuredMedia?.url || ev?.featuredMedia?.path || ev?.photoUrl || null
  if (!rel) return ''
  const base = fullUrl(rel)
  const ver  = ev?.featuredMedia?.updatedAt || ev?.updatedAt || Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return '—' }
}

async function load() {
  try {
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch { settingsCurrency.value = 'INR' }

    events.value = await fetchEvents()
  } catch (e) {
    error.value = e
    console.error('Failed to load:', e)
  }
}

function openCreate() { showModal.value = true }
async function onCreated() { showModal.value = false; await load() }
function goToEdit(id) { router.push(`/admin/events/${id}`) }

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this event?')) return
  try {
    await deleteEvent(id)
    events.value = events.value.filter(e => e.id !== id)
  } catch (e) {
    console.error('Delete failed:', e)
    alert(e?.message || 'Failed to delete event')
  }
}

onMounted(load)
</script>

<style scoped>
.icon-wrapper { width: 36px; height: 36px; cursor: pointer; }
.material-icons { font-size: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
