<template>
  <div v-if="pooja">
    <h2 class="text-[22px] font-bold text-center mb-[30px]">Select a Time Slot</h2>

    <!-- Priest Selection -->
    <div v-if="pooja.priests.length > 1" class="mb-6">
      <label class="block font-medium mb-2">Select Priest</label>
      <div class="space-y-2">
        <label
          v-for="priest in pooja.priests"
          :key="priest.id"
          class="flex items-center space-x-2"
        >
          <input
            type="radio"
            :value="priest.id"
            v-model="selectedPriestId"
            class="form-radio text-blue-600"
          />
          <span>{{ priest.name }}</span>
        </label>
      </div>
    </div>

    <!-- Default selection if only one priest -->
    <div v-else>
      <input type="hidden" v-model="selectedPriestId" />
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
      />
    </div>

    <!-- No date or priest selected -->
    <div v-if="!selectedDate || !selectedPriestId" class="text-gray-600">
      Please select a priest and date to see available slots.
    </div>

    <!-- No slots -->
    <div v-else-if="bookableChunks.length === 0" class="text-red-600">
      ❌ No available slots for {{ formatDate(selectedDate) }}.
    </div>

    <!-- Grid of slot-cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="slot in bookableChunks"
        :key="slot.start"
        @click="onSelect(slot)"
        class="cursor-pointer p-4 rounded-lg border flex justify-between items-center transition"
        :class="selectedSlot === slot
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 bg-white'"
      >
        <div>
          <div class="font-semibold text-gray-800 text-[14px]">
            {{ formatTime(slot.start) }} – {{ formatTime(slot.end) }}
          </div>
        </div>
        <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center">
          <div
            class="w-4 h-4 rounded-full border-2"
            :class="selectedSlot === slot
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-400 bg-white'"
          ></div>
        </div>
      </div>
    </div>

    <!-- Continue button -->
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
import { ref, watch, onMounted, computed} from 'vue'
import { usePriestService } from '@/composables/usePriestService'

const props = defineProps({
  pooja: { type: Object, required: true }
})
const emit = defineEmits(['next', 'update-slot'])

const { getAvailableChunks } = usePriestService()

const selectedDate     = ref('')
const selectedPriestId = ref(null)
const selectedSlot     = ref(null)
const bookableChunks   = ref([])

watch(selectedSlot, slot => {
  if (slot) emit('update-slot', { slot, bookingDate: selectedDate.value })
})

const formatTime = iso =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const formatDate = d =>
  new Date(d).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })

watch(
  [selectedDate, selectedPriestId],
  async () => {
    selectedSlot.value   = null
    bookableChunks.value = []

    if (!selectedDate.value || !selectedPriestId.value) return

    const totalBlock =
      (props.pooja.durationMin || 0) +
      (props.pooja.prepTimeMin  || 0) +
      (props.pooja.bufferMin    || 0)

    const chunks = await getAvailableChunks(
      selectedPriestId.value,
      selectedDate.value,
      totalBlock
    )

    // ◼️ ONLY keep AVAILABLE slots
    bookableChunks.value = chunks.filter(c => c.type === 'AVAILABLE')
  },
  { immediate: true }
)

onMounted(() => {
  if (props.pooja.priests.length === 1) {
    selectedPriestId.value = props.pooja.priests[0].id
  }
})

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0,10)
})

function onSelect(slot) {
  selectedSlot.value = slot
}

function proceed() {
  if (!selectedSlot.value) return
  emit('next')
}
</script>
