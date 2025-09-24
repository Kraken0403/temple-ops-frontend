<template>
  <div class="space-y-4">
    <UtilsBar
      title="Services List"
      buttonLabel="Add New Service"
      @action="openCreate"
    />

    <!-- Error -->
    <div v-if="priestError || poojaError" class="text-center text-red-600">
      Error loading data.
    </div>

    <!-- Card List -->
    <div class="cards bg-white h-min-[100vh] flex flex-col gap-[10px] p-[15px]">
      <NuxtLink
        v-for="p in poojas"
        :key="p.id"
        :to="`/admin/poojas/${p.id}`"
        class="flex justify-between items-start p-4 bg-white border-1 border-[#cccccc] rounded-[3px] shadow-sm hover:shadow-md transition no-underline text-inherit"
      >
        <!-- Left: Image + Info -->
        <div class="flex gap-4">
          <!-- Image -->
          <div class="w-24 h-24 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-400">
            <img
              v-if="imageSrc(p)"
              :src="imageSrc(p)"
              alt="Pooja Image"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
            >
              No Image
            </div>
          </div>

          <!-- Text Info -->
          <div>
            <h3 class="text-[16px] font-semibold text-[#111111] mb-[8px]">{{ p.name }}</h3>
            <p class="text-[14px] font-semibold text-gray-600">
              Type:
              <span class="font-[400] text-gray-500" v-if="p.isInVenue">In Venue</span>
              <span class="font-[400] text-gray-500" v-if="p.isOutsideVenue">
                {{ p.isInVenue ? '&' : '' }} Outside Venue
              </span>
            </p>
            <p class="text-[14px] font-semibold text-gray-600">
              Priests:
              <span class="font-[400] text-gray-500" v-if="p.priests?.length">
                {{ p.priests.map(pr => pr.name).join(', ') }}
              </span>
              <span v-else>—</span>
            </p>
            <p class="text-[14px] font-semibold text-gray-600">
              Duration: <span class="font-[400] text-gray-500">{{ p.durationMin }} min</span>
            </p>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex flex-row items-end space-x-[10px]">
          <button
            @click.stop="goToPooja(p.id)"
            class="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[15px]">edit</span>
            </div>
          </button>
          <button
            @click.stop="onDelete(p.id)"
            class="text-red-600 hover:text-red-800 flex items-center"
          >
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[15px]">delete</span>
            </div>
          </button>
        </div>
      </NuxtLink>
    </div>

    <!-- Add/Edit Modal -->
    <AddEditPoojaModal
      v-if="showModal"
      :pooja="null"
      :settingsCurrency="settings"
      @close="showModal = false"
      @created="onCreated"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useRouter, useRuntimeConfig } from '#app'
import UtilsBar from '~/components/UtilsBar.vue'
import AddEditPoojaModal from '@/components/poojas/AddEditPoojaModal.vue'
import { useSettingsService } from '~/composables/useSettingsService'
import { usePoojaService } from '~/composables/usePoojaService'
import { usePriestService } from '~/composables/usePriestService' // only for error aggregation
import { useMediaService } from '~/composables/useMediaService'   // ✅ for fullUrl + cache-busting

const config = useRuntimeConfig().public
const router = useRouter()

const { getSettings } = useSettingsService()
const { fetchPoojas, deletePooja } = usePoojaService()
const { fetchPriests } = usePriestService() // not used directly; keeps your old error check
const { fullUrl } = useMediaService()       // ✅

const poojas = ref([])
const settings = ref('INR')
const poojaError = ref(null)
const priestError = ref(null)
const showModal = ref(false)

/** Prefer featured media; fallback to legacy photoUrl. */
function imageSrc(p) {
  const rel =
    p?.featuredMedia?.url ||
    p?.featuredMedia?.path ||
    p?.photoUrl ||
    null
  if (!rel) return ''

  const base = fullUrl(rel)
  const ver =
    p?.featuredMedia?.updatedAt ||
    p?.updatedAt ||
    Date.now()
  return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
}

function goToPooja(id) { router.push(`/admin/poojas/${id}`) }

async function load() {
  try {
    const s = await getSettings()
    settings.value = s?.currency || 'INR'
  } catch { settings.value = 'INR' }

  try { poojas.value = await fetchPoojas() } catch (e) { poojaError.value = e }
  // preserve your old "priestError" banner logic
  try { await fetchPriests() } catch (e) { priestError.value = e }
}

function openCreate() { showModal.value = true }
async function onCreated() { showModal.value = false; await load() }

async function onDelete(id) {
  if (!confirm('Delete this pooja?')) return
  try {
    await deletePooja(id)
    poojas.value = poojas.value.filter(p => p.id !== id)
  } catch (e) {
    console.error('Delete error:', e)
    alert(e?.message || 'Failed to delete pooja')
  }
}

onMounted(load)
</script>

<style scoped>
.icon-wrapper { width: 35px; height: 35px; cursor: pointer; }
.material-icons { font-size: 18px; }
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
