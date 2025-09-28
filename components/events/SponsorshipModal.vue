<template>
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50"
        @click="$emit('close')"
      >
        <div
          class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 h-[520px] mt-10 flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 class="text-[18px] font-semibold text-gray-800">Assign Sponsorship</h3>
            <button
              @click="$emit('close')"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="material-icons">close</i>
            </button>
          </div>
  
          <!-- Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
            <div class="space-y-5">
              <!-- Sponsorship Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sponsorship Type</label>
                <select
                  v-model.number="localForm.sponsorshipTypeId"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-emerald-600"
                  @change="onTypeChange"
                >
                  <option :value="null" disabled>Select a type</option>
                  <option
                    v-for="t in sponsorshipTypes"
                    :key="t.id"
                    :value="t.id"
                  >
                    {{ t.name }} — {{ formatMoney(t.price, settingsCurrency) }}
                  </option>
                </select>
              </div>
  
              <!-- Slots & Price -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Slots</label>
                  <input
                    v-model.number="localForm.maxSlots"
                    type="number"
                    min="1"
                    class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Price ({{ settingsCurrency }})
                  </label>
                  <input
                    v-model.number="localForm.price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-emerald-600"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Defaults to the type’s price; you can override.
                  </p>
                </div>
              </div>
  
              <!-- Preview -->
              <div
                v-if="typePreview"
                class="border rounded p-3 text-sm bg-gray-50"
              >
                <div class="font-medium">{{ typePreview.name }}</div>
                <div class="text-gray-600">
                  Base Price: {{ formatMoney(typePreview.price, settingsCurrency) }}
                </div>
                <div v-if="typePreview.description" class="text-gray-600">
                  {{ typePreview.description }}
                </div>
              </div>
            </div>
          </div>
  
          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              @click="assign"
              :disabled="!localForm.sponsorshipTypeId || localForm.maxSlots < 1"
              class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  
  const props = defineProps({
    visible: { type: Boolean, default: false },
    settingsCurrency: { type: String, default: 'INR' },
    sponsorshipTypes: { type: Array, default: () => [] },
    form: {
      type: Object,
      default: () => ({ sponsorshipTypeId: null, maxSlots: 1, price: null })
    }
  })
  
  const emit = defineEmits(['close', 'assign', 'update:form'])
  
  const localForm = ref({ ...props.form })
  
  watch(
    () => props.form,
    (val) => {
      localForm.value = { ...val }
    },
    { deep: true }
  )
  
  const typePreview = computed(() =>
    props.sponsorshipTypes.find(t => t.id === localForm.value.sponsorshipTypeId) || null
  )
  
  function onTypeChange() {
    const t = props.sponsorshipTypes.find(x => x.id === localForm.value.sponsorshipTypeId)
    if (t) localForm.value.price = Number(t.price)
    emit('update:form', { ...localForm.value })
  }
  
  function assign() {
    emit('assign', { ...localForm.value })
  }
  
  function formatMoney(amount, code) {
    if (amount == null) return '—'
    try {
      return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0
      }).format(Number(amount))
    } catch {
      return `${Number(amount).toLocaleString()} ${code}`
    }
  }
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  