<template>
  <div class="space-y-4">
    <UtilsBar
      title="Sponsorship Types"
      buttonLabel="Add Sponsorship"
      @action="openCreate"
    />

    <div v-if="error" class="text-center text-red-600">
      Error loading sponsorships.
    </div>

    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Description</th>
            <th class="px-4 py-3 text-left">Price</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in sponsorships"
            :key="s.id"
            class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
          >
            <td class="px-4 py-3">{{ s.name }}</td>
            <td class="px-4 py-3">{{ s.description || '—' }}</td>
            <td class="px-4 py-3">
              <span v-if="s.price !== null && s.price !== undefined">
                {{ currencySymbol(settings) }}{{ s.price }}
              </span>
              <span v-else>Not specified</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="px-3 py-1 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
                  @click="openEdit(s)"
                >
                  Edit
                </button>
                <button
                  class="px-3 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50"
                  @click="confirmDelete(s)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!sponsorships.length">
            <td colspan="4" class="px-4 py-8 text-center text-gray-500">No sponsorships yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal (create/edit) -->
    <SponsorshipModal
      v-if="showModal"
      :sponsorship-to-edit="editing"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, onMounted } from 'vue'
import { useSponsorshipService } from '~/composables/useSponsorshipService'
import { useSettingsService } from '~/composables/useSettingsService' // assumes you already have getSettings() here
import UtilsBar from '~/components/UtilsBar.vue'
import SponsorshipModal from '~/components/sponsorship/AddSponsorshipModal.vue'

const { fetchSponsorshipTypes, deleteSponsorshipType } = useSponsorshipService()
const { getSettings } = useSettingsService?.() || { getSettings: async () => ({ currency: 'INR' }) }

const sponsorships = ref([])
const error = ref(null)
const showModal = ref(false)
const editing = ref(null) // holds the sponsorship being edited or null
const settings = ref('INR')

function currencySymbol(code) {
  if (!code) return '₹'
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}

function openCreate() {
  editing.value = null
  showModal.value = true
}
function openEdit(item) {
  editing.value = { ...item }
  showModal.value = true
}
function closeModal() {
  showModal.value = false
}

async function handleSaved() {
  await reload()
  closeModal()
}

async function confirmDelete(item) {
  const ok = window.confirm(`Delete "${item.name}"? This cannot be undone.`)
  if (!ok) return
  try {
    await deleteSponsorshipType(item.id) // safe delete; will 400 if assigned anywhere
    await reload()
  } catch (err) {
    console.error('❌ Delete failed:', err)
    alert(err?.response?._data?.message || 'Failed to delete. If this type is assigned to events, remove assignments first or use force delete in API.')
  }
}

async function reload() {
  try {
    sponsorships.value = await fetchSponsorshipTypes()
  } catch (err) {
    error.value = err
    console.error('❌ Error loading sponsorships:', err)
  }
}

onMounted(async () => {
  try {
    const s = await getSettings()
    settings.value = s?.currency || 'INR'
  } catch (e) {
    console.error('Could not load settings:', e)
    settings.value = 'INR'
  }
  await reload()
})
</script>
