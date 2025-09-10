<template>
  <div v-if="pooja">
    <h2 class="text-[22px] font-bold text-center mb-[30px]">Select a Time Slot</h2>

    <!-- Priest Selection -->
    <div class="mb-6">
      <label class="block font-medium mb-2">Select Priest</label>

      <!-- Multiple priests: show radios -->
      <div v-if="priests.length > 1" class="space-y-2">
        <label
          v-for="priest in priests"
          :key="priest.id"
          class="flex items-center space-x-2"
        >
          <input
            type="radio"
            :value="priest.id"
            v-model="selectedPriestId"
            class="form-radio text-blue-600"
            @change="onPriestPicked(priest.id)"
          />
          <span>{{ priest.name }}</span>
        </label>
      </div>

      <!-- Single priest: show as fixed selection -->
      <div
        v-else-if="priests.length === 1"
        class="flex items-center justify-between rounded-md border border-[#ccc] p-3"
      >
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full bg-blue-600"></span>
          <span class="font-medium">{{ singlePriest?.name }}</span>
        </div>
        <span class="text-xs text-gray-500">Selected</span>
      </div>

      <!-- No priests available -->
      <div v-else class="rounded-md border border-[#ccc] p-3 text-gray-600">
        No priest is assigned to this pooja yet. Please contact admin.
      </div>
    </div>

    <!-- Date picker -->
    <div class="mb-6 mt-4">
      <label class="block font-medium mb-1">Choose Date</label>
      <input
        v-model="selectedDate"
        type="date"
        :min="minDate"
        required
        class="form-input w-full rounded-[3px] border-[#ccc] border p-2"
        @change="onDateChange"
      />
    </div>

    <!-- Guards -->
    <div v-if="!selectedDate || !selectedPriestId" class="text-gray-600">
      Please select a priest and date to see available slots.
    </div>

    <!-- No slots -->
    <div v-else-if="bookableChunks.length === 0" class="text-red-600">
      ❌ No available slots for {{ formatDate(selectedDate) }}.
    </div>

    <!-- Slots -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="slot in bookableChunks"
        :key="`${slot.priestId}-${slot.start}-${slot.end}`"
        @click="onSelect(slot)"
        class="cursor-pointer p-4 rounded-lg border flex justify-between items-center transition"
        :class="selectedSlot === slot
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 bg-white'"
      >
        <div class="font-semibold text-gray-800 text-[14px]">
          {{ formatTime(slot.start) }} – {{ formatTime(slot.end) }}
        </div>
        <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center">
          <div
            class="w-4 h-4 rounded-full border-2"
            :class="selectedSlot === slot
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-400 bg-white'"
          />
        </div>
      </div>
    </div>

    <!-- Continue -->
    <div class="mt-6 text-right">
      <button
        :disabled="!selectedSlot"
        @click="proceed"
        class="px-5 py-2 rounded text-white"
        :class="selectedSlot
          ? 'bg-blue-600 hover:bg-blue-700'
          : 'bg-gray-400 cursor-not-allowed'"
      >
        Continue to Next Step
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRuntimeConfig } from '#app'
import { usePriestService } from '@/composables/usePriestService'
import { toLocalYMD } from '@/utils/date'

const props = defineProps({ pooja: { type: Object, required: true } })
const emit  = defineEmits(['next', 'update-slot'])

const { public: { apiBase } } = useRuntimeConfig()
const { getAvailableChunks } = usePriestService()

// Derived list so template never touches undefined
const priests = computed(() => props.pooja?.priests ?? [])
const singlePriest = computed(() => (priests.value.length === 1 ? priests.value[0] : null))

// Earliest allowed date = tomorrow (local)
const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toLocalYMD(d)
})

const selectedDate     = ref(minDate.value)
const selectedPriestId = ref(null)
const selectedSlot     = ref(null)
const bookableChunks   = ref([])

// Ensure selection: preselect only when exactly one priest
const ensurePriestSelection = () => {
  if (priests.value.length === 1) {
    selectedPriestId.value = singlePriest.value?.id ?? null
    console.info('[StepSlotSelection] Single priest auto-selected:', selectedPriestId.value)
  } else {
    // multiple or zero → wait for user
    selectedPriestId.value = null
  }
}
watch(priests, ensurePriestSelection, { immediate: true })
onMounted(ensurePriestSelection)

function onPriestPicked(id) {
  console.info('[StepSlotSelection] Priest picked via radio:', id)
}
function onDateChange(e) {
  console.info('[StepSlotSelection] Date input changed:', e?.target?.value)
}

// Display helpers (avoid UTC shift)
function formatDateYMD(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
}
const formatDate = formatDateYMD
const formatTime = iso => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// Sync selection upwards
watch(selectedSlot, slot => {
  if (slot) emit('update-slot', { slot, bookingDate: selectedDate.value })
})

// Fetch chunks whenever date or priest changes
watch([selectedDate, selectedPriestId], async () => {
  selectedSlot.value   = null
  bookableChunks.value = []

  if (!selectedDate.value || !selectedPriestId.value) {
    console.warn('[StepSlotSelection] Missing selection → no fetch', {
      selectedDate: selectedDate.value,
      selectedPriestId: selectedPriestId.value
    })
    return
  }

  const totalBlock =
    (props.pooja?.durationMin || 0) +
    (props.pooja?.prepTimeMin  || 0) +
    (props.pooja?.bufferMin    || 0)

  const priestIdNum = Number(selectedPriestId.value)
  const url = new URL(`${apiBase}/priest/${encodeURIComponent(priestIdNum)}/available-chunks`)
  url.searchParams.set('bookingDate', selectedDate.value)
  url.searchParams.set('totalMinutes', String(totalBlock))

  console.info('[StepSlotSelection] Will fetch chunks:', {
    apiBase, priestId: priestIdNum, bookingDate: selectedDate.value, totalMinutes: totalBlock,
    url: url.toString()
  })

  try {
    const chunks = await getAvailableChunks(priestIdNum, selectedDate.value, totalBlock)

    if (Array.isArray(chunks)) {
      console.info('[StepSlotSelection] Chunks fetched:', { count: chunks.length, first: chunks[0] })
    } else {
      console.error('[StepSlotSelection] Unexpected response (not array):', chunks)
    }

    bookableChunks.value = Array.isArray(chunks) ? chunks.filter(c => c.type === 'AVAILABLE') : []
  } catch (e) {
    console.error('[StepSlotSelection] Fetch failed:', e)
    bookableChunks.value = []
  }
}, { immediate: true })

function onSelect(slot) { selectedSlot.value = slot }
function proceed() { if (selectedSlot.value) emit('next') }
</script>
