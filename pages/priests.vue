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
        <div v-if="loading" class="text-center text-gray-500">
          Loading priests…
        </div>

        <div v-else-if="error" class="text-center text-red-600">
          Failed to load priests.
        </div>

        <div v-else-if="!priests.length" class="text-center text-gray-500">
          No priests found.
        </div>

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
                  v-if="priestImage(p)"
                  :src="priestImage(p)"
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
                <h3 class="text-2xl font-bold text-[#570000]">
                  {{ p.name }}
                </h3>

                <p v-if="p.specialty" class="text-gray-800">
                  <span class="font-semibold">Specialty:</span>
                  {{ p.specialty }}
                </p>

                <!-- Chips -->
                <div class="flex flex-wrap gap-2">
                  <span
                    v-if="Array.isArray(p.languages) && p.languages.length"
                    class="chip"
                  >
                    <span class="material-icons">translate</span>
                    {{ p.languages.join(', ') }}
                  </span>

                  <span
                    v-if="Array.isArray(p.qualifications) && p.qualifications.length"
                    class="chip"
                  >
                    <span class="material-icons">school</span>
                    {{ p.qualifications.join(', ') }}
                  </span>
                </div>

                <!-- Address -->
                <p v-if="p.address" class="text-gray-700">
                  <span class="font-semibold">Address:</span>
                  {{ p.address }}
                </p>
              </div>

              <!-- Contact -->
              <div class="mt-6 flex justify-between text-sm text-gray-700">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-[#570000]">phone</span>
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
                  <span class="material-icons text-[#570000]">email</span>
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
import { useRuntimeConfig } from '#app'
import PageHero from '@/components/PageHero.vue'
import { usePriestService } from '@/composables/usePriestService'
import heroBg from '@/assets/images/sample-2.webp'

/* ================= STATE ================= */
const priests = ref([])
const loading = ref(true)
const error   = ref(false)

const { fetchPriests } = usePriestService()
const config = useRuntimeConfig().public

/* ================= IMAGE NORMALIZER ================= */
function getPriestImage(p) {
  if (!p) return ''

  // Case 1: p.photo is a STRING
  if (typeof p.photo === 'string') {
    return normalizeUrl(p.photo)
  }

  // Case 2: p.photo is an OBJECT
  if (typeof p.photo === 'object') {
    const path =
      p.photo.url ||
      p.photo.path ||
      p.photo.fileName ||
      ''

    return path ? normalizeUrl(path) : ''
  }

  return ''
}

function priestImage(p) {
  if (!p?.featuredMedia?.url) return ''

  const url = p.featuredMedia.url

  // absolute already
  if (url.startsWith('http')) return url

  // relative → make absolute
  return `${config.apiBase}${url}`
}


function normalizeUrl(path) {
  if (!path) return ''

  // already absolute
  if (path.startsWith('http')) return path

  // ensure leading slash
  const safePath = path.startsWith('/') ? path : `/${path}`
  return `${config.apiBase}${safePath}`
}

/* ================= FETCH ================= */
onMounted(async () => {
  try {
    const data = await fetchPriests()
    priests.value = Array.isArray(data) ? data : []
    console.log(priests.value)
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
  font-size: 18px;
  vertical-align: middle;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f3f4f6;
  border-radius: 999px;
  font-size: 14px;
}
</style>
