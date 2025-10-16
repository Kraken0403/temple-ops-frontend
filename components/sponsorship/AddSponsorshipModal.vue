<!-- File: components/sponsorship/AddSponsorshipModal.vue -->
<template>
  <transition name="fade">
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#ccc] bg-[#f5f5f5] flex justify-between items-center">
          <h3 class="text-[18px] font-semibold text-gray-800">
            {{ sponsorshipToEdit ? 'Edit Sponsorship Type' : 'Add Sponsorship Type' }}
          </h3>
          <button @click="close" class="text-gray-500 hover:text-gray-700 cursor-pointer">
            <i class="material-icons">close</i>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 overflow-auto flex-1">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                required
                placeholder="e.g. Title Sponsor"
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.description"
                placeholder="e.g. Main event sponsor with max visibility"
                rows="3"
                required
                class="w-full p-2 border border-gray-300 rounded resize-none"
              />
            </div>

            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Base Price <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.price"
                type="number"
                min="1"
                required
                placeholder="e.g. 50000"
                class="w-full p-2 border border-gray-300 rounded"
              />
              <p class="text-xs text-gray-500 mt-1">
                This is the default price. Event assignments can override it if needed.
              </p>
            </div>

            <hr class="border-gray-200" />

            <!-- Standalone toggle -->
            <div class="flex items-start gap-3">
              <input
                id="isStandalone"
                type="checkbox"
                v-model="isStandalone"
                class="mt-1"
              />
              <label for="isStandalone" class="text-sm text-gray-800">
                Make this a <strong>General (Standalone)</strong> sponsorship
                <div class="text-xs text-gray-500">
                  When enabled, this type becomes directly purchasable (not tied to a specific event).
                </div>
              </label>
            </div>

            <!-- Standalone-only fields -->
            <div v-if="isStandalone" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Default Slots <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="form.defaultMaxSlots"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 10"
                  class="w-full p-2 border border-gray-300 rounded"
                />
                <p class="text-xs text-gray-500 mt-1">
                  How many sponsors can purchase this general sponsorship.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Starts At
                  </label>
                  <input
                    v-model="form.startsAt"
                    type="datetime-local"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Ends At
                  </label>
                  <input
                    v-model="form.endsAt"
                    type="datetime-local"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input id="isActive" type="checkbox" v-model="form.isActive" />
                <label for="isActive" class="text-sm text-gray-800">Active</label>
              </div>

              <p class="text-xs text-gray-500">
                Availability windows (Starts/Ends) limit when this general sponsorship is purchasable.
                Leave blank to keep it always available (while Active).
              </p>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
          <button
            @click="close"
            class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="submitForm"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          >
            {{ sponsorshipToEdit ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { useSponsorshipService } from '~/composables/useSponsorshipService'
import { useNotification } from '~/composables/useNotification'

const emit = defineEmits(['close', 'saved'])
const props = defineProps({
  sponsorshipToEdit: { type: Object, default: null }
})

const { createSponsorshipType, updateSponsorshipType } = useSponsorshipService()
const { showNotification } = useNotification()

const form = reactive({
  name: '',
  description: '',
  price: null,

  // standalone-related
  defaultMaxSlots: null,   // number | null
  startsAt: '',            // datetime-local string
  endsAt: '',              // datetime-local string
  isActive: true
})

/** UI checkbox computed from defaultMaxSlots */
const isStandalone = computed({
  get: () => !!form.defaultMaxSlots && Number(form.defaultMaxSlots) > 0,
  set: (val) => {
    if (val) {
      // sensible default if user toggles on
      if (!form.defaultMaxSlots || Number(form.defaultMaxSlots) <= 0) {
        form.defaultMaxSlots = 1
      }
    } else {
      // turning off clears standalone-related fields
      form.defaultMaxSlots = null
      form.startsAt = ''
      form.endsAt = ''
      form.isActive = true
    }
  }
})

watch(
  () => props.sponsorshipToEdit,
  (val) => {
    if (val) {
      form.name = val.name || ''
      form.description = val.description || ''
      form.price = val.price ?? null

      // standalone mirrors type fields
      form.defaultMaxSlots = val.defaultMaxSlots ?? null
      form.startsAt = val.startsAt ? toLocalInput(val.startsAt) : ''
      form.endsAt   = val.endsAt   ? toLocalInput(val.endsAt)   : ''
      form.isActive = val.isActive ?? true
    } else {
      // reset for create mode
      form.name = ''
      form.description = ''
      form.price = null
      form.defaultMaxSlots = null
      form.startsAt = ''
      form.endsAt = ''
      form.isActive = true
    }
  },
  { immediate: true }
)

function toLocalInput(iso) {
  try {
    const d = new Date(iso)
    // yyyy-MM-ddThh:mm for datetime-local
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

function normalizeDate(value) {
  if (!value) return null
  // value is datetime-local like "2025-10-15T04:30"
  const d = new Date(value)
  const iso = d.toISOString()
  return iso
}

function close() {
  emit('close')
}

async function submitForm() {
  try {
    if (!form.name.trim() || !form.description.trim() || !form.price) {
      showNotification('❌ Please fill all mandatory fields', 'error')
      return
    }
    if (isStandalone.value && (!form.defaultMaxSlots || Number(form.defaultMaxSlots) <= 0)) {
      showNotification('❌ Default Slots must be at least 1 for standalone sponsorship', 'error')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),

      // include standalone-related only if enabled
      defaultMaxSlots: isStandalone.value ? Number(form.defaultMaxSlots) : null,
      startsAt: isStandalone.value ? normalizeDate(form.startsAt) : null,
      endsAt:   isStandalone.value ? normalizeDate(form.endsAt)   : null,
      isActive: isStandalone.value ? !!form.isActive : true,
    }

    if (props.sponsorshipToEdit?.id) {
      await updateSponsorshipType(props.sponsorshipToEdit.id, payload)
      showNotification('✅ Sponsorship type updated successfully', 'success')
    } else {
      await createSponsorshipType(payload)
      showNotification('✅ Sponsorship type created successfully', 'success')
    }

    emit('saved')
  } catch (err) {
    console.error('❌ Failed to save sponsorship:', err)
    const msg = err?.response?._data?.message || err?.message || 'Failed to save.'
    showNotification(msg, 'error')
  }
}
</script>

<style scoped>
.material-icons { font-size: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
