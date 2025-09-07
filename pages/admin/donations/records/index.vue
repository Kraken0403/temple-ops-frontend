<!-- File: pages/admin/donations/records/index.vue -->
<template>
  <div class="space-y-4">
    <!-- Top bar -->
    <UtilsBar
      title="Donations"
      buttonLabel="Refresh"
      @action="loadAll"
    />

    <!-- Error state -->
    <div v-if="error" class="text-center text-red-600">
      Error loading donations.
    </div>

    <!-- List -->
    <div class="bg-white min-h-[100vh] flex flex-col gap-2 p-4">
      <div
        v-for="r in records"
        :key="r.id"
        class="flex justify-between items-start p-4 bg-white border border-gray-300 rounded shadow-sm hover:shadow-md transition"
      >
        <!-- Left: donor & item -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-1">
            {{ r.donorName }}
          </h3>
          <p class="text-sm text-gray-600 mb-1">
            {{ r.donorEmail || '—' }} &middot; {{ r.donorPhone || '—' }}
          </p>

          <!-- 🔒 Use immutable snapshot fields -->
          <p class="text-sm text-gray-600">
            Item:
            <span class="font-medium text-gray-800">
              {{ r.itemNameAtDonation || r.donationItem?.name || '—' }}
            </span>
            <span v-if="r.amountAtDonation != null">
              ({{ formatMoney(r.amountAtDonation, settingsCurrency) }})
            </span>
            <span
              class="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              title="Record is immutable"
            >
              locked
            </span>
          </p>

          <p class="text-xs text-gray-500 mt-1">
            {{ formatDate(r.createdAt) }}
          </p>
        </div>

        <!-- Right: actions -->
        <div class="flex items-center gap-3">
          <button
            @click="openEditModal(r)"
            class="text-blue-600 hover:text-blue-800 flex items-center"
            title="Edit donor details"
          >
            <span class="material-icons text-[18px] mr-1">edit</span>
            Edit
          </button>

          <button
            @click="deleteRecord(r.id)"
            class="text-red-600 hover:text-red-800 flex items-center"
            title="Delete"
          >
            <span class="material-icons text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!error && !records.length" class="px-4 py-2 text-center text-gray-500">
        No donations recorded yet.
      </div>
    </div>

    <!-- Edit Modal (donor fields only; item/price locked) -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 h-screen flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-[#ccc] flex justify-between items-center bg-[#f5f5f5]">
            <h3 class="text-[18px] font-semibold text-gray-800">Edit Donation</h3>
            <button @click="toggleModal" class="text-gray-500 hover:text-gray-700">
              <i class="material-icons">close</i>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 overflow-auto flex-1">
            <form @submit.prevent="submitForm" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
                  <input
                    v-model.trim="form.donorName"
                    required
                    placeholder="Full name"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Donor Email</label>
                  <input
                    v-model.trim="form.donorEmail"
                    type="email"
                    required
                    placeholder="email@example.com"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Donor Phone</label>
                  <input
                    v-model.trim="form.donorPhone"
                    required
                    placeholder="+1 555…"
                    class="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <!-- Read-only snapshot display -->
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Donation Item (locked)</label>
                  <input
                    :value="lockedItemDisplay"
                    class="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    disabled
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Records are immutable. To change item/price, delete and re-create the record.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-[#ccc] bg-[#f5f5f5] flex justify-end space-x-3">
            <button @click="toggleModal" class="px-4 py-2 text-gray-700 hover:text-gray-900">
              Cancel
            </button>
            <button @click="submitForm" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
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

import { computed, ref } from 'vue'
import UtilsBar from '~/components/UtilsBar.vue'
import { useDonationService } from '~/composables/useDonationService'
import { useSettingsService } from '~/composables/useSettingsService'
import { useNotification } from '~/composables/useNotification'

const {
  listRecords,
  updateRecord,
  removeRecord,
  // listItems  // ⛔️ not needed anymore; item is locked
} = useDonationService()

const { getSettings } = useSettingsService()
const { notification, showNotification } = useNotification()

const records = ref([])
const error = ref(null)
const settingsCurrency = ref('INR')

const showModal = ref(false)
const editingId = ref(null)

const form = ref({
  donorName: '',
  donorEmail: '',
  donorPhone: ''
})

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
function formatDate(iso) {
  return new Date(iso).toLocaleString([], {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function toggleModal() {
  showModal.value = !showModal.value
}

async function loadAll() {
  try {
    error.value = null

    // currency
    try {
      const s = await getSettings()
      settingsCurrency.value = s?.currency || 'INR'
    } catch (e) {
      settingsCurrency.value = 'INR'
      console.warn('Settings load failed, defaulting currency to INR:', e)
    }

    // records only (no items needed)
    records.value = await listRecords()
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Failed to load donations'
  }
}

function recById(id) {
  return records.value.find(x => x.id === id)
}

const lockedItemDisplay = computed(() => {
  const r = recById(editingId.value)
  if (!r) return ''
  const name = r.itemNameAtDonation || r.donationItem?.name || '—'
  const amt = r.amountAtDonation != null ? formatMoney(r.amountAtDonation, settingsCurrency.value) : ''
  return amt ? `${name} — ${amt}` : name
})

function openEditModal(r) {
  editingId.value = r.id
  form.value = {
    donorName: r.donorName || '',
    donorEmail: r.donorEmail || '',
    donorPhone: r.donorPhone || ''
  }
  toggleModal()
}

async function submitForm() {
  try {
    await updateRecord(editingId.value, {
      donorName: form.value.donorName,
      donorEmail: form.value.donorEmail,
      donorPhone: form.value.donorPhone
      // ⛔️ No donationItemId here (immutable)
    })
    showNotification('Donation updated', 'success')
    toggleModal()
    await loadAll()
  } catch (e) {
    console.error('Update error:', e)
    showNotification(e?.message || 'Failed to update donation', 'error')
  }
}

async function deleteRecord(id) {
  if (!confirm('Delete this donation record?')) return
  try {
    await removeRecord(id)
    records.value = records.value.filter(r => r.id !== id)
    showNotification('Donation deleted', 'success')
  } catch (e) {
    console.error('Delete error:', e)
    showNotification(e?.message || 'Failed to delete donation', 'error')
  }
}

// initial
loadAll()
</script>

<style scoped>
/* Tailwind handles layout */
</style>
