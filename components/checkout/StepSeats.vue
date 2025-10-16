<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">How many seats would you like?</h2>
      <p class="text-sm text-gray-500">Select the number of attendees for this booking.</p>
    </div>

    <div class="flex items-center justify-center">
      <button
        @click="decrease"
        class="w-10 h-10 flex items-center justify-center text-lg border rounded-l-md hover:bg-gray-100"
      >−</button>

      <input
        type="number"
        v-model.number="localPax"
        min="1"
        class="w-20 text-center text-xl border-y py-2 focus:ring-2 focus:ring-orange-500"
      />

      <button
        @click="increase"
        class="w-10 h-10 flex items-center justify-center text-lg border rounded-r-md hover:bg-gray-100"
      >＋</button>
    </div>

    <div class="flex justify-between pt-8 border-t border-gray-200">
      <button
        @click="onBack"
        :disabled="props.stepIndex === 0"
        class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      >
        Back
      </button>
      <button
        @click="onNext"
        class="px-6 py-2 rounded-md bg-orange-600 text-white font-medium hover:bg-orange-700 transition"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

const props = defineProps({
  pax: { type: Number, required: true },
  stepIndex: { type: Number, required: true }
})
const emit = defineEmits(['update-pax', 'next', 'back'])

const localPax = ref(props.pax)
watch(localPax, (v) => emit('update-pax', v))

function increase() {
  localPax.value++
}
function decrease() {
  if (localPax.value > 1) localPax.value--
}

function onNext() {
  if (localPax.value >= 1) {
    showNotification(`Selected ${localPax.value} seat(s)`, 'success')
    emit('next')
  } else {
    showNotification('Please select at least 1 seat', 'error')
  }
}
function onBack() {
  emit('back')
}
</script>
