<template>
    <div>
      <label class="block text-sm font-medium mb-1">Address</label>
      <input
        ref="input"
        class="w-full border p-[10px] rounded"
        placeholder="Start typing address (worldwide)"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const emit = defineEmits(['selected'])
  const input = ref(null)
  
  onMounted(() => {
  const autocomplete = new google.maps.places.Autocomplete(input.value, {
    types: ['geocode'],
    fields: [
      'formatted_address',
      'geometry.location',
      'address_components',
    ],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.geometry) return

    const components = place.address_components || []

    const get = (type) =>
      components.find(c => c.types.includes(type))?.long_name || ''

    emit('selected', {
      addressLine: place.formatted_address,
      city: get('locality') || get('administrative_area_level_2'),
      state: get('administrative_area_level_1'),
      zip: get('postal_code'),
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    })
  })
})

  </script>
  