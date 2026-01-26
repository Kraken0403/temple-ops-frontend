<template>
  <div>
    <h2 class="text-[22px] font-bold mb-[30px] text-center">
      Venue Details
    </h2>

    <!-- Choice -->
    <div v-if="showChoice" class="mb-5 border rounded p-3 bg-gray-50">
      <p class="text-sm font-medium text-gray-700 mb-2">
        Where would you like the service?
      </p>

      <label class="flex items-center gap-2 mb-2">
        <input type="radio" value="temple" v-model="choice" />
        <span>Use temple venue</span>
      </label>

      <label class="flex items-center gap-2">
        <input type="radio" value="custom" v-model="choice" />
        <span>At your location</span>
      </label>
    </div>

    <!-- Temple venue -->
    <div v-if="useTemple" class="rounded border p-4 mb-6">
      <h3 class="font-semibold mb-1">Temple Venue</h3>

      <p class="text-gray-800">
        <span class="font-medium">
          {{ selectedVenue?.title || 'Temple Venue' }}
        </span>
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
      >
        View map
      </a>
    </div>

    <!-- Outside venue -->
    <div v-if="showCustomForm" class="space-y-4">
      <!-- Address autocomplete -->
      <AddressAutocomplete @selected="onAddressSelected" />

      <p v-if="localVenue.addressLine" class="text-sm text-green-700">
        📍 {{ localVenue.addressLine }}
      </p>

      <!-- Map -->
      <MapPicker
        v-if="localVenue.lat && localVenue.lng"
        :lat="localVenue.lat"
        :lng="localVenue.lng"
        draggable
        @picked="onLocationPicked"
      />

      <!-- Address extra -->
      <div>
        <label class="block text-sm font-medium mb-1">
          House / Flat / Landmark
        </label>
        <input
          v-model="localVenue.addressExtra"
          class="w-full border p-[10px] rounded"
          placeholder="Flat, floor, landmark (optional)"
        />
      </div>

      <!-- City / State / Zip -->
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">City</label>
          <input
            v-model="localVenue.city"
            class="w-full border p-[10px] rounded"
            placeholder="City"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">State</label>
          <input
            v-model="localVenue.state"
            class="w-full border p-[10px] rounded"
            placeholder="State"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Zip / Pincode</label>
          <input
            v-model="localVenue.zip"
            class="w-full border p-[10px] rounded"
            placeholder="Zip / Pincode"
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between mt-6">
      <button
        @click="$emit('goBack')"
        class="px-4 py-2 bg-gray-300 rounded"
      >
        Back
      </button>

      <button
        @click="nextStep"
        class="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useVenueService } from '@/composables/useVenueService'
import { useNotification } from '@/composables/useNotification'

import AddressAutocomplete from '@/components/maps/AddressAutocomplete.vue'
import MapPicker from '@/components/maps/MapPicker.vue'

const { showNotification } = useNotification()
const { fetchVenues } = useVenueService()

const props = defineProps({
  pooja: { type: Object, required: true },
  venue: { type: Object, required: true },
})

const emit = defineEmits(['next', 'goBack', 'update-venue'])

const resolvedVenue = ref(null)

/* ───────── Flags ───────── */
const hasTempleFlag = computed(() => !!props.pooja?.isInVenue)
const hasOutsideFlag = computed(() => !!props.pooja?.isOutsideVenue)
const hasTempleVenueAssigned = computed(
  () => !!(props.pooja?.venueRel || props.pooja?.venueId)
)

const selectedVenue = computed(
  () => resolvedVenue.value || props.pooja?.venueRel || null
)

const showChoice = computed(
  () => hasTempleFlag.value && hasOutsideFlag.value && hasTempleVenueAssigned.value
)

const choice = ref('custom')

watch(showChoice, (v) => {
  if (!v) {
    choice.value =
      hasTempleFlag.value && hasTempleVenueAssigned.value
        ? 'temple'
        : 'custom'
  }
}, { immediate: true })

const useTemple = computed(() => {
  if (!hasTempleFlag.value || !hasTempleVenueAssigned.value) return false
  return showChoice.value ? choice.value === 'temple' : true
})

const showCustomForm = computed(() => {
  if (!hasOutsideFlag.value) return false
  if (hasTempleFlag.value && hasTempleVenueAssigned.value) {
    return choice.value === 'custom'
  }
  return true
})

/* ───────── Venue state (UI + pricing source) ───────── */
const localVenue = ref({
  addressLine: '',
  addressExtra: '',
  city: '',
  state: '',
  zip: '',
  lat: null,
  lng: null,
})

/**
 * Restore state when navigating back
 */
watch(
  () => props.venue,
  (v) => {
    if (!v) return
    Object.assign(localVenue.value, {
      addressLine: v.address || localVenue.value.addressLine,
      city: v.city || localVenue.value.city,
      state: v.state || localVenue.value.state,
      zip: v.zip || localVenue.value.zip,
      lat: typeof v.lat === 'number' ? v.lat : localVenue.value.lat,
      lng: typeof v.lng === 'number' ? v.lng : localVenue.value.lng,
    })
  },
  { deep: true, immediate: true }
)

/* ───────── Fetch temple venue ───────── */
onMounted(async () => {
  if (!hasTempleVenueAssigned.value || props.pooja?.venueRel) return
  const venues = await fetchVenues()
  resolvedVenue.value =
    venues.find(v => Number(v.id) === Number(props.pooja.venueId)) || null
})

/* ───────── Handlers ───────── */
function onAddressSelected(data) {
  localVenue.value.addressLine = data.addressLine || ''
  localVenue.value.city = data.city || ''
  localVenue.value.state = data.state || ''
  localVenue.value.zip = data.zip || ''
  localVenue.value.lat = data.lat
  localVenue.value.lng = data.lng

  showNotification('Address selected', 'success')
}

function onLocationPicked(data) {
  localVenue.value.lat = data.lat
  localVenue.value.lng = data.lng
}

function nextStep() {
  if (useTemple.value) {
    const v = selectedVenue.value

    console.log('venue selected', v)
    emit('update-venue', {
      venueType: 'TEMPLE',
      address: [v?.title, v?.address].filter(Boolean).join(', ') || 'Temple Venue',
      city: '',
      state: '',
      zip: v?.zipcode || '',
      lat: null,
      lng: null,
    })
    emit('next')
    return
  }

  const { addressLine, lat, lng } = localVenue.value

  if (!addressLine || !lat || !lng) {
    showNotification('Please select a valid address', 'error')
    return
  }

  emit('update-venue', {
    venueType: 'CUSTOM',
    address: [localVenue.addressExtra, addressLine].filter(Boolean).join(', '),
    city: localVenue.city,
    state: localVenue.state,
    zip: localVenue.zip,
    lat,
    lng,
  })


  emit('next')
}
</script>
