<template>
    <div class="">
      <transition name="fade">
        <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50" @click="close">
          <div
            class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-screen flex flex-col"
            @click.stop
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-1 border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
              <h3 class="text-[18px] font-semibold text-gray-800">
                {{ pooja && pooja.id ? 'Edit Service' : 'Add New Service' }}
              </h3>
              <button @click="close" class="text-gray-500 cursor-pointer hover:text-gray-700">
                <i class="material-icons">close</i>
              </button>
            </div>
  
            <!-- Body -->
            <div class="px-6 py-4 overflow-auto flex-1">
              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- Name (required) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Name <span class="text-red-600">*</span>
                  </label>
                  <input
                    v-model.trim="form.name"
                    required
                    placeholder="e.g. Ganesh Puja"
                    class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600 text-base text-gray-900"
                  />
                  <p v-if="touched && !form.name" class="text-xs text-red-600 mt-1">Name is required.</p>
                </div>
  
                <!-- Photo / Featured image (required) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Photo <span class="text-red-600">*</span>
                  </label>
                  <div class="flex items-end gap-2">
                    <!-- Preview -->
                    <div class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                      <span v-if="!previewUrl" class="text-gray-400 text-xs">No image</span>
                      <img v-else :key="imgKey" :src="previewUrl" alt="Preview" class="object-cover w-full h-full" />
                    </div>
  
                    <!-- Actions -->
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        @click.stop="chooseFromGallery"
                      >
                        Choose from gallery
                      </button>
  
                      <label class="px-3 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 text-sm">
                        Upload file…
                        <input type="file" accept="image/*" @change="onLocalUpload" class="hidden" />
                      </label>
  
                      <button
                        v-if="form.featuredMediaId"
                        type="button"
                        class="px-3 py-2 bg-gray-100 border border-[#ccc] rounded text-sm"
                        @click="clearPhoto"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-2" v-if="form.featuredMediaId">Selected mediaId: {{ form.featuredMediaId }}</p>
                  <p v-if="touched && !form.featuredMediaId" class="text-xs text-red-600 mt-2">Photo is required.</p>
                </div>
  
                <!-- Priests (checkboxes, required: at least one) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Priests <span class="text-red-600">*</span>
                  </label>
  
                  <div v-if="priests.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded p-3">
                    <label
                      v-for="pr in priests"
                      :key="pr.id"
                      class="inline-flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        :value="pr.id"
                        v-model="form.priestIds"
                        class="h-4 w-4 text-green-600"
                      />
                      <span class="text-sm text-gray-800">{{ pr.name }}</span>
                    </label>
                  </div>
                  <p v-else class="text-xs text-gray-500 mt-1">No priests yet.</p>
  
                  <p v-if="touched && form.priestIds.length === 0" class="text-xs text-red-600 mt-2">
                    Please select at least one priest.
                  </p>
                </div>
  
                <!-- Categories (required: at least one) -->
                <!-- Categories (required: at least one) -->
                <div>
                <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                    Categories <span class="text-red-600">*</span>
                    </label>
                    <button
                    type="button"
                    class="text-sm px-2 py-1 border rounded hover:bg-gray-50"
                    @click="showCategoryModal = true"
                    >
                    + Add Category
                    </button>
                </div>

                <div class="border rounded p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-auto">
                    <label
                    v-for="c in categories"
                    :key="c.id"
                    class="inline-flex items-center gap-2"
                    >
                    <input
                        type="checkbox"
                        v-model="form.categoryIds"
                        :value="c.id"
                        class="h-4 w-4 text-green-600"
                    />
                    <span class="text-sm text-gray-800">{{ c.name }}</span>
                    </label>

                    <div v-if="!categories.length" class="text-xs text-gray-500 col-span-full">
                    No categories yet. Click “Add Category” to create one.
                    </div>
                </div>

                <p v-if="touched && form.categoryIds.length === 0" class="text-xs text-red-600 mt-2">
                    Please select at least one category.
                </p>
                </div>

  
                <!-- Amount & Currency -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      min="0"
                      class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <input
                      :value="settingsCurrency || 'INR'"
                      readonly
                      disabled
                      class="w-full p-2 border bg-[#cccccc] border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    />
                  </div>
                </div>
  
                <!-- Service Type (can select both; required: at least one) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Service Type <span class="text-red-600">*</span>
                  </label>
                  <div class="flex items-center space-x-6">
                    <label class="inline-flex items-center">
                      <input
                        v-model="form.isInVenue"
                        type="checkbox"
                        class="form-checkbox h-5 w-5 text-green-600"
                        @change="onToggleInVenue"
                      />
                      <span class="ml-2 text-gray-700">In Venue</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input
                        v-model="form.isOutsideVenue"
                        type="checkbox"
                        class="form-checkbox h-5 w-5 text-green-600"
                        @change="onToggleOutsideVenue"
                      />
                      <span class="ml-2 text-gray-700">Outside Venue</span>
                    </label>
                  </div>
                  <p v-if="touched && !hasVenueMode" class="text-xs text-red-600 mt-2">
                    Please select at least one: In Venue or Outside Venue.
                  </p>
                </div>
  
                <!-- In-Venue -->
                <div v-if="form.isInVenue" class="grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <select
                      v-model.number="form.venueId"
                      class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    >
                      <option :value="null" disabled>Select a venue</option>
                      <option v-for="v in venues" :key="v.id" :value="v.id">
                        {{ v.title }} — {{ v.zipcode }}
                      </option>
                    </select>
                  </div>
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
                </div>
  
                <!-- Outside-Venue -->
                <div v-if="form.isOutsideVenue" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                    <input
                      v-model="form.venueAddress"
                      class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
                    <input
                      v-model="form.mapLink"
                      class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Allowed Zones (comma-sep)</label>
                    <input
                      v-model="form.allowedZones"
                      class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    />
                  </div>
                </div>
  
                <!-- Duration, Prep, Buffer -->
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                    <input
                      v-model.number="form.durationMin"
                      type="number"
                      min="0"
                      class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                    <input
                      v-model.number="form.prepTimeMin"
                      type="number"
                      min="0"
                      class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buffer (min)</label>
                    <input
                      v-model.number="form.bufferMin"
                      type="number"
                      min="0"
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
  
                <!-- Description (optional) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                  ></textarea>
                </div>
              </form>
            </div>
  
            <!-- Footer -->
            <div class="px-6 py-4 border-t border-1 border-[#ccc] bg-[#f5f5f5] flex justify-end gap-3">
              <button @click="close" type="button" class="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer">
                Cancel
              </button>
              <button
                @click="submitForm"
                type="button"
                :disabled="!canSave"
                class="px-4 py-2 text-white rounded cursor-pointer"
                :class="canSave ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </transition>
  
      <!-- ───────────────── Category Create Modal ───────────────── -->
      <transition name="fade">
        <div
          v-if="showCategoryModal"
          class="fixed inset-0 z-[60] flex items-start justify-center bg-black/50"
          @click="closeCategory"
        >
          <div
            class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 mt-10"
            @click.stop
          >
            <div class="px-5 py-3 border-b bg-[#f5f5f5] flex justify-between items-center">
              <h4 class="font-semibold text-gray-800">Create Category</h4>
              <button @click="closeCategory" class="text-gray-500 hover:text-gray-700">
                <i class="material-icons">close</i>
              </button>
            </div>
  
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  v-model.trim="catForm.name"
                  required
                  placeholder="e.g. Homam"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  v-model.trim="catForm.description"
                  rows="2"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-green-600"
                  placeholder="Short description…"
                ></textarea>
              </div>
              <p v-if="catError" class="text-sm text-red-600">{{ catError }}</p>
            </div>
  
            <div class="px-5 py-3 border-t bg-[#f5f5f5] flex justify-end gap-2">
              <button @click="closeCategory" class="px-4 py-2">Cancel</button>
              <button
                @click="createCategoryLocal"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                :disabled="!catForm.name"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, watch, onMounted, computed } from 'vue'
  import { usePoojaService } from '@/composables/usePoojaService'
  import { usePriestService } from '@/composables/usePriestService'
  import { useVenueService } from '@/composables/useVenueService'
  import { usePoojaCategoryService } from '@/composables/usePoojaCategoryService'
  import { useMediaStore } from '@/stores/useMediaStore'
  import { useMediaService } from '@/composables/useMediaService'
  
  const props = defineProps({
    pooja: { type: Object, default: null },
    settingsCurrency: { type: String, default: 'INR' }
  })
  const emit = defineEmits(['close', 'created', 'updated'])
  
  const { createPooja, updatePooja } = usePoojaService()
  const { fetchPriests } = usePriestService()
  const { fetchVenues } = useVenueService()
  const { fetchCategories, createCategory } = usePoojaCategoryService()
  const mediaStore = useMediaStore()
  const { uploadMedia, fullUrl } = useMediaService()
  
  const priests = ref([])
  const venues = ref([])
  const categories = ref([])
  
  const form = reactive({
    name: '',
    priestIds: [],
    categoryIds: [],
    amount: 0,
    date: '',
    time: '',
    durationMin: 60,
    prepTimeMin: 0,
    bufferMin: 0,
    isInVenue: true,
    isOutsideVenue: false,
    venueId: null,
    venueAddress: '',
    mapLink: '',
    allowedZones: '',
    includeFood: false,
    includeHall: false,
    materials: '',
    notes: '',
    description: '',
    featuredMediaId: null,
    clearFeaturedMedia: false,
  })
  
  const touched = ref(false)
  
  const hasVenueMode = computed(() => form.isInVenue || form.isOutsideVenue)
  const canSave = computed(() => {
    const priestIds = (form.priestIds || []).map(Number).filter(Boolean)
    const categoryIds = (form.categoryIds || []).map(Number).filter(Boolean)
    return Boolean(
      form.name &&
      form.featuredMediaId &&
      priestIds.length > 0 &&
      categoryIds.length > 0 &&
      hasVenueMode.value
    )
  })
  
  /* Image picker */
  const previewUrl = ref(null)
  const imgKey = ref(0)
  
  const getId = (a) => a?.id ?? a?._id ?? null
  const getRel = (a) => a?.url ?? a?.path ?? a?.pathname ?? a?.fileUrl ?? a?.src ?? a?.location ?? null
  
  function setFromAsset(asset) {
    if (!asset) return
    form.featuredMediaId = getId(asset)
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
    form.featuredMediaId = null
    previewUrl.value = null
    imgKey.value++
  }
  
  /* Hydrate */
  function hydrateFromPooja(p) {
    if (!p) return
    form.name = p.name || ''
    form.priestIds = Array.isArray(p.priests) ? p.priests.map(pr => pr.id) : (p.priestIds || [])
    form.categoryIds = Array.isArray(p.categories) ? p.categories.map(c => c.id) : (p.categoryIds || [])
    form.amount = p.amount ?? 0
    form.date = p.date ? p.date.substring(0, 10) : ''
    form.time = p.time ? new Date(p.time).toISOString().substring(11, 16) : ''
    form.durationMin = p.durationMin ?? 60
    form.prepTimeMin = p.prepTimeMin ?? 0
    form.bufferMin = p.bufferMin ?? 0
  
    form.isInVenue = !!p.isInVenue
    form.isOutsideVenue = !!p.isOutsideVenue
  
    form.venueId = p.venueId ?? p.venue?.id ?? null
    form.venueAddress = p.venueAddress || ''
    form.mapLink = p.mapLink || ''
    form.allowedZones = Array.isArray(p.allowedZones) ? p.allowedZones.join(',') : (p.allowedZones || '')
  
    form.includeFood = !!p.includeFood
    form.includeHall = !!p.includeHall
    form.materials = p.materials || ''
    form.notes = p.notes || ''
    form.description = p.description || ''
    form.featuredMediaId =
      p.featuredMediaId ??
      p.featuredMedia?.id ??
      null
  
    const rel = p.featuredMedia?.url || p.featuredMedia?.path || p.photoUrl || null
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
  
  /** Allow both toggles. Only clear fields when a toggle turns OFF. */
  function onToggleInVenue() {
    if (!form.isInVenue) {
      form.venueId = null
      form.date = ''
      form.time = ''
    }
  }
  function onToggleOutsideVenue() {
    if (!form.isOutsideVenue) {
      form.venueAddress = ''
      form.mapLink = ''
      form.allowedZones = ''
    }
  }
  
  onMounted(async () => {
    try { priests.value = await fetchPriests() } catch { priests.value = [] }
    try { venues.value = await fetchVenues() } catch { venues.value = [] }
    try { categories.value = await fetchCategories() } catch { categories.value = [] }
    hydrateFromPooja(props.pooja)
  })
  watch(() => props.pooja, (p) => hydrateFromPooja(p))
  
  function close() { emit('close') }
  
  async function submitForm() {
    touched.value = true
    if (!canSave.value) return
  
    try {
      form.priestIds = (form.priestIds || []).map(Number)
      form.categoryIds = (form.categoryIds || []).map(Number)
  
      if (props.pooja && props.pooja.id) {
        await updatePooja(props.pooja.id, form, null)
        emit('updated')
      } else {
        await createPooja(form, null)
        emit('created')
        // reset
        Object.assign(form, {
          name: '', priestIds: [], categoryIds: [], amount: 0, date: '', time: '',
          durationMin: 60, prepTimeMin: 0, bufferMin: 0,
          isInVenue: true, isOutsideVenue: false,
          venueId: null, venueAddress: '', mapLink: '', allowedZones: '',
          includeFood: false, includeHall: false,
          materials: '', notes: '', description: '',
          featuredMediaId: null, clearFeaturedMedia: false,
        })
        previewUrl.value = null
        imgKey.value++
        touched.value = false
      }
      close()
    } catch (err) {
      console.error('❌ Error saving pooja:', err)
    }
  }
  
  /* ───────── Category modal ───────── */
  const showCategoryModal = ref(false)
  const catForm = reactive({ name: '', description: '' })
  const catError = ref('')
  
  function slugify(s) {
    return (s || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  
  function closeCategory() {
    showCategoryModal.value = false
    catForm.name = ''
    catForm.description = ''
    catError.value = ''
  }
  
  async function createCategoryLocal() {
    try {
      catError.value = ''
      const payload = {
        name: catForm.name.trim(),
        slug: slugify(catForm.name),
        description: catForm.description?.trim() || undefined,
        isActive: true,
      }
      const created = await createCategory(payload)
      if (!categories.value.find(c => c.id === created.id)) {
        categories.value.push(created)
      }
      form.categoryIds = Array.from(new Set([...(form.categoryIds || []), created.id]))
      closeCategory()
    } catch (e) {
      console.error(e)
      catError.value = e?.message || 'Failed to create category'
    }
  }
  </script>
  
  <style scoped>
  .material-icons { font-size: 20px; vertical-align: middle; }
  .fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
  </style>
  