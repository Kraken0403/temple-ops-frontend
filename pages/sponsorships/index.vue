<template>
  <section class="w-full mx-auto">
    <PageHero
      title="Sponsorships"
      caption="Support our events by sponsoring key activities. Choose from available sponsorships below."
      :imageUrl="heroBg"
    />

    <div class="mx-auto px-4">
      <!-- Grid of sponsorship cards -->
      <div class="max-w-[1190px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mx-auto py-[100px]">
        <!-- Card -->
        <div
          v-for="s in sponsorships"
          :key="s.id"
          class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
        >
          <!-- Event Image -->
          <img
            v-if="s.event?.imageUrl"
            :src="fullImageUrl(s.event.imageUrl)"
            :alt="s.event?.name || 'Event image'"
            class="w-full h-48 object-cover"
          />
          <div v-else class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>

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

    <!-- <Experience /> -->
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useSponsorshipService } from '@/composables/useSponsorshipService'
import { useSettingsService } from '@/composables/useSettingsService'
import PageHero from '@/components/PageHero.vue'
import Experience from '@/components/Experience.vue'
import heroBg from '@/assets/images/sample-2.png'

const sponsorships = ref([])
const error = ref(false)
const settingsCurrency = ref('INR')

const config = useRuntimeConfig().public
const { getAllEventSponsorships } = useSponsorshipService()
const { getSettings } = useSettingsService()

function fullImageUrl(path) {
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
    // Load currency from settings
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch (e) {
      console.warn('⚠️ Could not load settings; defaulting currency to INR')
      settingsCurrency.value = 'INR'
    }

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
