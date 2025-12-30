<template>
  <section class="py-0 w-full mx-auto bg-[#f5f5f5]">
    <!-- HERO -->
    <PageHero
      title="Our Services"
      caption="Find a wide range of services to support your spiritual journey and personal needs."
      :imageUrl="bg"
    />

    <div class="max-w-[1190px] mx-auto py-16">

      <h1 class="text-4xl md:text-4xl capitalize font-bold text-center mb-[30px] ">
        Our Puja Services

      </h1>
      <hr class="text-[#570000] w-[60px] mx-auto h-[2px] rounded-full bg-[#570000] mb-[60px]">



      <!-- FILTER BAR -->
      <div
        class="flex flex-col md:flex-row items-stretch md:items-center mb-6"
        style="gap:15px"
      >
        <!-- SEARCH -->
        <div class="relative w-full md:flex-1">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Services"
            class="w-full bg-white border border-gray-300 rounded-[8px] py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#570000]/30"
          />
        </div>

        <!-- VENUE -->
        <select
          v-model="venueFilter"
          class="w-full md:w-[220px] text-gray-600 px-4 py-3 rounded-[8px] border border-gray-300 bg-white"
        >
          <option value="">All Venues</option>
          <option value="temple">Temple</option>
          <option value="outside">Outside Venue</option>
        </select>

        <!-- CATEGORY -->
        <select
          v-model="selectedCategoryId"
          class="w-full md:w-[220px] text-gray-600 px-4 py-3 rounded-[8px] border border-gray-300 bg-white"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <!-- SORT -->
        <select
          v-model="sortBy"
          class="w-full md:w-[220px] text-gray-600 px-4 py-3 rounded-[8px] border border-gray-300 bg-white"
        >
          <option value="name">Sort: Name</option>
          <option value="duration">Sort: Duration</option>
          <option value="amount">Sort: Price</option>
        </select>
      </div>

      <!-- ACTIVE FILTER TAGS -->
      <div v-if="activeFilterTags.length" class="flex flex-wrap gap-2 mb-8">
        <span
          v-for="tag in activeFilterTags"
          :key="tag.key"
          class="flex items-center gap-2 text-xs bg-[#570000]/10 text-[#570000] px-3 py-1 rounded-[2px] border border-[#570000]/20"
        >
          {{ tag.label }}
          <button @click="tag.onRemove">
            <span class="material-icons text-[14px]">close</span>
          </button>
        </span>

        <button
          class="text-xs px-3 py-1 rounded-[2px] border border-gray-300 hover:bg-gray-50"
          @click="clearAllFilters"
        >
          Clear all
        </button>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="animate-pulse h-[340px] bg-gray-100 rounded-xl" />
      </div>

      <!-- EMPTY -->
      <div v-else-if="pagedPoojas.length === 0" class="text-center py-20 text-gray-500">
        No puja services found.
      </div>

      <!-- CARDS -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        <div
          v-for="pooja in pagedPoojas"
          :key="pooja.id"
          class="flex flex-col"
        >
          <!-- CARD -->
          <NuxtLink
              :to="`/services/${pooja.id}`"
              class="group bg-white border border-[#ccc] shadow-2xs rounded-[12px] overflow-hidden
                   "
            >

              <!-- IMAGE -->
              <div class="w-full h-[250px] bg-white overflow-hidden px-[10px] pt-[10px] mb-[5px]">
                <img
                  v-if="poojaImage(pooja)"
                  :src="poojaImage(pooja)"
                  class="w-full h-full object-cover rounded-[12px] "
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400"
                >
                  No Image
                </div>
              </div>

              <!-- CONTENT -->
              <div class="px-[20px] py-[10px] flex flex-col gap-[0px]">

                <!-- TOP META (very light) -->
                <div class="flex items-center justify-between uppercase text-[12px] font-[500] text-[#888] mb-[10px]">
                  <div class="flex items-center gap-1">
                    <span class="material-icons text-[5px]">event_available</span>

                    <span v-if="pooja.isInVenue && pooja.isOutsideVenue">
                      Temple & Outside
                    </span>
                    <span v-else-if="pooja.isInVenue">
                      Temple Only
                    </span>
                    <span v-else-if="pooja.isOutsideVenue">
                      Outside Only
                    </span>
                  </div>

                  <div v-if="pooja.categories?.length" class="text-[11px] uppercase tracking-wide">
                    {{ pooja.categories[0].name }}
                  </div>
                </div>

                <!-- TITLE -->
                <h3
                  class="text-[20px] leading-[1.2] capitalize font-[600] text-[#570000]
                        group-hover:text-[#570000] transition-colors mb-[20px]"
                >
                  {{ pooja.name }}
                </h3>

                <!-- META GRID (amenities style) -->
                    <!-- META PILLS -->
                    <div class="flex flex-wrap gap-2 mb-[45px]">


                          <div class="flex items-center gap-2 text-[14px] text-gray-800
                                      bg-[#f5f5f5] px-[8px] py-[2px] rounded-[30px]">
                            <span class="material-icons text-[18px] text-gray-800">schedule</span>
                            {{ formatDuration(pooja.durationMin) }}
                          </div>

                          <!-- Prep Time -->
                          <div class="flex items-center gap-2 text-[14px] text-gray-800
                                      bg-[#f5f5f5] px-[8px] py-[2px] rounded-[30px]">
                            <span class="material-icons text-[18px] text-gray-800">build</span>
                            Prep {{ formatDuration(pooja.prepTimeMin) }}
                          </div>

                          <!-- Buffer Time -->
                          <div class="flex items-center gap-2 text-[14px] text-gray-800
                                      bg-[#f5f5f5] px-[8px] py-[2px] rounded-[30px]">
                            <span class="material-icons text-[18px] text-gray-800">hourglass_bottom</span>
                            Buffer {{ formatDuration(pooja.bufferMin) }}
                          </div>

                          <!-- Availability -->
                          <div
                            v-if="pooja.isInVenue || pooja.isOutsideVenue"
                            class="flex items-center gap-2 text-[14px] text-gray-800
                                  bg-[#f5f5f5] px-[8px] py-[2px] rounded-[30px]"
                          >
                            <span class="material-icons text-[18px] text-gray-800">
                              event_available
                            </span>

                            <span v-if="pooja.isInVenue && pooja.isOutsideVenue">
                              Temple & Outside
                            </span>
                            <span v-else-if="pooja.isInVenue">
                              Temple Only
                            </span>
                            <span v-else>
                              Outside Only
                            </span>
                          </div>

                    </div>


                <!-- FEATURE TAGS (very subtle, optional) -->
                <!-- <div class="flex flex-wrap gap-2">
                  <span
                    v-if="pooja.includeHall"
                    class="text-[12px] px-3 py-[4px] rounded-[8px]
                          text-[#111]"
                  >
                    Hall Included
                  </span>
                </div> -->

                <!-- FOOTER -->
                <div class="flex items-center justify-between pt-[10px] border-t-[1px] border-[#ccc]/60">

                  <!-- PRICE -->
                  <div class="text-[20px] font-semibold text-[#111111]">
                    {{ formatMoney(pooja.amount, currencyCode) }}
                  </div>

                  <!-- CTA -->
                  <span
                    class="bg-[#3d3d3d] border border-[#570000] text-white
                          px-[22px] py-[8px] rounded-[8px]
                          text-[14px] font-medium
                          transition-colors duration-200
                          "
                  >
                    View Details
                  </span>

                </div>

              </div>
            </NuxtLink>


          <!-- CTA OUTSIDE CARD -->
          <!-- <NuxtLink
            :to="`/services/${pooja.id}`"
            class="cta-btn-small mx-auto mt-4"
          >
            View Details
          </NuxtLink> -->
        </div>
      </div>

      <!-- PAGINATION -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center gap-2 flex-wrap">
        <button
          v-for="p in totalPages"
          :key="p"
          class="px-3 py-2 rounded-lg border"
          :class="p === page ? 'bg-[#570000] text-white border-[#570000]' : ''"
          @click="page = p"
        >
          {{ p }}
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PageHero from '@/components/PageHero.vue'
import bg from '@/assets/images/sample-2.webp'
import { usePoojaService } from '@/composables/usePoojaService'
import { useSettingsService } from '@/composables/useSettingsService'

const { fetchPoojas } = usePoojaService()
const { getSettings } = useSettingsService()

const poojas = ref([])
const loading = ref(true)

const searchQuery = ref('')
const venueFilter = ref('')
const selectedCategoryId = ref('')
const sortBy = ref('name')

const page = ref(1)
const perPage = 12

const settings = ref(null)
const currencyCode = computed(() => settings.value?.currency || 'INR')
const config = useRuntimeConfig().public

onMounted(async () => {
  settings.value = await getSettings()
  poojas.value = await fetchPoojas()
  loading.value = false
})

watch([searchQuery, venueFilter, selectedCategoryId, sortBy], () => {
  page.value = 1
})

function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${config.apiBase}${path}`
}

function poojaImage(p) {
  const rel = p?.featuredMedia?.url || p?.featuredMedia?.path || p?.photoUrl
  if (!rel) return ''
  return `${fullUrl(rel)}?v=${p?.updatedAt || Date.now()}`
}

function formatDuration(min) {
  if (!min) return '—'
  if (min % 60 === 0) return `${min / 60} hr`
  return `${min} min`
}

function formatMoney(amount, code) {
  return new Intl.NumberFormat(
    code === 'INR' ? 'en-IN' : 'en-US',
    { style: 'currency', currency: code, maximumFractionDigits: 0 }
  ).format(amount || 0)
}

const categories = computed(() => {
  const m = new Map()
  poojas.value.forEach(p => p.categories?.forEach(c => m.set(c.id, c)))
  return [...m.values()]
})

const filteredPoojas = computed(() => {
  let list = poojas.value.filter(p => {
    const venueMatch =
      !venueFilter.value ||
      (venueFilter.value === 'temple' && p.isInVenue) ||
      (venueFilter.value === 'outside' && p.isOutsideVenue)

    const q = searchQuery.value.toLowerCase()
    const searchMatch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)

    const catMatch =
      !selectedCategoryId.value ||
      p.categories?.some(c => c.id === Number(selectedCategoryId.value))

    return venueMatch && searchMatch && catMatch
  })

  if (sortBy.value === 'amount') list.sort((a,b)=>a.amount-b.amount)
  else if (sortBy.value === 'duration') list.sort((a,b)=>a.durationMin-b.durationMin)
  else list.sort((a,b)=>a.name.localeCompare(b.name))

  return list
})

const pagedPoojas = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredPoojas.value.slice(start, start + perPage)
})

const totalPages = computed(() =>
  Math.ceil(filteredPoojas.value.length / perPage)
)

const activeFilterTags = computed(() => {
  const tags = []

  if (venueFilter.value) {
    tags.push({
      key: 'venue',
      label: `Venue: ${venueFilter.value === 'temple' ? 'Temple' : 'Outside'}`,
      onRemove: () => venueFilter.value = ''
    })
  }

  if (searchQuery.value) {
    tags.push({
      key: 'search',
      label: `Search: ${searchQuery.value}`,
      onRemove: () => searchQuery.value = ''
    })
  }

  if (selectedCategoryId.value) {
    tags.push({
      key: 'cat',
      label: 'Category applied',
      onRemove: () => selectedCategoryId.value = ''
    })
  }

  if (sortBy.value !== 'name') {
    tags.push({
      key: 'sort',
      label: `Sort: ${sortBy.value}`,
      onRemove: () => sortBy.value = 'name'
    })
  }

  return tags
})

function clearAllFilters() {
  searchQuery.value = ''
  venueFilter.value = ''
  selectedCategoryId.value = ''
  sortBy.value = 'name'
}
</script>

<style scoped>
.badge-green { background:#dcfce7; color:#166534; font-size:12px; padding:4px 8px; border-radius:999px; }
.badge-blue  { background:#dbeafe; color:#1e40af; font-size:12px; padding:4px 8px; border-radius:999px; }

.cta-btn-small{
  background:#570000;
  border:2px solid #570000;
  color:#fff;
  padding:8px 24px;
  border-radius:30px;
  font-size:14px;
  transition:all .2s;
}
.cta-btn-small:hover{
  background:transparent;
  color:#570000;
}

.animate-pulse{
  animation:pulse 1.5s infinite ease-in-out;
}
@keyframes pulse{
  0%,100%{background:#f3f3f3}
  50%{background:#e5e5e5}
}
</style>
