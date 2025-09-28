<!-- File: pages/sponsorships/index.vue -->
<template>
  <section class="w-full mx-auto">
    <PageHero
      title="Sponsorships"
      caption="Support our events by sponsoring key activities. Choose from available sponsorships below."
      :imageUrl="heroBg"
    />

    <div class="mx-auto py-[100px] px-4 max-w-[1190px]">
      <!-- Filters -->
      <div class="flex justify-end items-center mb-6">
        <label class="text-sm font-medium text-gray-700 mr-2">Filter by Event:</label>
        <select
          v-model="selectedEvent"
          class="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Events</option>
          <option v-for="ev in uniqueEvents" :key="ev" :value="ev">{{ ev }}</option>
        </select>
      </div>

      <!-- Grid of sponsorship cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="s in filteredSponsorships"
          :key="s.id"
          class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
        >
          <!-- No Image -->
          <div class="w-full h-2 bg-[#004B21]"></div>

          <!-- Content -->
          <div class="p-4 flex-1 flex flex-col">
            <h3 class="text-[18px] font-semibold mb-2">{{ s.sponsorshipType?.name }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ s.sponsorshipType?.description }}</p>

            <p class="text-sm text-gray-700 mb-2 font-medium">
              Event: <span class="text-black">{{ s.event?.name }}</span>
            </p>

            <!-- Slots info -->
            <p class="text-sm text-gray-700 mb-2">
              Slots:
              <span class="font-semibold">
                {{ (s.bookings?.length ?? 0) }} / {{ s.maxSlots }}
              </span>
            </p>

            <p class="text-sm text-gray-700 mb-2">
              Price:
              <span class="font-semibold">
                {{ formatMoney(s.price ?? s.sponsorshipType?.price ?? 0, settingsCurrency) }}
              </span>
            </p>

            <NuxtLink
              :to="`/sponsorships/checkout?sponsorshipId=${s.id}`"
              class="mt-4 self-end bg-[#004B21] text-white px-6 py-2 rounded-[30px] text-sm font-medium hover:bg-green-700"
            >
              Book Now
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-red-600 mt-4 text-center">
        Error loading sponsorships.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { useSponsorshipService } from '@/composables/useSponsorshipService'
import { useSettingsService } from '@/composables/useSettingsService'
import PageHero from '@/components/PageHero.vue'
import heroBg from '@/assets/images/sample-2.png'

const sponsorships = ref([])
const error = ref(false)
const settingsCurrency = ref('INR')
const selectedEvent = ref('')

const config = useRuntimeConfig().public
const { getAllEventSponsorships } = useSponsorshipService()
const { getSettings } = useSettingsService()

const uniqueEvents = computed(() => {
  const names = sponsorships.value
    .map((s) => s.event?.name)
    .filter(Boolean)
  return [...new Set(names)]
})

const filteredSponsorships = computed(() => {
  if (!selectedEvent.value) return sponsorships.value
  return sponsorships.value.filter(
    (s) => s.event?.name === selectedEvent.value
  )
})

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
    sponsorships.value = await getAllEventSponsorships()
  } catch (err) {
    console.error('Failed to load sponsorships', err)
    error.value = true
  }
})
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
