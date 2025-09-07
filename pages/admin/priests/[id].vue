<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">
      <!-- Back + Actions -->
      <div class="px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/admin/priests" class="text-blue-600 hover:underline">
          ← Back to list
        </NuxtLink>

        <button
          v-if="!loading && priest"
          @click="openEdit()"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit Priest
        </button>
      </div>

      <!-- Loading / Error -->
      <div v-if="error" class="p-6 text-center text-red-600">Error loading priest</div>
      <div v-else-if="loading" class="p-6 text-center text-gray-600">Loading...</div>

      <!-- Details -->
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
              <p class="mt-1 text-gray-800">
                {{ (priest.languages || []).join(', ') || '—' }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Qualifications</h3>
              <p class="mt-1 text-gray-800">
                {{ (priest.qualifications || []).join(', ') || '—' }}
              </p>
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
        <div
          class="md:w-1/3 p-6 border-t md:border-t-0 md:border-l border-gray-200 flex items-center justify-center"
        >
          <img
            v-if="priest.photo"
            :src="fullPhotoUrl(priest.photo)"
            alt="Priest photo"
            class="rounded-lg max-h-[400px] object-cover"
            @error="onImgError"
          />
          <div
            v-else
            class="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-400"
          >
            No Image
          </div>
        </div>
      </div>

      <!-- Slots Section -->
      <div v-if="!loading" class="p-6 border-t border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold">Available Slots</h2>
          <button
            @click="showSlotModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
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
              <!-- Days or Date -->
              <span class="text-sm text-gray-600 font-medium">
                {{ slot.daysOfWeek?.length ? slot.daysOfWeek.join(', ') : formatDate(slot.date) }}
              </span>
              <!-- Time Range -->
              <span class="font-medium">
                {{ formatTime(slot.start) }} → {{ formatTime(slot.end) }}
              </span>
              <!-- Type Pill -->
              <span
                class="px-2 py-1 text-sm rounded text-white"
                :class="{
                  'bg-green-600': slot.type === 'AVAILABLE',
                  'bg-red-600':   slot.type === 'BUSY',
                  'bg-gray-600':  slot.type === 'HOLIDAY'
                }"
              >
                {{ slot.type }}
              </span>
            </div>

            <!-- Delete -->
            <button
              @click="removeSlot(slot.id)"
              class="text-red-600 hover:underline"
            >
              Delete
            </button>
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

    <!-- Edit Priest Modal -->
    <div
      v-if="showEdit"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h3 class="text-xl font-semibold">Edit Priest</h3>
          <button @click="closeEdit" class="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitEdit" class="p-6 space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input v-model.trim="editForm.name" required placeholder="Full name" class="w-full p-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input v-model.trim="editForm.specialty" placeholder="e.g. Vedic rituals" class="w-full p-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model.trim="editForm.email" type="email" placeholder="name@example.com" class="w-full p-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
              <input v-model.trim="editForm.contactNo" placeholder="+1 555…" class="w-full p-2 border border-gray-300 rounded" />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input v-model.trim="editForm.address" placeholder="Address" class="w-full p-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
              <input v-model.trim="editForm.languages" placeholder="Sanskrit, Hindi, English" class="w-full p-2 border border-gray-300 rounded" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Qualifications (comma separated)</label>
              <input v-model.trim="editForm.qualifications" placeholder="Acharya, Purohit" class="w-full p-2 border border-gray-300 rounded" />
            </div>

            <!-- Photo -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div class="flex items-end space-x-4">
                <div class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                  <span v-if="!photoPreview" class="text-gray-400">No image</span>
                  <img v-else :src="photoPreview" class="object-cover w-full h-full" />
                </div>
                <label class="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                  Browse…
                  <input type="file" accept="image/*" @change="onPhotoChange" class="hidden" />
                </label>
                <button
                  v-if="photoPreview && !!editForm.photo"
                  type="button"
                  class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  @click="clearPhotoSelection"
                >
                  Clear
                </button>
              </div>
              <p v-if="editForm.photo && !newPhotoFile" class="text-xs text-gray-500 mt-1">
                Current: {{ editForm.photo }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="closeEdit" class="px-4 py-2 rounded border bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notifications -->
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
import { useRoute, useRuntimeConfig } from '#app'
import { usePriestService } from '@/composables/usePriestService'
import { useNotification } from '@/composables/useNotification'
import AddSlotModal from '@/components/priest/AddSlotModal.vue'

const route = useRoute()
const config = useRuntimeConfig().public
const { fetchPriest, deleteSlot, updatePriest } = usePriestService()
const { notification, showNotification } = useNotification()

const priest = ref(null)
const loading = ref(true)
const error = ref(false)
const showSlotModal = ref(false)

/* ---- Edit modal state ---- */
const showEdit = ref(false)
const saving = ref(false)
const editForm = ref({
  name: '',
  specialty: '',
  email: '',
  contactNo: '',
  address: '',
  languages: '',
  qualifications: '',
  photo: null, // path from server if exists
})
const newPhotoFile = ref(null)
const photoPreview = ref('')

function fullPhotoUrl(path) {
  return path?.startsWith('http') ? path : `${config.apiBase}${path}`
}

/* Load data */
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

/* Formatting helpers */
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })
}

/* Slots */
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

/* ---- Edit modal handlers ---- */
function openEdit() {
  if (!priest.value) return
  // seed form
  editForm.value = {
    name: priest.value.name || '',
    specialty: priest.value.specialty || '',
    email: priest.value.email || '',
    contactNo: priest.value.contactNo || '',
    address: priest.value.address || '',
    languages: (priest.value.languages || []).join(', '),
    qualifications: (priest.value.qualifications || []).join(', '),
    photo: priest.value.photo || null
  }
  newPhotoFile.value = null
  photoPreview.value = editForm.value.photo ? fullPhotoUrl(editForm.value.photo) : ''
  showEdit.value = true
}

function closeEdit() {
  if (saving.value) return
  showEdit.value = false
}

function onPhotoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  newPhotoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}
function clearPhotoSelection() {
  newPhotoFile.value = null
  photoPreview.value = editForm.value.photo ? fullPhotoUrl(editForm.value.photo) : ''
}

async function submitEdit() {
  if (!editForm.value.name.trim()) {
    showNotification('Name is required', 'error')
    return
  }
  saving.value = true
  try {
    await updatePriest(Number(route.params.id), { ...editForm.value }, newPhotoFile.value || null)
    await reloadData()
    showNotification('Priest updated successfully', 'success')
    showEdit.value = false
  } catch (e) {
    console.error(e)
    showNotification(e.message || 'Failed to update priest', 'error')
  } finally {
    saving.value = false
  }
}

function onImgError(e) {
  console.error('Image failed to load:', e?.target?.src)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
