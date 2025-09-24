<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">Venue Detail</h2>

    <!-- Choice only when both modes are allowed and a temple venue exists -->
    <div v-if="showChoice" class="mb-5 border rounded p-3 bg-gray-50">
      <p class="text-sm font-medium text-gray-700 mb-2">Where would you like the service?</p>
      <label class="flex items-center gap-2 mb-2">
        <input type="radio" value="temple" v-model="choice" />
        <span>Use temple venue</span>
      </label>
      <label class="flex items-center gap-2">
        <input type="radio" value="custom" v-model="choice" />
        <span>Enter custom address</span>
      </label>
    </div>

    <!-- Temple venue card (read-only) -->
    <div v-if="useTemple" class="rounded border p-4 mb-6">
      <h3 class="font-semibold mb-1">Temple Venue</h3>
      <p class="text-gray-800">
        <span class="font-medium">{{ selectedVenue?.title || 'Temple Venue' }}</span>
        <template v-if="selectedVenue?.zipcode">
          — <span class="text-gray-600">{{ selectedVenue.zipcode }}</span>
        </template>
      </p>
      <p v-if="selectedVenue?.address" class="text-gray-700 mt-1">
        {{ selectedVenue.address }}
      </p>
      <a
        v-if="selectedVenue?.mapLink"
        :href="selectedVenue.mapLink"
        target="_blank"
        class="inline-block mt-2 text-blue-600 hover:underline"
      >View map</a>
    </div>

    <!-- Custom inputs -->
    <div v-if="showCustomForm" class="space-y-4">
      <div>
        <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          id="address"
          v-model="localVenue.address"
          placeholder="Enter venue address"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div>
        <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
        <input
          id="state"
          v-model="localVenue.state"
          placeholder="Enter state"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>

      <div>
        <label for="zip" class="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
        <input
          id="zip"
          v-model="localVenue.zip"
          placeholder="Enter zip code"
          required
          class="w-full rounded-[3px] border-[#ccc] border-[1px] p-[10px]"
        />
      </div>
    </div>

    <!-- Safety: if neither section is visible, show a small hint -->
    <div v-if="!useTemple && !showCustomForm" class="text-sm text-gray-500 mb-4">
      No venue options available for this service.
    </div>

    <!-- Actions -->
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
</template>

<script setup>
import { ref, computed, onMounted, watchEffect, watch } from 'vue'
import { useVenueService } from '@/composables/useVenueService'

const props = defineProps({
  pooja: { type: Object, required: true },
  venue: { type: Object, required: true } // { address, state, zip } passed from parent
})

const emit = defineEmits(['next', 'goBack', 'update-venue'])

const { fetchVenues } = useVenueService()

// Resolve venue from pooja (supports .venueRel or fallback by venueId)
const resolvedVenue = ref(null)

const hasTempleFlag = computed(() => !!props.pooja?.isInVenue)
const hasOutsideFlag = computed(() => !!props.pooja?.isOutsideVenue)
const hasTempleVenueAssigned = computed(() => !!(props.pooja?.venueRel || props.pooja?.venueId))

const selectedVenue = computed(() => resolvedVenue.value || props.pooja?.venueRel || null)

// UI toggling
const showChoice = computed(() => hasTempleFlag.value && hasOutsideFlag.value && hasTempleVenueAssigned.value)

// Default choice (reactive to showChoice becoming true later)
const choice = ref('custom')
watch(showChoice, (v) => {
  if (v && (choice.value !== 'temple' && choice.value !== 'custom')) {
    choice.value = 'temple'
  } else if (v && choice.value === 'custom') {
    // keep user's choice
  } else if (!v) {
    // if only in-venue, force temple; if only outside, force custom
    choice.value = hasTempleFlag.value && hasTempleVenueAssigned.value ? 'temple' : 'custom'
  }
}, { immediate: true })

// When only in-venue is allowed and a venue is assigned -> show temple card
const useTemple = computed(() => {
  if (!hasTempleFlag.value || !hasTempleVenueAssigned.value) return false
  // If both are allowed, depends on radio
  if (showChoice.value) return choice.value === 'temple'
  // Only in-venue
  return true
})

// Show custom form when:
// - only outside-venue allowed OR
// - both allowed and user picked "custom"
const showCustomForm = computed(() => {
  if (hasOutsideFlag.value && !hasTempleFlag.value) return true
  if (showChoice.value) return choice.value === 'custom'
  return false
})

// Local editable venue (for custom)
const localVenue = ref({ address: '', state: '', zip: '' })

// Keep localVenue in sync with incoming `venue` prop
watchEffect(() => {
  localVenue.value = {
    address: props.venue?.address || '',
    state: props.venue?.state || '',
    zip: props.venue?.zip || ''
  }
})

// If we only have venueId, fetch & resolve it so the card can show details
onMounted(async () => {
  if (!hasTempleVenueAssigned.value) return
  if (props.pooja?.venueRel) return

  const id = props.pooja?.venueId
  if (!id) return

  try {
    const list = await fetchVenues()
    const found = list.find(v => Number(v.id) === Number(id))
    if (found) resolvedVenue.value = found
  } catch {
    // ignore; card will just show a basic message
  }
})

function nextStep() {
  if (useTemple.value) {
    const v = selectedVenue.value
    const addr = [v?.title, v?.address].filter(Boolean).join(', ')
    const snapshot = {
      address: addr || 'Temple Venue',
      state: '', // unknown — not stored; optional
      zip: v?.zipcode || ''
    }
    emit('update-venue', snapshot)
    emit('next')
    return
  }

  // Custom venue validation
  const { address, state, zip } = localVenue.value
  if (!address || !state || !zip) {
    alert('Please fill all fields')
    return
  }
  emit('update-venue', { ...localVenue.value })
  emit('next')
}
</script>
