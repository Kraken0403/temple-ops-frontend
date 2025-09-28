<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">How many seats?</h2>

    <input
      type="number"
      v-model.number="localPax"
      min="1"
      class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
    />

    <div class="flex justify-between mt-6">
      <button
        @click="onBack"
        :disabled="props.stepIndex === 0"
        class="px-4 py-2 cursor-pointer bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
      >
        Back
      </button>
      <button
        @click="onNext"
        class="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { showNotification } = useNotification()

const props = defineProps({
  pax:       { type: Number, required: true },
  stepIndex: { type: Number, required: true }
})
const emit = defineEmits(['update-pax', 'next', 'back'])

const localPax = ref(props.pax)
watch(localPax, v => emit('update-pax', v))

function onNext() {
  if (localPax.value >= 1) {
    showNotification(`Selected ${localPax.value} seat(s)`, 'success')
    emit('next')
  } else {
    showNotification('Please select at least 1 seat', 'error')
  }
}
function onBack() { emit('back') }
</script>
