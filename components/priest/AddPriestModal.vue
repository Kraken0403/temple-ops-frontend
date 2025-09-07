<template>
  <transition name="fade">
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]"
        >
          <h3 class="text-[18px] font-semibold text-gray-800">Add New Priest</h3>
          <button @click="close" class="text-gray-500 cursor-pointer hover:text-gray-700">
            <i class="material-icons">close</i>
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="px-6 py-4 overflow-auto flex-1">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                v-model="form.name"
                required
                placeholder="e.g. Shri Ram Kumar"
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
              />
            </div>

            <!-- Specialty -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input
                v-model="form.specialty"
                placeholder="e.g. Vedic Rituals"
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
              />
            </div>

            <!-- Email & Contact No. -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
                <input
                  v-model="form.contactNo"
                  type="tel"
                  placeholder="+91 12345 67890"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                />
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                v-model="form.address"
                placeholder="Full address"
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
              />
            </div>

            <!-- Languages & Qualifications -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Languages (comma separated)
                </label>
                <input
                  v-model="form.languages"
                  placeholder="Hindi,English"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Qualifications (comma separated)
                </label>
                <input
                  v-model="form.qualifications"
                  placeholder="B.A.,M.A."
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                />
              </div>
            </div>

            <!-- Photo Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div class="flex items-end space-x-4">
                <!-- Preview box -->
                <div
                  class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden"
                >
                  <span v-if="!previewUrl" class="text-gray-400 text-xs">No image</span>
                  <img
                    v-else
                    :src="previewUrl"
                    alt="Preview"
                    class="object-cover w-full h-full"
                  />
                </div>

                <!-- Browse button -->
                <label
                  class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                >
                  Browse…
                  <input
                    type="file"
                    accept="image/*"
                    @change="onFileChange"
                    class="hidden"
                  />
                </label>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div
          class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3"
        >
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
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount } from 'vue'
import { usePriestService } from '@/composables/usePriestService'

const emit = defineEmits(['close', 'created'])
const { createPriest } = usePriestService()

// Reactive form state
const form = reactive({
  name: '',
  specialty: '',
  email: '',
  contactNo: '',
  address: '',
  languages: '',
  qualifications: '',
  photo: null
})

const photoFile = ref(null)
const previewUrl = ref(null)

function onFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  photoFile.value = file
  form.photo = file
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function close() {
  emit('close')
}

async function submitForm() {
  try {
    // prepare payload
    const payload = {
      name: form.name.trim(),
      specialty: form.specialty.trim() || null,
      email: form.email.trim() || null,
      contactNo: form.contactNo.trim() || null,
      address: form.address.trim() || null,
      languages: form.languages
        .split(',')
        .map(l => l.trim())
        .filter(Boolean),
      qualifications: form.qualifications
        .split(',')
        .map(q => q.trim())
        .filter(Boolean)
    }

    await createPriest(payload, photoFile.value)
    emit('created')
    close()

    // reset
    form.name = ''
    form.specialty = ''
    form.email = ''
    form.contactNo = ''
    form.address = ''
    form.languages = ''
    form.qualifications = ''
    form.photo = null
    photoFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  } catch (err) {
    console.error('❌ Error creating priest:', err)
  }
}
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
