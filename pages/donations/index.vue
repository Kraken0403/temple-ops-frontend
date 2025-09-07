<!-- File: pages/donations/index.vue -->
<template>
  <section class="py-0 w-full mx-auto">
    <!-- Hero -->
    <PageHero
      title="Make a Donation"
      caption="Support our temple by choosing one of our donation options below."
      :imageUrl="bg"
    />

    <div class="max-w-[1190px] mx-auto py-16">
      <h1 class="text-3xl font-bold text-center mb-[50px]">Donation Options</h1>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="i in 4"
          :key="i"
          class="animate-pulse bg-gray-100 h-48 rounded-lg"
        ></div>
      </div>

      <!-- Donation Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="item in items"
          :key="item.id"
          @click="goToCheckout(item.id)"
          class="cursor-pointer flex bg-white justify-between border-[1px] border-[#8c8c8c] rounded-[12px] p-6 shadow hover:shadow-md transition hover:bg-amber-50"
        >
          <div class="flex-col w-full">
            <h3 class="text-[20px] font-semibold mb-[30px]">{{ item.name }}</h3>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-[15px]">
                <i class="material-icons mr-1 text-[#570000]">volunteer_activism</i>
                <span class="text-[#8c8c8c] font-semibold">
                  {{ formatMoney(item.amount, settingsCurrency) }}
                </span>
              </div>
              <div class="arrow bg-[#570000] rounded-full flex items-center p-[5px]">
                <p class="text-white p-[10px]">Donate Now</p>
                <span class="material-icons text-2xl text-white">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-red-600 mt-4 text-center">
        Error loading donation options.
      </div>
    </div>

    <!-- <Experience /> -->
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import Experience from '@/components/Experience.vue'
import bg from '@/assets/images/sample-2.png'
import { useDonationService } from '@/composables/useDonationService'
import { useSettingsService } from '@/composables/useSettingsService'

const items   = ref([])
const loading = ref(true)
const error   = ref(false)
const settingsCurrency = ref('INR')

const { listItems } = useDonationService()
const { getSettings } = useSettingsService()
const router = useRouter()

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

    items.value = await listItems()
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    loading.value = false
  }
})

function goToCheckout(id) {
  router.push({ path: '/donations/checkout', query: { donationItemId: id } })
}
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
.animate-pulse {
  animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse {
  0%, 100% { background-color: #f3f3f3; }
  50%      { background-color: #e5e5e5; }
}
</style>
