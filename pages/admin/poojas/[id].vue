<!-- File: pages/admin/pooja/[id].vue (your single pooja page) -->
<template>
  <div class="p-6 bg-[#F8F9FA] min-h-screen">
    <div class="mx-auto w-full bg-white rounded-lg shadow">
      
      <div v-if="error" class="p-6 text-center text-red-600">Error loading pooja</div>
      <div v-else-if="!pooja" class="p-6 text-center text-gray-600">Loading...</div>
      <div v-else class="md:flex">
        <!-- Left: Details -->
        <div class="md:w-2/3 p-6 space-y-6">
          <h2 class="text-3xl font-bold mb-4">{{ pooja.name }}</h2>

          <!-- Key fields in a grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Amount</h3>
              <p class="mt-1 text-gray-800">{{ formatMoney(pooja.amount, settingsCurrency) }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Duration</h3>
              <p class="mt-1 text-gray-800">{{ pooja.durationMin }} min</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">In Venue</h3>
              <p class="mt-1 text-gray-800">{{ pooja.isInVenue ? 'Yes' : 'No' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Outside Venue</h3>
              <p class="mt-1 text-gray-800">{{ pooja.isOutsideVenue ? 'Yes' : 'No' }}</p>
            </div>
            <div v-if="pooja.date">
              <h3 class="text-sm font-semibold text-gray-500">Date</h3>
              <p class="mt-1 text-gray-800">{{ new Date(pooja.date).toLocaleDateString() }}</p>
            </div>
            <div v-if="pooja.time">
              <h3 class="text-sm font-semibold text-gray-500">Time</h3>
              <p class="mt-1 text-gray-800">{{ new Date(pooja.time).toLocaleTimeString() }}</p>
            </div>
            <div v-if="pooja.venueAddress">
              <h3 class="text-sm font-semibold text-gray-500">Venue Address</h3>
              <p class="mt-1 text-gray-800">{{ pooja.venueAddress }}</p>
            </div>
            <div v-if="pooja.mapLink">
              <h3 class="text-sm font-semibold text-gray-500">Location</h3>
              <a
                :href="pooja.mapLink"
                target="_blank"
                class="mt-1 block text-blue-600 hover:underline"
              >
                View Map
              </a>
            </div>
            <div v-if="pooja.allowedZones?.length">
              <h3 class="text-sm font-semibold text-gray-500">Allowed Zones</h3>
              <p class="mt-1 text-gray-800">{{ pooja.allowedZones.join(', ') }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Include Food</h3>
              <p class="mt-1 text-gray-800">{{ pooja.includeFood ? 'Yes' : 'No' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-500">Include Hall</h3>
              <p class="mt-1 text-gray-800">{{ pooja.includeHall ? 'Yes' : 'No' }}</p>
            </div>
            <div v-if="pooja.materials">
              <h3 class="text-sm font-semibold text-gray-500">Materials</h3>
              <p class="mt-1 text-gray-800">{{ pooja.materials }}</p>
            </div>
            <div v-if="pooja.notes">
              <h3 class="text-sm font-semibold text-gray-500">Notes</h3>
              <p class="mt-1 text-gray-800">{{ pooja.notes }}</p>
            </div>
            <div v-if="pooja.priests?.length">
              <h3 class="text-sm font-semibold text-gray-500">Priests</h3>
              <p class="mt-1 text-gray-800">{{ pooja.priests.map(p => p.name).join(', ') }}</p>
            </div>
          </div>

          <!-- Description, full-width -->
          <div v-if="pooja.description" class="pt-6 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-500">Description</h3>
            <p class="mt-2 text-gray-800 whitespace-pre-line">{{ pooja.description }}</p>
          </div>
        </div>

        <!-- Right: Photo + Actions -->
        <div class="md:w-1/3 relative p-6 border-t md:border-t-0 md:border-l border-gray-200 flex items-center justify-center">
          <!-- Edit + Delete action buttons -->
          <div class="absolute right-2 top-2 flex gap-2">
            <button
              @click="openEditModal"
              class="icon-wrapper p-[10px] rounded-full border border-gray-400 flex justify-center items-center hover:bg-gray-50"
              title="Edit"
            >
              <span class="material-icons text-[15px]">edit</span>
            </button>
            <button
              @click="onDeletePooja"
              class="icon-wrapper p-[10px] rounded-full border border-gray-400 flex justify-center items-center hover:bg-red-50"
              title="Delete"
            >
              <span class="material-icons text-[15px] text-red-600">delete</span>
            </button>
          </div>

          <img
            v-if="pooja.photoUrl"
            :src="config.apiBase + pooja.photoUrl"
            alt="Pooja photo"
            class="rounded-lg max-h-[400px] object-cover"
          />
          <div
            v-else
            class="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-400"
          >
            No Image
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal (unchanged except for existing content) -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
            <h3 class="text-[18px] font-semibold text-gray-800">Edit Pooja</h3>
            <button @click="toggleModal" class="text-gray-500 cursor-pointer hover:text-gray-700">
              <i class="material-icons">close</i>
            </button>
          </div>

          <!-- Scrollable Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
              <!-- Replace the placeholder inside the modal body with this form -->
              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- Basic -->
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input v-model="form.name" type="text" class="mt-1 w-full border rounded px-3 py-2" />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Amount ({{ settingsCurrency }})</label>
                      <input v-model.number="form.amount" type="number" min="0" class="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Duration (min)</label>
                      <input v-model.number="form.durationMin" type="number" min="0" class="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Prep Time (min)</label>
                      <input v-model.number="form.prepTimeMin" type="number" min="0" class="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Buffer (min)</label>
                      <input v-model.number="form.bufferMin" type="number" min="0" class="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Priests</label>
                      <select v-model="form.priestIds" multiple class="mt-1 w-full border rounded px-3 py-2 h-[120px]">
                        <option v-for="p in priests" :key="p.id" :value="p.id">{{ p.name }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Venue / schedule -->
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Date</label>
                      <input v-model="form.date" type="date" class="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Time</label>
                      <input v-model="form.time" type="time" class="mt-1 w-full border rounded px-3 py-2" />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">In Venue</label>
                      <input v-model="form.isInVenue" type="checkbox" class="mt-2" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Outside Venue</label>
                      <input v-model="form.isOutsideVenue" type="checkbox" class="mt-2" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Venue Address</label>
                    <textarea v-model="form.venueAddress" rows="2" class="mt-1 w-full border rounded px-3 py-2"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Map Link</label>
                    <input v-model="form.mapLink" type="url" class="mt-1 w-full border rounded px-3 py-2" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Allowed Zones (comma-separated)</label>
                    <input v-model="form.allowedZones" type="text" placeholder="e.g. Zone A, Zone B"
                          class="mt-1 w-full border rounded px-3 py-2" />
                  </div>
                </div>

                <!-- Options -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Include Food</label>
                    <input v-model="form.includeFood" type="checkbox" class="mt-2" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Include Hall</label>
                    <input v-model="form.includeHall" type="checkbox" class="mt-2" />
                  </div>
                </div>

                <!-- Materials / Notes -->
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Materials</label>
                    <textarea v-model="form.materials" rows="2" class="mt-1 w-full border rounded px-3 py-2"></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea v-model="form.notes" rows="3" class="mt-1 w-full border rounded px-3 py-2"></textarea>
                  </div>
                </div>

                <!-- Photo -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Photo</label>
                  <input type="file" accept="image/*" @change="onFileChange" />
                  <div v-if="previewUrl" class="mt-2">
                    <img :src="previewUrl" alt="Preview" class="max-h-48 rounded border" />
                  </div>
                </div>
              </form>

          </div>

          <!-- Fixed Footer Actions -->
          <div class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
            <button type="button" @click="toggleModal" class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer">Cancel</button>
            <button type="button" @click="submitForm" class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700">Save</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRoute, useRouter, useRuntimeConfig } from '#app'
import { useSettingsService } from '~/composables/useSettingsService'
import { usePoojaService } from '~/composables/usePoojaService'
import { usePriestService } from '~/composables/usePriestService'

const config = useRuntimeConfig().public
const route  = useRoute()
const router = useRouter()

const { getSettings } = useSettingsService()
const { getPoojaById, updatePooja, uploadPhoto, deletePooja } = usePoojaService()
const { fetchPriests } = usePriestService()

const settingsCurrency = ref('INR')
const pooja      = ref(null)
const priests    = ref([])
const error      = ref(false)
const showModal  = ref(false)
const previewUrl = ref('')
const file       = ref(null)

const form = ref({
  name: '',
  amount: 0,
  priestIds: [],
  isInVenue: false,
  isOutsideVenue: false,
  date: '',
  time: '',
  venueAddress: '',
  mapLink: '',
  allowedZones: '',
  durationMin: 0,
  prepTimeMin: 0,
  bufferMin: 0,
  includeFood: false,
  includeHall: false,
  materials: '',
  notes: ''
})

function openEditModal() {
  if (!pooja.value) return
  form.value = {
    name:           pooja.value.name,
    amount:         pooja.value.amount,
    priestIds:      pooja.value.priests?.map(p => p.id) || [],
    isInVenue:      pooja.value.isInVenue,
    isOutsideVenue: pooja.value.isOutsideVenue,
    date:           pooja.value.date?.slice(0, 10) || '',
    time:           pooja.value.time?.slice(11, 16) || '',
    venueAddress:   pooja.value.venueAddress || '',
    mapLink:        pooja.value.mapLink || '',
    allowedZones:   pooja.value.allowedZones?.join(', ') || '',
    durationMin:    pooja.value.durationMin,
    prepTimeMin:    pooja.value.prepTimeMin,
    bufferMin:      pooja.value.bufferMin,
    includeFood:    pooja.value.includeFood,
    includeHall:    pooja.value.includeHall,
    materials:      pooja.value.materials || '',
    notes:          pooja.value.notes || ''
  }
  previewUrl.value = pooja.value.photoUrl ? config.apiBase + pooja.value.photoUrl : ''
  file.value       = null
  showModal.value  = true
}
function toggleModal() { showModal.value = !showModal.value }

function onFileChange(e) {
  const f = e.target.files[0]
  if (!f) return
  file.value       = f
  previewUrl.value = URL.createObjectURL(f)
}

async function submitForm() {
  try {
    const data = {
      ...form.value,
      allowedZones: form.value.allowedZones
        ? form.value.allowedZones.split(',').map(s => s.trim())
        : []
    }
    if (file.value) {
      data.photoUrl = await uploadPhoto(file.value)
    } else if (pooja.value?.photoUrl) {
      data.photoUrl = pooja.value.photoUrl
    }
    await updatePooja(route.params.id, data)
    pooja.value = await getPoojaById(route.params.id)
    showModal.value = false
  } catch (err) {
    console.error('Error updating pooja:', err)
    alert(err?.message || 'Error saving changes')
  }
}

async function onDeletePooja() {
  if (!pooja.value) return
  const ok = confirm(`Delete "${pooja.value.name}"? This cannot be undone.`)
  if (!ok) return
  try {
    await deletePooja(pooja.value.id)
    alert('Pooja deleted')
    router.push('/admin/poojas') // adjust if your list route differs
  } catch (e) {
    console.error(e)
    alert(e?.message || 'Failed to delete pooja')
  }
}

onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
  } catch (e) {
    console.error('Could not load settings:', e)
    settingsCurrency.value = 'INR'
  }

  try {
    pooja.value   = await getPoojaById(route.params.id)
    priests.value = await fetchPriests()
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = true
  }
})

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return '—'
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    }).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}
</script>

<style scoped>
.icon-wrapper { width: 36px; height: 36px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
