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
                Price <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.price"
                type="number"
                min="1"
                required
                placeholder="e.g. 50000"
                class="w-full p-2 border border-gray-300 rounded"
              />
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
import { reactive, watch } from 'vue'
import { useSponsorshipService } from '~/composables/useSponsorshipService'
import { useNotification } from '~/composables/useNotification'

const emit = defineEmits(['close', 'saved'])
const props = defineProps({
  sponsorshipToEdit: {
    type: Object,
    default: null
  }
})

const { createSponsorshipType, updateSponsorshipType } = useSponsorshipService()
const { showNotification } = useNotification()

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
    if (!form.name.trim() || !form.description.trim() || !form.price) {
      showNotification('❌ Please fill all mandatory fields', 'error')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price)
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
    showNotification(err?.response?._data?.message || 'Failed to save.', 'error')
  }
}
</script>

<style scoped>
.material-icons { font-size: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
