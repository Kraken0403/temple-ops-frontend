<template>
  <div class="space-y-4">
    <UtilsBar
      title="Services List"
      buttonLabel="Add New Service"
      @action="toggleModal"
    />

    <!-- Error -->
    <div v-if="priestError || poojaError" class="text-center text-red-600">
      Error loading data.
    </div>

    <!-- Card List -->
    <div class="cards bg-white h-min-[100vh] flex flex-col gap-[10px] p-[15px]">
      <NuxtLink
        v-for="p in poojas"
        :key="p.id"
        :to="`/admin/poojas/${p.id}`"
        class="flex justify-between items-start p-4 bg-white border-1 border-[#cccccc] rounded-[3px] shadow-sm hover:shadow-md transition no-underline text-inherit"
      >
        <!-- Left: Image + Info -->
        <div class="flex gap-4">
          <!-- Image -->
          <div class="w-24 h-24 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-400">
            <img
              v-if="p.photoUrl"
              :src="config.apiBase + p.photoUrl"
              alt="Pooja Image"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
            >
              No Image
            </div>
          </div>

          <!-- Text Info -->
          <div>
            <h3 class="text-[16px] font-semibold text-[#111111] mb-[8px]">{{ p.name }}</h3>
            <p class="text-[14px] font-semibold text-gray-600">
              Type:
              <span class="font-[400] text-gray-500" v-if="p.isInVenue">In Venue</span>
              <span class="font-[400] text-gray-500" v-if="p.isOutsideVenue">
                {{ p.isInVenue ? '&' : '' }} Outside Venue
              </span>
            </p>
            <p class="text-[14px] font-semibold text-gray-600">
              Priests:
              <span class="font-[400] text-gray-500" v-if="p.priests?.length">
                {{ p.priests.map(pr => pr.name).join(', ') }}
              </span>
              <span v-else>—</span>
            </p>
            <p class="text-[14px] font-semibold text-gray-600">
              Duration: <span class="font-[400] text-gray-500">{{ p.durationMin }} min</span>
            </p>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex flex-row items-end space-x-[10px]">
          <button
            @click.stop="goToPooja(p.id)"
            class="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[15px]">edit</span>
            </div>
          </button>
          <button
            @click.stop="deletePooja(p.id)"
            class="text-red-600 hover:text-red-800 flex items-center"
          >
            <div class="icon-wrapper rounded-full border border-gray-400 flex justify-center items-center">
              <span class="material-icons text-[15px]">delete</span>
            </div>
          </button>
        </div>
      </NuxtLink>
    </div>

    <!-- Modal -->
    <transition name="fade">
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-start justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
          <h3 class="text-[18px] font-semibold text-gray-800">Create New Pooja</h3>
          <button @click="toggleModal" class="text-gray-500 cursor-pointer hover:text-gray-700">
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
                placeholder="e.g. Ganesh Puja"
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
              />
            </div>
            <!-- Photo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div class="flex items-end space-x-4">
                <!-- Preview box -->
                <div
                  class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden"
                >
                  <span v-if="!previewUrl" class="text-gray-400">No image</span>
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

            <!-- Priests -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priests</label>
              <select
                v-model="form.priestIds"
                multiple
                class="w-full p-2 h-32 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
              >
                <option v-for="pr in priests" :key="pr.id" :value="pr.id">
                  {{ pr.name }}
                </option>
              </select>
            </div>
            <!-- Amount & Currency -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  :value="settings"
                  readonly
                  disabled
                  class="w-full p-2 border bg-[#cccccc] border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
            </div>
            <!-- Venue checkboxes -->
            <div class="flex items-center space-x-6">
              <label class="inline-flex items-center">
                <input v-model="form.isInVenue" type="checkbox" class="form-checkbox h-5 w-5 text-green-600" />
                <span class="ml-2 text-gray-700">In Venue</span>
              </label>
              <label class="inline-flex items-center">
                <input v-model="form.isOutsideVenue" type="checkbox" class="form-checkbox h-5 w-5 text-green-600" />
                <span class="ml-2 text-gray-700">Outside Venue</span>
              </label>
            </div>
            <!-- Conditional Fields -->
            <div v-if="form.isInVenue" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  v-model="form.date"
                  type="date"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  v-model="form.time"
                  type="time"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                <input
                  v-model="form.venueAddress"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
                <input
                  v-model="form.mapLink"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
            </div>
            <div v-if="form.isOutsideVenue">
              <label class="block text-sm font-medium text-gray-700 mb-1">Allowed Zones (comma-sep)</label>
              <input
                v-model="form.allowedZones"
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
              />
            </div>
            <!-- Duration, Prep, Buffer -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  v-model.number="form.durationMin"
                  type="number"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                <input
                  v-model.number="form.prepTimeMin"
                  type="number"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Buffer (min)</label>
                <input
                  v-model.number="form.bufferMin"
                  type="number"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
            </div>
            
            <!-- Toggles -->
            <div class="flex items-center space-x-6">
              <label class="inline-flex items-center">
                <input v-model="form.includeFood" type="checkbox" class="form-checkbox h-5 w-5 text-green-600" />
                <span class="ml-2 text-gray-700">Include Food</span>
              </label>
              <label class="inline-flex items-center">
                <input v-model="form.includeHall" type="checkbox" class="form-checkbox h-5 w-5 text-green-600" />
                <span class="ml-2 text-gray-700">Include Hall</span>
              </label>
            </div>
            <!-- Materials & Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Materials</label>
              <textarea
                v-model="form.materials"
                rows="3"
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Fixed Footer Actions -->
        <div class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
          <button
            type="button"
            @click="toggleModal"
            class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer "
          >
            Cancel
          </button>
          <button
            type="button"
            @click="submitForm"
            class="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
  </div>
