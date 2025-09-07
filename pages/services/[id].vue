<template>
  <section class="py-10 px-4 max-w-6xl mx-auto">
    <!-- Loading / Not Found -->
    <div v-if="loading" class="flex items-center justify-center h-60 text-gray-500">
      Loading pooja details...
    </div>
    <div v-else-if="!pooja" class="flex items-center justify-center h-60 text-red-500">
      Pooja not found
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Left: Image -->
      <div class="w-full">
        <div class="relative overflow-hidden rounded-xl bg-gray-100 shadow">
          <img
            v-if="pooja.photoUrl"
            :src="fullUrl(pooja.photoUrl)"
            :alt="pooja.name"
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

      <!-- Right: Pooja Info -->
      <div class="space-y-6">
        <!-- Title & Price -->
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-gray-900">{{ pooja.name }}</h1>
          <!-- Highlighted Price -->
          <div class="text-2xl font-semibold text-[#570000]">
            {{ formatMoney(pooja.amount, settingsCurrency) }}
          </div>
          <p v-if="pooja.notes" class="text-gray-600">
            {{ pooja.notes }}
          </p>
        </div>

        <!-- Quick chips -->
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
            <span class="material-icons text-[16px]">schedule</span>
            {{ pooja.durationMin }} mins
          </span>
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
            <span class="material-icons text-[16px]">build</span>
            Prep {{ pooja.prepTimeMin }} mins
          </span>
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
            <span class="material-icons text-[16px]">hourglass_bottom</span>
            Buffer {{ pooja.bufferMin }} mins
          </span>

          <span
            v-if="pooja.isInVenue"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm"
          >
            <span class="material-icons text-[16px]">temple_hindu</span>
            At temple
          </span>
          <span
            v-if="pooja.isOutsideVenue"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
          >
            <span class="material-icons text-[16px]">place</span>
            Outside venue
          </span>
          <span
            v-if="pooja.includeFood"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm"
          >
            <span class="material-icons text-[16px]">restaurant</span>
            Includes food
          </span>
          <span
            v-if="pooja.includeHall"
            class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm"
          >
            <span class="material-icons text-[16px]">meeting_room</span>
            Includes hall
          </span>
        </div>

        <!-- Description -->
        <div v-if="pooja.description" class="prose prose-sm max-w-none text-gray-700">
          <p class="whitespace-pre-line">{{ pooja.description }}</p>
        </div>

        <!-- Venue (only if inside temple) -->
        <div v-if="pooja.isInVenue && pooja.venueAddress" class="border rounded-lg p-4 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-700 mb-1">Venue Address</h3>
          <p class="text-gray-800">{{ pooja.venueAddress }}</p>
          <a
            v-if="pooja.mapLink"
            :href="pooja.mapLink"
            target="_blank"
            class="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
          >
            <span class="material-icons text-[16px]">map</span> View on Map
          </a>
        </div>

        <!-- Assigned Priests -->
        <div v-if="pooja.priests?.length" class="border rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Available Priests</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="p in pooja.priests"
              :key="p.id"
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-900 text-sm"
            >
              <img
                v-if="p.photo"
                :src="fullUrl(p.photo)"
                alt=""
                class="w-5 h-5 rounded-full object-cover"
              />
              <span>{{ p.name }}</span>
            </span>
          </div>
        </div>

        <!-- CTA -->
        <div class="pt-2">
          <NuxtLink
            :to="`/services/checkout?poojaId=${pooja.id}`"
            class="inline-flex items-center gap-2 bg-[#570000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#650000] transition"
          >
            <span class="material-icons text-[18px]">event_available</span>
            Book This Pooja
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { usePoojaService } from '@/composables/usePoojaService'
import { useSettingsService } from '@/composables/useSettingsService'

const config = useRuntimeConfig().public
const route = useRoute()
const { getPoojaById } = usePoojaService()
const { getSettings }  = useSettingsService()

const pooja = ref(null)
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

onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'
    pooja.value = await getPoojaById(route.params.id)
  } catch (err) {
    console.error('❌ Failed to load pooja:', err)
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
