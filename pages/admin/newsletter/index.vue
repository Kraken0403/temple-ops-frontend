<template>
    <div class="space-y-6">
      <!-- Top Bar -->
      <UtilsBar title="Newsletter Subscribers" />
  
      <!-- Filters -->
      <div
        class="bg-white border border-gray-200 rounded-[3px] p-4
               flex flex-col md:flex-row md:items-end gap-4"
      >
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-600 mb-1">
            Search Email
          </label>
          <input
            v-model="filters.q"
            type="text"
            placeholder="Search by email…"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm
                   focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">
            Source
          </label>
          <select
            v-model="filters.source"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="FOOTER">Footer</option>
            <option value="BOOKING">Booking</option>
            <option value="EVENT">Event</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            v-model="filters.status"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
        </div>
      </div>
  
      <!-- Error -->
      <div v-if="error" class="text-center text-red-600">
        Failed to load newsletter subscribers.
      </div>
  
      <!-- Table -->
      <div v-else class="bg-white border border-gray-200 rounded-[3px] overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr class="text-left text-gray-600">
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Source</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Subscribed At</th>
              <th class="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
  
          <tbody>
            <tr
              v-for="s in filteredSubscribers"
              :key="s.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-gray-900">
                {{ s.email }}
              </td>
  
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-1 rounded text-xs font-medium"
                  :class="sourceClass(s.source)"
                >
                  {{ s.source }}
                </span>
              </td>
  
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-1 rounded text-xs font-medium"
                  :class="statusClass(s.status)"
                >
                  {{ s.status }}
                </span>
              </td>
  
              <td class="px-4 py-3 text-gray-600">
                {{ formatDate(s.createdAt) }}
              </td>
  
              <td class="px-4 py-3 text-right">
                <button
                  v-if="s.status === 'ACTIVE'"
                  @click="onUnsubscribe(s)"
                  class="text-red-600 hover:underline text-xs"
                >
                  Unsubscribe
                </button>
                <span v-else class="text-gray-400 text-xs">—</span>
              </td>
            </tr>
  
            <tr v-if="!filteredSubscribers.length">
              <td colspan="5" class="px-4 py-6 text-center text-gray-400">
                No subscribers found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, computed, onMounted } from 'vue'
  import UtilsBar from '@/components/UtilsBar.vue'
  import { useNewsletterService } from '@/composables/useNewsletterService'
  import { useNotification } from '@/composables/useNotification'
  
  const { fetchSubscribers, unsubscribe } = useNewsletterService()
  const { showNotification } = useNotification()
  
  const subscribers = ref([])
  const error = ref(false)
  
  const filters = ref({
    q: '',
    source: '',
    status: '',
  })
  
  /* ───────────────────────────── Helpers ───────────────────────────── */
  
  function formatDate(d) {
    return d ? new Date(d).toLocaleDateString() : '—'
  }
  
  function sourceClass(src) {
    return {
      FOOTER: 'bg-blue-100 text-blue-700',
      BOOKING: 'bg-green-100 text-green-700',
      EVENT: 'bg-purple-100 text-purple-700',
      OTHER: 'bg-gray-100 text-gray-700',
    }[src] || 'bg-gray-100 text-gray-700'
  }
  
  function statusClass(st) {
    return st === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-200 text-gray-600'
  }
  
  /* ───────────────────────────── Actions ───────────────────────────── */
  
  async function load() {
    try {
      subscribers.value = await fetchSubscribers()
    } catch (e) {
      error.value = true
      console.error(e)
    }
  }
  
  async function onUnsubscribe(sub) {
    if (!confirm(`Unsubscribe ${sub.email}?`)) return
  
    try {
      await unsubscribe(sub.id)
      sub.status = 'UNSUBSCRIBED'
      showNotification('Subscriber unsubscribed', 'success')
    } catch (e) {
      showNotification(e.message || 'Failed to unsubscribe', 'error')
    }
  }
  
  /* ───────────────────────────── Computed ───────────────────────────── */
  
  const filteredSubscribers = computed(() => {
    return subscribers.value.filter(s => {
      if (filters.value.q) {
        const q = filters.value.q.toLowerCase()
        if (!s.email.toLowerCase().includes(q)) return false
      }
      if (filters.value.source && s.source !== filters.value.source) return false
      if (filters.value.status && s.status !== filters.value.status) return false
      return true
    })
  })
  
  onMounted(load)
  </script>
  