</template>

  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
  import { useCookie, useRouter, useRoute, useRuntimeConfig  } from '#app'
  import UtilsBar from '~/components/UtilsBar.vue'
  import { useSettingsService } from '~/composables/useSettingsService'
  import { usePoojaService } from '~/composables/usePoojaService'
  import { usePriestService } from '~/composables/usePriestService'

  const config = useRuntimeConfig().public

  const { getSettings } = useSettingsService()


  const previewUrl = ref(null)

  const settings    = ref('')

  // const token = useCookie('token').value
  const router = useRouter()
  const { fetchPoojas, createPooja } = usePoojaService()
  const { fetchPriests } = usePriestService()
  
  const poojas = ref([])
  const priests = ref([])
  const poojaError = ref(null)
  const priestError = ref(null)
  
  const showModal = ref(false)
  const photoFile = ref(null)
  
  const form = reactive({
    name: '', 
    priestIds: [], 
    amount: 0,
    date: '',
    time: '', 
    durationMin: 60, 
    prepTimeMin: 0,
    bufferMin: 0, 
    isInVenue: true, 
    isOutsideVenue: false,
    venueAddress: '', 
    mapLink: '', 
    allowedZones: '',
    includeFood: false, 
    includeHall: false,
    materials: '', notes: ''
  })
  
  function toggleModal() {
    showModal.value = !showModal.value
  }
  
  function onFileChange(event) {
  // 1) actually pull the File out into a variable
      const file = event.target.files[0]
      if (!file) return

      // 2) store it for upload
      photoFile.value = file

      // 3) revoke any old URL, then create a new preview
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = URL.createObjectURL(file)
  }
  
  function goToPooja(id) {
    router.push(`/admin/poojas/${id}`)
  }
  
  onMounted(async () => {
    try {
      const s = await getSettings()
      settings.value = s.currency
    } catch (e) {
      console.error('Could not load settings:', e)
      settings.value = 'INR'
    }

    try {
      priests.value = await fetchPriests()
    } catch (e) {
      priestError.value = e
    }
  
    try {
      poojas.value = await fetchPoojas()
    } catch (e) {
      poojaError.value = e
    }
  })

  function onPhotoFileChange(event) {
    const file = event.target.files[0]
    if (!file) return
    // keep the file in your form state too:
    form.photo = file
    // create a temporary URL for preview:
    previewUrl.value = URL.createObjectURL(file)
  }

  onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  })
  
  async function submitForm() {
    try {
      await createPooja(form, photoFile.value)
      toggleModal()
      poojas.value = await fetchPoojas()
      Object.assign(form, {
        name: '', priestIds: [], amount: 0,
        date: '', time: '', durationMin: 60, prepTimeMin: 0,
        bufferMin: 0, isInVenue: true, isOutsideVenue: false,
        venueAddress: '', mapLink: '', allowedZones: '',
        includeFood: false, includeHall: false,
        materials: '', notes: ''
      })
      photoFile.value = null
    } catch (err) {
      console.error('Create error:', err.message)
    }
  }
  </script>

<style scoped>
.icon-wrapper {
  width: 35px;
  height: 35px;
  cursor: pointer;
}

.material-icons {
  font-size: 18px;
}
</style>
