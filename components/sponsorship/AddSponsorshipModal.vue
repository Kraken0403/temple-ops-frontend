<template>
  <transition name="fade">
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[#ccc] bg-[#f5f5f5] flex justify-between items-center">
          <h3 class="text-[18px] font-semibold text-gray-800">
            {{ sponsorshipToEdit ? 'Edit Sponsorship Type' : 'Add Sponsorship Type' }}
          </h3>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <i class="material-icons">close</i>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 overflow-auto flex-1">
          <form @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                v-model="form.name"
                required
                placeholder="e.g. Title Sponsor"
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="form.description"
                placeholder="e.g. Main event sponsor with max visibility"
                rows="3"
                required
                class="w-full p-2 border border-gray-300 rounded resize-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                required
                placeholder="e.g. 50000"
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
          <button @click="close" class="px-4 py-2 text-gray-700 hover:text-gray-900">
            Cancel
          </button>
          <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {{ sponsorshipToEdit ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue'
import { useSponsorshipService } from '~/composables/useSponsorshipService'

const emit = defineEmits(['close', 'saved'])
const props = defineProps({
  sponsorshipToEdit: {
    type: Object,
    default: null
  }
})

const { createSponsorshipType, updateSponsorshipType } = useSponsorshipService()

const form = reactive({
  name: '',
  description: '',
  price: null,
})

watch(
  () => props.sponsorshipToEdit,
  (val) => {
    if (val) {
      form.name = val.name || ''
      form.description = val.description || ''
      form.price = val.price ?? null
    } else {
      // reset for create mode
      form.name = ''
      form.description = ''
      form.price = null
    }
  },
  { immediate: true }
)

function close() {
  emit('close')
}

async function submitForm() {
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price: form.price === '' ? null : Number(form.price)
    }

    if (props.sponsorshipToEdit?.id) {
      await updateSponsorshipType(props.sponsorshipToEdit.id, payload)
    } else {
      await createSponsorshipType(payload)
    }

    emit('saved')
  } catch (err) {
    console.error('❌ Failed to save sponsorship:', err)
    alert(err?.response?._data?.message || 'Failed to save.')
  }
}
</script>

<style scoped>
.material-icons { font-size: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
