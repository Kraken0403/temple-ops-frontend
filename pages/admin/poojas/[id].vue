<!-- File: pages/admin/pooja/[id].vue -->
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

            <!-- In-venue details -->
            <div v-if="pooja.isInVenue && (pooja.venue?.title || pooja.venueId !== null)" class="sm:col-span-2">
              <h3 class="text-sm font-semibold text-gray-500">Venue (Saved)</h3>
              <div class="mt-1 text-gray-800">
                <div v-if="pooja.venue">
                  <div class="font-medium">
                    {{ pooja.venue.title }}
                    <span v-if="pooja.venue.zipcode" class="text-gray-500">— {{ pooja.venue.zipcode }}</span>
                  </div>
                  <div v-if="pooja.venue.address" class="text-gray-700">{{ pooja.venue.address }}</div>
                  <div v-if="pooja.venue.mapLink" class="mt-1">
                    <a :href="pooja.venue.mapLink" target="_blank" class="text-blue-600 hover:underline">View Venue Map</a>
                  </div>
                </div>
                <div v-else class="text-gray-500">Venue selected (ID: {{ pooja.venueId }})</div>
              </div>
            </div>

            <!-- Outside-venue details -->
            <div v-if="pooja.isOutsideVenue && (pooja.venueAddress || pooja.mapLink || (pooja.allowedZones?.length))" class="sm:col-span-2">
              <h3 class="text-sm font-semibold text-gray-500">Outside Venue Details</h3>
              <div class="mt-1 space-y-1 text-gray-800">
                <div v-if="pooja.venueAddress"><span class="text-gray-600">Address: </span>{{ pooja.venueAddress }}</div>
                <div v-if="pooja.mapLink">
                  <a :href="pooja.mapLink" target="_blank" class="text-blue-600 hover:underline">View Map</a>
                </div>
                <div v-if="pooja.allowedZones?.length">
                  <span class="text-gray-600">Allowed Zones: </span>{{ pooja.allowedZones.join(', ') }}
                </div>
              </div>
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

            <div v-if="pooja.priests?.length" class="sm:col-span-2">
              <h3 class="text-sm font-semibold text-gray-500">Priests</h3>
              <p class="mt-1 text-gray-800">{{ pooja.priests.map(p => p.name).join(', ') }}</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="pooja.description" class="pt-6 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-500">Description</h3>
            <p class="mt-2 text-gray-800 whitespace-pre-line">{{ pooja.description }}</p>
          </div>
        </div>

        <!-- Right: Photo + Actions -->
        <div class="md:w-1/3 relative p-6 border-t md:border-t-0 md:border-l border-gray-200 flex items-center justify-center">
          <!-- Edit + Delete -->
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
            v-if="imageSrc(pooja)"
            :src="imageSrc(pooja)"
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

    <!-- Add/Edit Modal: reuse the shared component with gallery support -->
    <AddEditPoojaModal
      v-if="showModal"
      :pooja="pooja"
      :settingsCurrency="settingsCurrency"
      @close="showModal = false"
      @updated="onUpdated"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRoute, useRouter, useRuntimeConfig } from '#app'
import AddEditPoojaModal from '@/components/poojas/AddEditPoojaModal.vue'
import { useSettingsService } from '~/composables/useSettingsService'
import { usePoojaService } from '~/composables/usePoojaService'
import { useMediaService } from '~/composables/useMediaService'

const config = useRuntimeConfig().public
const route  = useRoute()
const router = useRouter()

const { getSettings } = useSettingsService()
const { getPoojaById, deletePooja } = usePoojaService()
const { fullUrl } = useMediaService()

const settingsCurrency = ref('INR')
const pooja      = ref(null)
const error      = ref(false)
const showModal  = ref(false)

/** Prefer featured media; fallback to legacy photoUrl. */
function imageSrc(item) {
  if (!item) return ''
  const rel =
    item?.featuredMedia?.url ||
    item?.featuredMedia?.path ||
    item?.photoUrl ||
    null
  if (!rel) return ''
  const base = fullUrl(rel)
  const ver  = item?.featuredMedia?.updatedAt || item?.updatedAt || Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

function openEditModal() {
  if (!pooja.value) return
  showModal.value = true
}

async function onUpdated() {
  // refresh current pooja after modal saved updates
  try {
    pooja.value = await getPoojaById(route.params.id)
  } catch (e) {
    console.error('Failed to refresh pooja:', e)
  } finally {
    showModal.value = false
  }
}

async function onDeletePooja() {
  if (!pooja.value) return
  const ok = confirm(`Delete "${pooja.value.name}"? This cannot be undone.`)
  if (!ok) return
  try {
    await deletePooja(pooja.value.id)
    alert('Pooja deleted')
    router.push('/admin/poojas')
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
    pooja.value = await getPoojaById(route.params.id)
  } catch (err) {
    console.error('Error fetching pooja:', err)
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
