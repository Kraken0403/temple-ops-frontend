<template>
  <section class="py-0 w-full mx-auto">
    <!-- Hero -->
    <PageHero
      title="The Priests"
      caption="Learn about the spiritual leaders of our temple."
      :imageUrl="heroBg"
    />

    <!-- Priests List -->
    <section class="bg-[#F8F9FA] py-16">
      <div class="max-w-[1190px] mx-auto px-4 space-y-8">
        <!-- Loading / Error / Empty -->
        <div v-if="loading" class="text-center text-gray-500">Loading priests…</div>
        <div v-else-if="error" class="text-center text-red-600">Failed to load priests.</div>
        <div v-else-if="!priests.length" class="text-center text-gray-500">No priests found.</div>

        <!-- Cards -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <article
            v-for="p in priests"
            :key="p.id"
            class="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6"
          >
            <!-- Photo -->
            <div class="w-full md:w-1/3">
              <div class="w-full h-64 md:h-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  v-if="p.photo"
                  :src="fullUrl(p.photo)"
                  :alt="p.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400"
                >
                  No Image
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="flex-1 flex flex-col justify-between">
              <div class="space-y-3">
                <h3 class="text-2xl font-bold text-[#570000]">{{ p.name }}</h3>

                <p v-if="p.specialty" class="text-gray-800">
                  <span class="font-semibold text-gray-700">Specialty:</span>
                  <span class="ml-1">{{ p.specialty }}</span>
                </p>

                <!-- Chips -->
                <div class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-if="p.languages?.length"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
                  >
                    <span class="material-icons text-[16px]">translate</span>
                    {{ (Array.isArray(p.languages) ? p.languages : []).join(', ') }}
                  </span>
                  <span
                    v-if="p.qualifications?.length"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
                  >
                    <span class="material-icons text-[16px]">school</span>
                    {{ (Array.isArray(p.qualifications) ? p.qualifications : []).join(', ') }}
                  </span>
                </div>

                <!-- Address -->
                <p v-if="p.address" class="text-gray-700">
                  <span class="font-semibold text-gray-700">Address:</span>
                  <span class="ml-1">{{ p.address }}</span>
                </p>
              </div>

              <!-- Contact -->
              <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                <div class="flex items-center gap-2">
                  <i class="material-icons text-[#570000]">phone</i>
                  <a
                    v-if="p.contactNo"
                    :href="`tel:${p.contactNo}`"
                    class="hover:underline"
                  >
                    {{ p.contactNo }}
                  </a>
                  <span v-else class="text-gray-400">—</span>
                </div>

                <div class="flex items-center gap-2">
                  <i class="material-icons text-[#570000]">email</i>
                  <a
                    v-if="p.email"
                    :href="`mailto:${p.email}`"
                    class="hover:underline break-all"
                  >
                    {{ p.email }}
                  </a>
                  <span v-else class="text-gray-400">—</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHero from '@/components/PageHero.vue'
import { usePriestService } from '@/composables/usePriestService'
import { useRuntimeConfig } from '#app'
import heroBg from '@/assets/images/sample-2.webp'

const { fetchPriests } = usePriestService()
const config   = useRuntimeConfig().public
const priests  = ref([])
const loading  = ref(true)
const error    = ref(false)

function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${config.apiBase}${path}`
}

onMounted(async () => {
  try {
    priests.value = await fetchPriests()
  } catch (e) {
    console.error('❌ Failed to load priests:', e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
