<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">
      <!-- Back + Actions -->
      <div class="px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/admin/priests" class="text-blue-600 hover:underline">← Back to list</NuxtLink>
        <button
          v-if="!loading && priest"
          @click="openEdit"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit Priest
        </button>
      </div>

      <div v-if="error" class="p-6 text-center text-red-600">Error loading priest</div>
      <div v-else-if="loading" class="p-6 text-center text-gray-600">Loading...</div>

      <div v-else class="md:flex">
        <!-- Left: Info -->
        <div class="md:w-2/3 p-6">
          <h2 class="text-3xl font-bold mb-4">{{ priest.name }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Specialty</h3>
              <p class="mt-1 text-gray-800">{{ priest.specialty || '—' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Languages</h3>
              <p class="mt-1 text-gray-800">{{ (priest.languages || []).join(', ') || '—' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Qualifications</h3>
              <p class="mt-1 text-gray-800">{{ (priest.qualifications || []).join(', ') || '—' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Email</h3>
              <p class="mt-1 text-gray-800">{{ priest.email || '—' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Contact No.</h3>
              <p class="mt-1 text-gray-800">{{ priest.contactNo || '—' }}</p>
            </div>
            <div class="sm:col-span-2">
              <h3 class="text-sm font-semibold text-gray-500">Address</h3>
              <p class="mt-1 text-gray-800">{{ priest.address || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Right: Photo -->
        <div class="md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-200 flex items-center justify-center">
          <img
            v-if="imageSrc(priest)"
            :src="imageSrc(priest)"
            alt="Priest photo"
            class="rounded-lg max-h-[400px] object-cover w-full"
            @error="onImgError"
          />
          <div v-else class="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>
        </div>
      </div>

      <!-- Slots -->
      <div v-if="!loading" class="p-6 border-t border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold">Available Slots</h2>
          <button @click="showSlotModal = true" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Slot
          </button>
        </div>

        <ul v-if="priest.slots?.length" class="space-y-2">
          <li
            v-for="slot in priest.slots"
            :key="slot.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded"
          >
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600 font-medium">
                {{ slot.daysOfWeek?.length ? slot.daysOfWeek.join(', ') : formatDate(slot.date) }}
              </span>
              <span class="font-medium">{{ formatTime(slot.start) }} → {{ formatTime(slot.end) }}</span>
              <span
                class="px-2 py-1 text-sm rounded text-white"
                :class="{
                  'bg-green-600': slot.type === 'AVAILABLE',
                  'bg-red-600':   slot.type === 'BUSY',
                  'bg-gray-600':  slot.type === 'HOLIDAY'
                }"
              >{{ slot.type }}</span>
            </div>
            <button @click="removeSlot(slot.id)" class="text-red-600 hover:underline">Delete</button>
          </li>
        </ul>

        <p v-else class="text-gray-500">No slots available.</p>
      </div>
    </div>

    <!-- Add Slot Modal -->
    <AddSlotModal
      v-if="showSlotModal"
      :priestId="route.params.id"
      @close="showSlotModal = false"
      @created="reloadData"
    />

    <!-- Reuse AddPriestModal for EDIT (gallery included) -->
    <AddPriestModal
      v-if="showEdit && priest"
      :priest="priest"
      @close="closeEdit"
      @updated="onEdited"
    />

    <transition name="fade">
      <div
        v-if="notification.visible"
        class="fixed bottom-4 right-4 px-4 py-3 rounded shadow text-white"
        :class="notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRoute } from '#app'
import { usePriestService } from '@/composables/usePriestService'
import { useNotification } from '@/composables/useNotification'
import { useMediaService } from '@/composables/useMediaService'

import AddSlotModal from '@/components/priest/AddSlotModal.vue'
import AddPriestModal from '@/components/priest/AddPriestModal.vue'

const route = useRoute()
const { fetchPriest, deleteSlot } = usePriestService()
const { notification, showNotification } = useNotification()
const { fullUrl } = useMediaService()

const priest = ref(null)
const loading = ref(true)
const error = ref(false)
const showSlotModal = ref(false)

const showEdit = ref(false)

async function reloadData() {
  loading.value = true
  error.value = false
  try {
    const data = await fetchPriest(route.params.id)
    priest.value = data
  } catch (e) {
    console.error('Error fetching priest:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(reloadData)

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

async function removeSlot(slotId) {
  try {
    await deleteSlot(slotId)
    await reloadData()
    showNotification('Slot deleted', 'success')
  } catch (e) {
    console.error(e)
    showNotification(e.message || 'Failed to delete slot', 'error')
  }
}

function openEdit() {
  if (!priest.value) return
  showEdit.value = true
}
function closeEdit() {
  showEdit.value = false
}
async function onEdited() {
  await reloadData()
  showNotification('Priest updated successfully', 'success')
  showEdit.value = false
}

function imageSrc(p) {
  const rel = p?.featuredMedia?.url || p?.featuredMedia?.path || null
  if (!rel) return ''
  const base = fullUrl(rel)
  const ver  = p?.featuredMedia?.updatedAt || p?.updatedAt || Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}
function onImgError(e) { console.error('Image failed to load:', e?.target?.src) }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
