<template>
  <section class="relative py-[100px] bg-[#F8F9FA] overflow-hidden w-full mx-auto">
    <!-- Decorative background SVG -->
    <div class="absolute inset-0 flex justify-center pointer-events-none">
      <img
        :src="bg"
        alt=""
        class="opacity-100 max-w-4xl w-full object-contain h-full"
      />
    </div>

    <div class="relative z-10 mx-auto px-4 max-w-[1190px]">
      <!-- HEADER -->
      <h2 class="text-[32px] font-bold text-center mb-[15px]">
        Book Pujas
      </h2>
      <span
        class="w-[35px] h-[2px] rounded block bg-[#570000] mx-auto mb-[50px]"
      ></span>

      <!-- ERROR -->
      <div v-if="error" class="text-center text-red-600 mb-6">
        Error loading poojas.
      </div>

      <!-- EMPTY -->
      <div v-else-if="!poojas.length" class="text-center text-gray-500 mb-6">
        No poojas found.
      </div>

      <!-- CARDS -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-3 gap-[15px]"
      >
        <NuxtLink
          v-for="pooja in pagedPoojas"
          :key="pooja.id"
          :to="`/services/${pooja.id}`"
          class="group bg-white border border-[#ccc] shadow-2xs rounded-[12px] overflow-hidden"
        >
          <!-- IMAGE -->
          <div class="w-full h-[250px] bg-white overflow-hidden px-[10px] pt-[10px] mb-[5px]">
            <img
              v-if="poojaImage(pooja)"
              :src="poojaImage(pooja)"
              class="w-full h-full object-cover rounded-[12px]"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400"
            >
              No Image
            </div>
          </div>

          <!-- CONTENT -->
          <div class="px-[20px] py-[10px] flex flex-col">
            <!-- TOP META -->
            <div
              class="flex items-center justify-between uppercase text-[12px] font-[500] text-[#888] mb-[10px]"
            >
              <div class="flex items-center gap-1">
                <span class="material-icons text-[14px]">event_available</span>

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

              <div
                v-if="pooja.categories?.length"
                class="text-[11px] uppercase tracking-wide"
              >
                {{ pooja.categories[0].name }}
              </div>
            </div>

            <!-- TITLE -->
            <h3
              class="text-[20px] leading-[1.2] capitalize font-[600] text-[#570000] mb-[20px]"
            >
              {{ pooja.name }}
            </h3>

            <!-- META -->
            <div class="flex flex-wrap gap-2 mb-[45px]">
              <div class="meta-pill">
                <span class="material-icons">schedule</span>
                {{ formatDuration(pooja.durationMin) }}
              </div>

              <div v-if="pooja.prepTimeMin" class="meta-pill">
                <span class="material-icons">build</span>
                Prep {{ formatDuration(pooja.prepTimeMin) }}
              </div>

              <div v-if="pooja.bufferMin" class="meta-pill">
                <span class="material-icons">hourglass_bottom</span>
                Buffer {{ formatDuration(pooja.bufferMin) }}
              </div>
            </div>

            <!-- FOOTER -->
            <div
              class="flex items-center justify-between pt-[10px]
                     border-t-[1px] border-[#ccc]/60"
            >
              <div class="text-[20px] font-semibold text-[#111]">
                {{ formatMoney(pooja.amount) }}
              </div>

              <span
                class="bg-[#3d3d3d] border border-[#570000] text-white
                       px-[22px] py-[8px] rounded-[8px]
                       text-[14px] font-medium"
              >
                View Details
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- PAGINATION -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center gap-2 mt-[40px]"
      >
        <button
          @click="page--"
          :disabled="page === 1"
          class="pagination-btn"
        >
          Prev
        </button>

        <button
          v-for="p in totalPages"
          :key="p"
          @click="page = p"
          class="pagination-btn"
          :class="{ active: page === p }"
        >
          {{ p }}
        </button>

        <button
          @click="page++"
          :disabled="page === totalPages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>

      <!-- VIEW ALL -->
      <NuxtLink
        to="/services"
        class="
          bg-[#570000]
          border-2 border-[#570000]
          text-white
          px-[40px] py-[12px]
          rounded-[30px]
          mx-auto block w-fit mt-[50px]
          text-[16px]
          transition-colors duration-200
          hover:bg-transparent hover:text-[#570000]
        "
      >
        View All
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { usePoojaService } from '@/composables/usePoojaService'
import bg from '@/assets/images/bg-pooja.png'

/* ================= STATE ================= */
const page = ref(1)
const perPage = 6

const poojas = ref([])
const error = ref(false)

const { fetchPoojas } = usePoojaService()
const config = useRuntimeConfig().public

/* ================= FETCH ================= */
onMounted(async () => {
  try {
    poojas.value = await fetchPoojas()
  } catch (e) {
    console.error(e)
    error.value = true
  }
})

/* ================= PAGINATION ================= */
const pagedPoojas = computed(() => {
  const start = (page.value - 1) * perPage
  return poojas.value.slice(start, start + perPage)
})

const totalPages = computed(() =>
  Math.ceil(poojas.value.length / perPage)
)

/* ================= HELPERS ================= */
function poojaImage(p) {
  const rel = p?.featuredMedia?.url || p?.photoUrl
  if (!rel) return ''
  return rel.startsWith('http') ? rel : `${config.apiBase}${rel}`
}

function formatDuration(minutes) {
  if (!minutes) return '—'
  if (minutes % 60 === 0) return `${minutes / 60} hr`
  return `${minutes} min`
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}
</script>

<style scoped>
.material-icons {
  font-size: 18px;
  vertical-align: middle;
}

.meta-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  background: #f5f5f5;
  padding: 2px 10px;
  border-radius: 999px;
}

.pagination-btn {
  padding: 8px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  font-size: 14px;
}

.pagination-btn.active {
  background: #570000;
  color: white;
  border-color: #570000;
}

.pagination-btn:disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
