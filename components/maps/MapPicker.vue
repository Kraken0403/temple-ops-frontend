<template>
  <div class="h-[280px] rounded border overflow-hidden">
    <div ref="mapEl" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

/**
 * Props:
 * - lat, lng → controlled position from parent (address autocomplete)
 * - draggable → allow pin dragging (default true)
 */
const props = defineProps({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  draggable: { type: Boolean, default: true },
})

const emit = defineEmits(['picked'])

const mapEl = ref(null)

let map = null
let marker = null
let geocoder = null
let suppressEmit = false // prevents loops when parent updates lat/lng

/* ─────────────── INIT MAP ─────────────── */
onMounted(() => {
  geocoder = new google.maps.Geocoder()

  const initialCenter =
    props.lat && props.lng
      ? { lat: props.lat, lng: props.lng }
      : { lat: 23.0225, lng: 72.5714 } // Ahmedabad default

  map = new google.maps.Map(mapEl.value, {
    center: initialCenter,
    zoom: 15,
    disableDefaultUI: true,
  })

  // If lat/lng already provided → show marker
  if (props.lat && props.lng) {
    placeMarker(props.lat, props.lng, false)
  }

  // Click-to-move marker (still allowed)
  map.addListener('click', async (e) => {
    const lat = Number(e.latLng.lat().toFixed(6))
    const lng = Number(e.latLng.lng().toFixed(6))
    placeMarker(lat, lng, true)
  })
})

/* ─────────────── WATCH CONTROLLED PROPS ─────────────── */
watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (!map || lat == null || lng == null) return

    suppressEmit = true
    placeMarker(lat, lng, false)
    suppressEmit = false
  }
)

/* ─────────────── PLACE / MOVE MARKER ─────────────── */
async function placeMarker(lat, lng, shouldEmit = true) {
  if (!marker) {
    marker = new google.maps.Marker({
      map,
      draggable: props.draggable,
    })

    if (props.draggable) {
      marker.addListener('dragend', async (e) => {
        const lat = Number(e.latLng.lat().toFixed(6))
        const lng = Number(e.latLng.lng().toFixed(6))
        await emitPicked(lat, lng)
      })
    }
  }

  marker.setPosition({ lat, lng })
  map.panTo({ lat, lng })

  if (shouldEmit && !suppressEmit) {
    await emitPicked(lat, lng)
  }
}

/* ─────────────── EMIT PICKED DATA ─────────────── */
async function emitPicked(lat, lng) {
  const geo = await reverseGeocode(lat, lng)

  emit('picked', {
    lat,
    lng,
    ...geo,
  })
}

/* ─────────────── REVERSE GEOCODE ─────────────── */
function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== 'OK' || !results?.length) {
        resolve({})
        return
      }

      const components = results[0].address_components

      const get = (type) =>
        components.find(c => c.types.includes(type))?.long_name || ''

      resolve({
        addressLine: results[0].formatted_address,
        city: get('locality') || get('administrative_area_level_2'),
        state: get('administrative_area_level_1'),
        zip: get('postal_code'),
      })
    })
  })
}
</script>
