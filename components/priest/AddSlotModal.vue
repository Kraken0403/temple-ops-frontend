<template>
  <transition name="fade">
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]"
        >
          <h3 class="text-[18px] font-semibold text-gray-800">Add Availability Slot</h3>
          <button @click="$emit('close')" class="text-gray-500 cursor-pointer hover:text-gray-700">
            <i class="material-icons">close</i>
          </button>
        </div>

        <!-- Scrollable Body -->
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                v-model="date"
                type="date"
                required
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
              />
            </div>

            <!-- Weekly days -->
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-1">Days of Week</label>
              <div class="grid grid-cols-3 gap-2">
                <label
                  v-for="day in weekdays"
                  :key="day.value"
                  class="inline-flex items-center space-x-2"
                >
                  <input type="checkbox" :value="day.value" v-model="daysOfWeek" />
                  <span class="text-gray-800">{{ day.label }}</span>
                </label>
              </div>
            </div>

            <!-- Time Range -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  v-model="startTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  v-model="endTime"
                  type="time"
                  required
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                />
              </div>
            </div>

            <!-- Slot Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slot Type</label>
              <select
                v-model="type"
                required
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </div>

            <!-- Disabled (auto-set when BUSY/HOLIDAY) -->
            <div>
              <label class="inline-flex items-center space-x-2">
                <input type="checkbox" v-model="disabled" />
                <span class="text-gray-800">Disabled</span>
              </label>
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3"
        >
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="submitForm"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { usePriestService } from '@/composables/usePriestService'
import { useNotification } from '@/composables/useNotification'

const props = defineProps({
  priestId: { type: [String, Number], required: true }
})
const emit = defineEmits(['close', 'created'])

const { createSlot } = usePriestService()
const { showNotification } = useNotification()

const mode       = ref('oneoff')
const date       = ref('')
const daysOfWeek = ref([])
const startTime  = ref('')
const endTime    = ref('')
const type       = ref('AVAILABLE')
const disabled   = ref(false)

const weekdays = [
  { label: 'Mon', value: 'Mon' },
  { label: 'Tue', value: 'Tue' },
  { label: 'Wed', value: 'Wed' },
  { label: 'Thu', value: 'Thu' },
  { label: 'Fri', value: 'Fri' },
  { label: 'Sat', value: 'Sat' },
  { label: 'Sun', value: 'Sun' },
]

async function submitForm() {
  try {
    let startVal, endVal

    if (mode.value === 'oneoff') {
      startVal = new Date(`${date.value}T${startTime.value}:00`).toISOString()
      endVal   = new Date(`${date.value}T${endTime.value}:00`).toISOString()
    } else {
      const base = '1970-01-01'
      startVal = new Date(`${base}T${startTime.value}:00Z`).toISOString()
      endVal   = new Date(`${base}T${endTime.value}:00Z`).toISOString()
    }

    const payload = {
      priestId:  Number(props.priestId),
      start:     startVal,
      end:       endVal,
      type:      type.value,
      disabled:  disabled.value,
      ...(mode.value === 'weekly' && { daysOfWeek: daysOfWeek.value }),
      ...(mode.value === 'oneoff'  && { date:       date.value       }),
    }

    await createSlot(payload)
    showNotification('Slot created successfully!', 'success')
    emit('created')
    emit('close')
  } catch (err) {
    console.error('❌ Failed to create slot:', err)
    showNotification(err.message || 'Failed to create slot', 'error')
  }
}
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
