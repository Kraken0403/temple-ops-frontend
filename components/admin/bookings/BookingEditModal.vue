<template>
    <div
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
  
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h3 class="text-xl font-semibold">
            Edit Booking #{{ booking.id }}
          </h3>
          <button
            class="text-gray-500 hover:text-gray-700 text-2xl"
            @click="$emit('close')"
          >
            &times;
          </button>
        </div>
  
        <!-- Form -->
        <form @submit.prevent="submit" class="px-6 py-6 space-y-6">
  
          <!-- Pooja / Priest -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Pooja</label>
              <select v-model.number="form.poojaId" class="input" required>
                <option v-for="p in poojaOptions" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
  
            <div>
              <label class="label">Priest</label>
              <select v-model.number="form.priestId" class="input" required>
                <option
                  v-for="pr in currentPriests"
                  :key="pr.id"
                  :value="pr.id"
                >
                  {{ pr.name }}
                </option>
              </select>
            </div>
          </div>
  
          <!-- Date / Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Booking Date</label>
              <input type="date" v-model="form.bookingDate" class="input" required />
            </div>
  
            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="input" required>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="canceled">canceled</option>
                <option value="completed">completed</option>
              </select>
            </div>
          </div>
  
          <!-- Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Start</label>
              <input type="datetime-local" v-model="form.startLocal" class="input" required />
            </div>
            <div>
              <label class="label">End</label>
              <input type="datetime-local" v-model="form.endLocal" class="input" required />
            </div>
          </div>
  
          <!-- User -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input class="input" placeholder="User Name" v-model="form.userName" />
            <input class="input" placeholder="User Email" v-model="form.userEmail" />
            <input class="input" placeholder="User Phone" v-model="form.userPhone" />
          </div>
  
          <!-- Venue -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input class="input" placeholder="Address" v-model="form.venueAddress" />
            <input class="input" placeholder="State" v-model="form.venueState" />
            <input class="input" placeholder="ZIP" v-model="form.venueZip" />
          </div>
  
          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { useBookingService } from '@/composables/useBookingService'
  import { isoToLocalInput, localInputToUTC } from '@/utils/timezone'


  const props = defineProps({
    booking: { type: Object, required: true },
    poojaOptions: { type: Array, required: true }
  })
  
  const emit = defineEmits(['close', 'updated'])
  
  const { updateBooking } = useBookingService()
  const saving = ref(false)
  
  const form = ref({
    poojaId: null,
    priestId: null,
    bookingDate: '',
    startLocal: '',
    endLocal: '',
    status: '',
    userName: '',
    userEmail: '',
    userPhone: '',
    venueAddress: '',
    venueState: '',
    venueZip: ''
  })
  
  const currentPriests = computed(() => {
    return props.poojaOptions.find(p => p.id === form.value.poojaId)?.priests || []
  })
  
watch(
  () => props.booking,
  (b) => {
    if (!b) return

    form.value = {
      poojaId: b.poojaId,
      priestId: b.priestId,
      bookingDate: b.bookingDate?.slice(0, 10) || '',
      status: b.status,

      // ✅ correct timezone-safe conversion
      startLocal: isoToLocalInput(b.start),
      endLocal: isoToLocalInput(b.end),

      userName: b.userName || '',
      userEmail: b.userEmail || '',
      userPhone: b.userPhone || '',
      venueAddress: b.venueAddress || '',
      venueState: b.venueState || '',
      venueZip: b.venueZip || ''
    }
  },
  { immediate: true }
)

  

async function submit() {
  saving.value = true
  try {
    const payload = {
      poojaId: form.value.poojaId,
      priestId: form.value.priestId,
      bookingDate: form.value.bookingDate,
      status: form.value.status,

      // ✅ timezone-safe → backend always gets UTC
      start: localInputToUTC(form.value.startLocal),
      end: localInputToUTC(form.value.endLocal),

      userName: form.value.userName || undefined,
      userEmail: form.value.userEmail || undefined,
      userPhone: form.value.userPhone || undefined,

      venueAddress: form.value.venueAddress || undefined,
      venueState: form.value.venueState || undefined,
      venueZip: form.value.venueZip || undefined,
    }

    const updated = await updateBooking(props.booking.id, payload)
    emit('updated', updated)
    emit('close')

    console.log('Payload', payload)
  }
  catch(err){
    console.log('saving error: ', err)
  }
}


  </script>
  
  <style scoped>
  /* .label { @apply block text-sm font-medium text-gray-700 mb-1; }
  .input { @apply w-full p-2 border border-gray-300 rounded; }
  .btn-primary { @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700; }
  .btn-secondary { @apply px-4 py-2 border rounded bg-white hover:bg-gray-50; } */
  </style>
  