<!-- File: pages/admin/donations/index.vue -->
<template>
  <div class="space-y-4">
    <!-- Top bar -->
    <UtilsBar
      title="Donation Items"
      buttonLabel="New Donation Item"
      @action="openCreateModal"
    />

    <!-- Error state -->
    <div v-if="error" class="text-center text-red-600">
      Error loading donation items.
    </div>

    <!-- List of items -->
    <div class="bg-white min-h-[100vh] flex flex-col gap-2 p-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex justify-between items-center p-4 bg-white border border-gray-300 rounded shadow-sm hover:shadow-md transition"
      >
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ item.name }}</h3>
          <p class="text-sm text-gray-600">
            Amount:
            <span class="font-medium">
              {{ formatMoney(item.amount, settingsCurrency) }}
            </span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="openEditModal(item)"
            class="text-blue-600 hover:text-blue-800 flex items-center"
            title="Edit"
          >
            <span class="material-icons text-[18px] mr-1">edit</span>
            Edit
          </button>
          <button
            @click="deleteItem(item.id)"
            class="text-red-600 hover:text-red-800 flex items-center"
            title="Delete"
          >
            <span class="material-icons text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <div v-if="!items.length" class="px-4 py-2 text-center text-gray-500">
        No donation items found.
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 h-screen flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b flex justify-between items-center bg-[#f5f5f5] border-[#ccc]">
            <h3 class="text-[18px] font-semibold text-gray-800">
              {{ isEditing ? 'Edit Donation Item' : 'Create Donation Item' }}
            </h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <i class="material-icons">close</i>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    v-model.trim="form.name"
                    required
                    placeholder="e.g. Archana"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Amount ({{ settingsCurrency }})
                  </label>
                  <input
                    v-model.number="form.amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 500"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
            <button @click="closeModal" class="px-4 py-2 text-gray-700 hover:text-gray-900">
              Cancel
            </button>
            <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {{ isEditing ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Notification toast -->
    <div
      v-if="notification.visible"
      class="fixed bottom-4 right-4 px-4 py-3 rounded shadow text-white"
      :class="notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useDonationService } from '~/composables/useDonationService'
import { useSettingsService } from '~/composables/useSettingsService'
import { useNotification } from '~/composables/useNotification'
import UtilsBar from '~/components/UtilsBar.vue'

const { listItems, createItem, updateItem, removeItem } = useDonationService()
const { getSettings } = useSettingsService()
const { notification, showNotification } = useNotification()

const items = ref([])
const error = ref(null)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const settingsCurrency = ref('INR')

const DEFAULT_FORM = { name: '', amount: 0 }
const form = ref({ ...DEFAULT_FORM })

/* money formatting like in events */
function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return '0'
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    }).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { ...DEFAULT_FORM }
  showModal.value = true
}
function openEditModal(item) {
  isEditing.value = true
  editingId.value = item.id
  form.value = {
    name: item.name ?? '',
    amount: item.amount ?? 0
  }
  showModal.value = true
}
function closeModal() {
  showModal.value = false
}

async function load() {
  try {
    error.value = null
    // fetch settings currency first
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch (e) {
      settingsCurrency.value = 'INR'
      console.warn('Settings load failed, defaulting currency to INR:', e)
    }
    items.value = await listItems()
  } catch (e) {
    error.value = e?.message || 'Failed to load items'
  }
}

async function submitForm() {
  try {
    if (isEditing.value && editingId.value != null) {
      await updateItem(editingId.value, {
        name: form.value.name,
        amount: Number(form.value.amount)
      })
      showNotification('Donation item updated', 'success')
    } else {
      await createItem({
        name: form.value.name,
        amount: Number(form.value.amount)
      })
      showNotification('Donation item created', 'success')
    }
    closeModal()
    form.value = { ...DEFAULT_FORM }
    await load()
  } catch (e) {
    console.error('Save error:', e)
    showNotification(e?.message || 'Failed to save item', 'error')
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return
  try {
    await removeItem(id)
    items.value = items.value.filter(i => i.id !== id)
    showNotification('Donation item deleted', 'success')
  } catch (e) {
    console.error('Delete error:', e)
    showNotification(e?.message || 'Failed to delete item', 'error')
  }
}

onMounted(load)
</script>

<style scoped>
/* Tailwind handles the layout/appearance */
</style>
