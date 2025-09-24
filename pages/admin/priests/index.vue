<template>
  <div class="space-y-4">
    <UtilsBar title="All Priests" buttonLabel="Add Priest" @action="openModal" />

    <div class="cards bg-white h-min-[100vh] flex flex-col gap-[10px] p-[15px]">
      <NuxtLink
        v-for="priest in priests"
        :key="priest.id"
        :to="`/admin/priests/${priest.id}`"
        class="flex justify-between items-start p-4 bg-white border-1 border-[#cccccc] rounded-[3px] shadow-sm hover:shadow-md transition no-underline text-inherit"
      >
        <!-- Left: Image + Info -->
        <div class="flex gap-4">
          <!-- Image -->
          <div class="w-24 h-24 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-400">
            <img
              v-if="imageSrc(priest)"
              :src="imageSrc(priest)"
              alt="Priest photo"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          </div>

          <!-- Text Info -->
          <div>
            <h3 class="text-[16px] font-semibold text-[#111111] mb-[8px]">{{ priest.name }}</h3>
            <p class="text-[14px] font-semibold text-gray-600">
              Specialty:
              <span class="font-[400] text-gray-500">{{ priest.specialty || '—' }}</span>
            </p>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex flex-row items-end space-x-[10px]">
          <button @click.stop="editPriest(priest.id)" class="text-blue-600 hover:text-blue-800 flex items-center">
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[15px]">edit</span>
            </div>
          </button>
          <button @click.stop="deletePriest(priest.id)" class="text-red-600 hover:text-red-800 flex items-center">
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[15px]">delete</span>
            </div>
          </button>
        </div>
      </NuxtLink>
    </div>

    <AddPriestModal
      v-if="isModalOpen"
      @close="isModalOpen = false"
      @created="handlePriestCreated"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import UtilsBar from '@/components/UtilsBar.vue'
import AddPriestModal from '@/components/priest/AddPriestModal.vue'
import { ref, onMounted } from 'vue'
import { usePriestService } from '@/composables/usePriestService'
import { useMediaService } from '@/composables/useMediaService'

const { fetchPriests } = usePriestService()
const { fullUrl } = useMediaService()

const priests = ref([])
const isModalOpen = ref(false)

async function loadPriests() {
  priests.value = await fetchPriests() // backend includes featuredMedia
}

onMounted(loadPriests)
const openModal = () => { isModalOpen.value = true }

const handlePriestCreated = async () => {
  priests.value = await fetchPriests()
  isModalOpen.value = false
}

/** prefer featuredMedia; (legacy) fallback removed from schema but harmless if present */
function imageSrc(p) {
  const rel =
    p?.featuredMedia?.url ||
    p?.featuredMedia?.path ||
    null

  if (!rel) return ''
  const base = fullUrl(rel)
  const ver  = p?.featuredMedia?.updatedAt || p?.updatedAt || Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

function editPriest(id) {}
function deletePriest(id) {}
</script>

<style scoped>
.icon-wrapper { width: 35px; height: 35px; cursor: pointer; }
.material-icons { font-size: 18px; }
</style>
