<template>
  <transition name="fade">
    <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50" @click="close">
      <div
        class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
          <h3 class="text-[18px] font-semibold text-gray-800">
            {{ priest && priest.id ? 'Edit Priest' : 'Add New Priest' }}
          </h3>
          <button @click="close" class="text-gray-500 cursor-pointer hover:text-gray-700">
            <i class="material-icons">close</i>
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="px-6 py-4 overflow-auto flex-1">
          <!-- (unchanged form content from your working version) -->
          <!-- … your existing form exactly as you shared … -->
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

            <!-- Photo / Featured image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div class="flex items-end space-x-4">
                <!-- Preview box -->
                <div
                  class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden"
                >
                  <span v-if="!previewUrl" class="text-gray-400 text-xs">No image</span>
                  <img v-else :key="imgKey" :src="previewUrl" alt="Preview" class="object-cover w-full h-full" />
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    @click.stop="chooseFromGallery"
                  >
                    Choose from gallery
                  </button>

                  <!-- Optional: quick local upload -->
                  <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                    Upload file…
                    <input type="file" accept="image/*" @change="onLocalUpload" class="hidden" />
                  </label>

                  <button
                    v-if="featuredMediaId"
                    type="button"
                    class="px-4 py-2 bg-gray-100 border border-[#ccc] rounded"
                    @click="clearPhoto"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2" v-if="featuredMediaId">Selected mediaId: {{ featuredMediaId }}</p>
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
          <button @click="close" class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer">Cancel</button>
          <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { usePriestService } from '@/composables/usePriestService'
import { useMediaStore } from '@/stores/useMediaStore'
import { useMediaService } from '@/composables/useMediaService'

const props = defineProps({ priest: { type: Object, default: null } })
const emit = defineEmits(['close', 'created', 'updated'])

const { createPriest, updatePriest } = usePriestService()
const mediaStore = useMediaStore()
const { uploadMedia, fullUrl } = useMediaService()

const form = reactive({
  name: '', specialty: '', email: '', contactNo: '', address: '',
  languages: '', qualifications: '',
})
const featuredMediaId = ref(null)
const previewUrl = ref(null)
const imgKey = ref(0)

const getId = (a) => a?.id ?? a?._id ?? null
const getRel = (a) => a?.url ?? a?.path ?? a?.pathname ?? a?.fileUrl ?? a?.src ?? a?.location ?? null

function setFromAsset(asset) {
  if (!asset) return
  featuredMediaId.value = getId(asset)
  const rel = getRel(asset)
  if (rel) {
    const base = fullUrl(rel)
    const ver  = asset.updatedAt || asset.updated_at || asset.version || Date.now()
    previewUrl.value = `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
    imgKey.value++
  } else {
    previewUrl.value = null
    imgKey.value++
  }
}

function hydrateFromPriest(p) {
  if (!p) return
  form.name           = p.name || ''
  form.specialty      = p.specialty || ''
  form.email          = p.email || ''
  form.contactNo      = p.contactNo || ''
  form.address        = p.address || ''
  form.languages      = Array.isArray(p.languages) ? p.languages.join(',') : (p.languages || '')
  form.qualifications = Array.isArray(p.qualifications) ? p.qualifications.join(',') : (p.qualifications || '')

  featuredMediaId.value =
    p.featuredMediaId ?? p.featured_media_id ??
    p.featuredMedia?.id ?? p.featuredMedia?._id ?? null

  const rel = p.featuredMedia?.url || p.featuredMedia?.path || p.featured_media?.url || null
  if (rel) {
    const base = fullUrl(rel)
    const ver  = p.featuredMedia?.updatedAt || p.updatedAt || Date.now()
    previewUrl.value = `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
    imgKey.value++
  } else {
    previewUrl.value = null
    imgKey.value++
  }
}

onMounted(() => hydrateFromPriest(props.priest))
watch(() => props.priest, (p) => hydrateFromPriest(p))

async function chooseFromGallery() {
  const selection = await mediaStore.open({ multiple: false, accept: 'image/*' })
  const asset = Array.isArray(selection) ? selection[0] : selection
  if (asset) setFromAsset(asset)
}
async function onLocalUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const asset = await uploadMedia(file)
  setFromAsset(asset)
  e.target.value = ''
}
function clearPhoto() {
  featuredMediaId.value = null
  previewUrl.value = null
  imgKey.value++
}

function close() { emit('close') }

async function submitForm() {
  try {
    const payload = {
      name: (form.name || '').trim(),
      specialty: form.specialty?.trim() || null,
      email: form.email?.trim() || null,
      contactNo: form.contactNo?.trim() || null,
      address: form.address?.trim() || null,
      languages: (form.languages || '').split(',').map(l => l.trim()).filter(Boolean),
      qualifications: (form.qualifications || '').split(',').map(q => q.trim()).filter(Boolean),
      featuredMediaId: featuredMediaId.value ?? null,
    }

    if (props.priest && props.priest.id) {
      await updatePriest(props.priest.id, payload)
      emit('updated')
    } else {
      await createPriest(payload, null)
      emit('created')
      // reset after create
      form.name = form.specialty = form.email = form.contactNo = form.address = ''
      form.languages = form.qualifications = ''
      featuredMediaId.value = null
      previewUrl.value = null
      imgKey.value++
    }
    close()
  } catch (err) {
    console.error('❌ Error saving priest:', err)
  }
}
</script>

<style scoped>
.material-icons { font-size: 20px; vertical-align: middle; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
