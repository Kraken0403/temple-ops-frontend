<template>
  <section class="py-0 w-full mx-auto">
    <PageHero
      title="Our Services"
      caption="Find a wide range of services to support your spiritual journey and personal needs."
      :imageUrl="bg"
    />
    <div class="max-w-[1190px] mx-auto py-16">
      <h1 class="text-3xl font-bold text-center mb-[50px]">Our Pooja Services</h1>

      <!-- Tabs -->
      <div class="flex justify-center mb-[25px]">
        <button
          class="px-6 py-2 border border-[#570000] rounded-l-full font-medium"
          :class="activeTab === 'temple'
            ? 'bg-[#570000] text-white'
            : 'bg-white text-[#570000]'"
          @click="activeTab = 'temple'"
        >
          At Temple
        </button>
        <button
          class="px-6 py-2 border border-[#570000] rounded-r-full font-medium"
          :class="activeTab === 'outside'
            ? 'bg-[#570000] text-white'
            : 'bg-white text-[#570000]'"
          @click="activeTab = 'outside'"
        >
          Outside Venue
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="animate-pulse bg-gray-100 h-64 rounded-lg"
        ></div>
      </div>

      <!-- Pooja Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          v-for="pooja in filteredPoojas"
          :key="pooja.id"
          :to="`/services/${pooja.id}`"
          class="flex bg-white justify-between border-[1px] border-[#8c8c8c] rounded-[12px] p-6 shadow hover:shadow-md transition hover:bg-amber-50"
        >
          <div class="flex-col w-full">
            <h3 class="text-[20px] font-semibold mb-[30px]">{{ pooja.name }}</h3>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-[15px]">
                <div class="flex gap-[5px] items-center text-[#8c8c8c] font-semibold">
                  <i class="material-icons mr-1 text-[#570000]">temple_hindu</i>
                  <span>
                    <span v-if="pooja.isInVenue">In-Temple</span>
                    <span v-if="pooja.isInVenue && pooja.isOutsideVenue"> / </span>
                    <span v-if="pooja.isOutsideVenue">Custom Venue</span>
                  </span>
                </div>
                <div class="flex items-center text-[#8c8c8c] font-semibold">
                  <i class="material-icons mr-1 text-[#570000]">schedule</i>
                  <span>Duration: {{ formatDuration(pooja.durationMin) }}</span>
                </div>
              </div>
              <div class="arrow bg-[#570000] rounded-full flex items-center p-[5px]">
                <span class="material-icons text-2xl text-white">arrow_forward</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
    <!-- <Experience /> -->
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHero from '@/components/PageHero.vue'
import Experience from '@/components/Experience.vue'
import bg from '@/assets/images/sample-2.webp'
import { usePoojaService } from '@/composables/usePoojaService'

const poojas = ref([])
const loading = ref(true)
const activeTab = ref('temple')
const { fetchPoojas } = usePoojaService()

onMounted(async () => {
  try {
    poojas.value = await fetchPoojas()
  } catch (err) {
    console.error('❌ Failed to load poojas:', err)
  } finally {
    loading.value = false
  }
})

// Filter based on tab
const filteredPoojas = computed(() => {
  return poojas.value.filter(p =>
    activeTab.value === 'temple' ? p.isInVenue : p.isOutsideVenue
  )
})

// Reuse your duration formatter
function formatDuration(minutes) {
  if (minutes % 60 === 0) {
    const h = minutes / 60
    return `${h} hour${h > 1 ? 's' : ''}`
  }
  return `${minutes} min`
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
  50% { background-color: #e5e5e5; }
}
</style>
