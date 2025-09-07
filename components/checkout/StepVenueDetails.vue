<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Venue Detail</h2>

    <div class="space-y-4">
      <div>
        <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          id="address"
          v-model="venue.address"
          placeholder="Enter venue address"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div>
        <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
        <input
          id="state"
          v-model="venue.state"
          placeholder="Enter state"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div>
        <label for="zip" class="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
        <input
          id="zip"
          v-model="venue.zip"
          placeholder="Enter zip code"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div class="flex justify-between mt-6">
        <button
          @click="$emit('goBack')"
          class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          @click="nextStep"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  venue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['next', 'update-venue'])

const nextStep = () => {
  const { address, state, zip } = props.venue || {}
  if (!address || !state || !zip) {
    alert('Please fill all fields')
    return
  }

  emit('update-venue', props.venue)
  emit('next')
}
</script>
