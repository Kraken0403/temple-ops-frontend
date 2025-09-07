<template>
    <transition name="fade">
      <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
            <h3 class="text-[18px] font-semibold text-gray-800">Edit Pooja</h3>
            <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
              <i class="material-icons">close</i>
            </button>
          </div>
  
          <!-- Scrollable Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
            <form @submit.prevent="$emit('save')" class="space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  v-model="form.name"
                  required
                  placeholder="e.g. Ganesh Puja"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
  
              <!-- Photo Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div class="flex items-end space-x-4">
                  <div
                    class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden"
                  >
                    <span v-if="!previewUrl" class="text-gray-400">No image</span>
                    <img v-else :src="previewUrl" alt="Preview" class="object-cover w-full h-full" />
                  </div>
                  <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                    Browse…
                    <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
                  </label>
                </div>
              </div>
  
              <!-- Priest List -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priests</label>
                <select
                  v-model="form.priestIds"
                  multiple
                  class="w-full p-2 h-32 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                >
                  <option v-for="priest in priests" :key="priest.id" :value="priest.id">
                    {{ priest.name }}
                  </option>
                </select>
              </div>
  
              <!-- Amount & Currency -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input v-model.number="form.amount" type="number" class="form-input w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input v-model="form.currency" class="form-input w-full" />
                </div>
              </div>
  
              <!-- Venue Options -->
              <div class="flex items-center space-x-6">
                <label class="inline-flex items-center">
                  <input v-model="form.isInVenue" type="checkbox" class="form-checkbox text-green-600" />
                  <span class="ml-2">In Venue</span>
                </label>
                <label class="inline-flex items-center">
                  <input v-model="form.isOutsideVenue" type="checkbox" class="form-checkbox text-green-600" />
                  <span class="ml-2">Outside Venue</span>
                </label>
              </div>
  
              <!-- Conditional Venue Fields -->
              <div v-if="form.isInVenue" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input v-model="form.date" type="date" class="form-input w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input v-model="form.time" type="time" class="form-input w-full" />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                  <input v-model="form.venueAddress" class="form-input w-full" />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
                  <input v-model="form.mapLink" class="form-input w-full" />
                </div>
              </div>
  
              <div v-if="form.isOutsideVenue">
                <label class="block text-sm font-medium text-gray-700 mb-1">Allowed Zones (comma separated)</label>
                <input v-model="form.allowedZones" class="form-input w-full" />
              </div>
  
              <!-- Durations -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input v-model.number="form.durationMin" type="number" class="form-input w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prep Time</label>
                  <input v-model.number="form.prepTimeMin" type="number" class="form-input w-full" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Buffer</label>
                  <input v-model.number="form.bufferMin" type="number" class="form-input w-full" />
                </div>
              </div>
  
              <!-- Toggles -->
              <div class="flex items-center space-x-6">
                <label class="inline-flex items-center">
                  <input v-model="form.includeFood" type="checkbox" class="form-checkbox text-green-600" />
                  <span class="ml-2">Include Food</span>
                </label>
                <label class="inline-flex items-center">
                  <input v-model="form.includeHall" type="checkbox" class="form-checkbox text-green-600" />
                  <span class="ml-2">Include Hall</span>
                </label>
              </div>
  
              <!-- Notes and Materials -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Materials</label>
                <textarea v-model="form.materials" rows="2" class="form-textarea w-full"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea v-model="form.notes" rows="2" class="form-textarea w-full"></textarea>
              </div>
            </form>
          </div>
  
          <!-- Footer Buttons -->
          <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
            <button @click="$emit('close')" class="px-4 py-2 text-gray-700 hover:text-gray-900">
              Cancel
            </button>
            <button @click="$emit('save')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  const props = defineProps({
    form: Object,
    priests: Array,
    previewUrl: String
  })
  
  const emit = defineEmits(['close', 'save', 'photo-change'])
  
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) emit('photo-change', file)
  }
  </script>
  