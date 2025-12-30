<template>
  <transition name="fade">
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
          <h3 class="text-[18px] font-semibold text-gray-800">
            Add Availability Slot
          </h3>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
            <i class="material-icons">close</i>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 overflow-auto flex-1">
          <form @submit.prevent="submitForm" class="space-y-6">

            <!-- Mode -->
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" v-model="mode" value="oneoff" />
                <span class="ml-2">One-off</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" v-model="mode" value="weekly" />
                <span class="ml-2">Weekly</span>
              </label>
            </div>

            <!-- One-off Date -->
            <div v-if="mode === 'oneoff'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                v-model="date"
                type="date"
                required
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <!-- Weekly days -->
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Days of Week
              </label>
              <div class="grid grid-cols-3 gap-2">
                <label
                  v-for="day in weekdays"
                  :key="day.value"
                  class="inline-flex items-center space-x-2"
                >
                  <input type="checkbox" :value="day.value" v-model="daysOfWeek" />
                  <span>{{ day.label }}</span>
                </label>
              </div>
            </div>

            <!-- Time Range -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  v-model="startTime"
                  type="time"
                  required
                  class="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  v-model="endTime"
                  type="time"
                  required
                  class="w-full p-2 border rounded"
                />
              </div>
            </div>

            <!-- Slot Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Slot Type
              </label>
              <select v-model="type" required class="w-full p-2 border rounded">
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </div>

            <!-- Disabled -->
            <div>
              <label class="inline-flex items-center space-x-2">
                <input type="checkbox" v-model="disabled" />
                <span>Disabled</span>
              </label>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
          <button @click="$emit('close')" class="px-4 py-2 text-gray-700">
            Cancel
          </button>
          <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded">
            Save
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { DateTime } from 'luxon'

import { usePriestService } from '@/composables/usePriestService'
import { useNotification } from '@/composables/useNotification'
import { loadTimezone, normalizeYMDToUTC } from '@/utils/timezone'

const props = defineProps({
  priestId: { type: [String, Number], required: true }
})
const emit = defineEmits(['close', 'created'])

const { createSlot } = usePriestService()
const { showNotification } = useNotification()

// ───────── State ─────────
const mode       = ref('oneoff')
const date       = ref('')
const daysOfWeek = ref([])
const startTime  = ref('')
const endTime    = ref('')
const type       = ref('AVAILABLE')
const disabled   = ref(false)
const timezone   = ref('UTC')

// ───────── Weekdays (DTO-compatible) ─────────
const weekdays = [
  { label: 'Mon', value: 'MON' },
  { label: 'Tue', value: 'TUE' },
  { label: 'Wed', value: 'WED' },
  { label: 'Thu', value: 'THU' },
  { label: 'Fri', value: 'FRI' },
  { label: 'Sat', value: 'SAT' },
  { label: 'Sun', value: 'SUN' },
]

// ───────── Load timezone once ─────────
onMounted(async () => {
  timezone.value = await loadTimezone()
})

// Auto-disable BUSY / HOLIDAY
watch(type, v => {
  disabled.value = v !== 'AVAILABLE'
})

// ───────── Helpers ─────────
// ⚠️ IMPORTANT: DO NOT convert to UTC
function buildLocalTimeISO(timeHHmm) {
  return DateTime
    .fromFormat(`1970-01-01 ${timeHHmm}`, 'yyyy-MM-dd HH:mm', {
      zone: timezone.value
    })
    .toISO()
}

// ───────── Submit ─────────
async function submitForm() {
  try {
    if (mode.value === 'weekly' && !daysOfWeek.value.length) {
      showNotification('Select at least one weekday', 'error')
      return
    }

    const payload = {
      priestId: Number(props.priestId),
      start: buildLocalTimeISO(startTime.value),
      end: buildLocalTimeISO(endTime.value),
      disabled: disabled.value,
      type: type.value,
    }

    if (mode.value === 'weekly') {
      payload.daysOfWeek = daysOfWeek.value
    }

    if (mode.value === 'oneoff') {
      payload.date = normalizeYMDToUTC(date.value)
    }

    await createSlot(payload)
    showNotification('Slot created successfully!', 'success')
    emit('created')
    emit('close')

  } catch (err) {
    console.error(err)
    showNotification(err.message || 'Failed to create slot', 'error')
  }
}
</script>

<style scoped>
.material-icons { font-size: 20px }
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
