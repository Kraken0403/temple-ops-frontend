<!-- pages/admin/coupons/index.vue -->
<template>
    <section class="max-w-[1180px] mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Coupons</h1>
          <p class="text-gray-500 text-sm">Create and manage discount coupons for events & poojas.</p>
        </div>
        <div class="flex gap-3">
          <button
            class="px-4 py-2 rounded-md bg-[#570000] text-white hover:bg-opacity-90"
            @click="openCreate()"
          >
            + New Coupon
          </button>
        </div>
      </div>
  
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model.trim="search"
              type="text"
              placeholder="Code / description…"
              class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#570000]/30"
              @keyup.enter="reload()"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Active</label>
            <select
              v-model="active"
              class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#570000]/30"
            >
              <option :value="undefined">All</option>
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="reload" class="w-full border rounded-md px-3 py-2 hover:bg-gray-50">
              Apply
            </button>
          </div>
        </div>
      </div>
  
      <!-- Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr class="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th class="px-4 py-3">Code</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Value</th>
                <th class="px-4 py-3">Min Order</th>
                <th class="px-4 py-3">Window</th>
                <th class="px-4 py-3">Usage</th>
                <th class="px-4 py-3">Active</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              <tr v-for="row in items" :key="row.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="font-semibold">{{ row.code }}</div>
                  <div class="text-xs text-gray-500" v-if="row.description">{{ row.description }}</div>
                </td>
                <td class="px-4 py-3">{{ row.type }}</td>
                <td class="px-4 py-3">
                  <span v-if="row.type === 'PERCENT'">{{ row.value }}%</span>
                  <span v-else>{{ money(row.value) }}</span>
                  <span v-if="row.type === 'PERCENT' && row.maxDiscount != null" class="text-xs text-gray-500">
                    (max {{ money(row.maxDiscount) }})
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="row.minOrderAmount != null">{{ money(row.minOrderAmount) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3">
                  <div class="text-xs">
                    <div v-if="row.startsAt">From: {{ dt(row.startsAt) }}</div>
                    <div v-if="row.endsAt">Until: {{ dt(row.endsAt) }}</div>
                    <div v-if="!row.startsAt && !row.endsAt" class="text-gray-400">No window</div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-xs">
                    Used:
                    <strong>
                      {{
                        row._count?.redemptions
                        ?? row.redemptionsCount
                        ?? (Array.isArray(row.redemptions) ? row.redemptions.length : 0)
                      }}
                    </strong>
                  </div>
                  <div class="text-xs" v-if="row.usageLimit != null">
                    Limit: <strong>{{ row.usageLimit }}</strong>
                  </div>
                  <div class="text-xs" v-if="row.usageLimitPerUser != null">
                    /User: <strong>{{ row.usageLimitPerUser }}</strong>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-xs rounded-full"
                    :class="row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ row.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex gap-2 justify-end">
                    <button class="px-3 py-1 text-xs border rounded hover:bg-gray-50" @click="openEdit(row)">
                      Edit
                    </button>
                    <button
                      class="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                      @click="onDelete(row)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
  
              <tr v-if="!loading && items.length === 0">
                <td colspan="8" class="px-4 py-10 text-center text-gray-500">No coupons found.</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
          <div class="text-sm text-gray-600">Page {{ page }} of {{ totalPages }} · {{ total }} total</div>
          <div class="flex gap-2">
            <button class="px-3 py-1.5 border rounded hover:bg-gray-100 disabled:opacity-50" :disabled="page <= 1" @click="go(page - 1)">
              Prev
            </button>
            <button class="px-3 py-1.5 border rounded hover:bg-gray-100 disabled:opacity-50" :disabled="page >= totalPages" @click="go(page + 1)">
              Next
            </button>
          </div>
        </div>
      </div>
  
      <!-- Drawer / Modal -->
      <transition name="slide">
        <div v-if="drawerOpen" class="fixed inset-0 z-40 flex" @keydown.esc="closeDrawer">
          <div class="flex-1 bg-black/30" @click="closeDrawer"></div>
          <div class="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl">
            <div class="px-6 py-4 border-b flex items-center justify-between">
              <h2 class="text-lg font-semibold">{{ editId ? 'Edit Coupon' : 'New Coupon' }}</h2>
              <button class="p-2 rounded hover:bg-gray-100" @click="closeDrawer">✕</button>
            </div>
  
            <form class="p-6 space-y-6" @submit.prevent="save">
              <!-- Core -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input v-model.trim="form.code" class="w-full border rounded px-3 py-2" placeholder="e.g., NAVRATRI500" required />
                </div>
  
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea v-model.trim="form.description" class="w-full border rounded px-3 py-2" rows="2" />
                </div>
  
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select v-model="form.type" class="w-full border rounded px-3 py-2" required>
                    <option value="FLAT">FLAT</option>
                    <option value="PERCENT">PERCENT</option>
                  </select>
                </div>
  
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input v-model.number="form.value" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2" required />
                </div>
  
                <div v-if="form.type === 'PERCENT'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Discount (optional)</label>
                  <input v-model.number="form.maxDiscount" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2" />
                </div>
  
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Min Order (optional)</label>
                  <input v-model.number="form.minOrderAmount" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2" />
                </div>
              </div>
  
              <!-- Window -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Starts At (UTC ISO)</label>
                  <input v-model="form.startsAt" type="datetime-local" class="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ends At (UTC ISO)</label>
                  <input v-model="form.endsAt" type="datetime-local" class="w-full border rounded px-3 py-2" />
                </div>
              </div>
  
              <!-- Limits & flags -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Usage Limit (total)</label>
                  <input v-model.number="form.usageLimit" type="number" min="0" class="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Per User</label>
                  <input v-model.number="form.usageLimitPerUser" type="number" min="0" class="w-full border rounded px-3 py-2" />
                </div>
                <div class="flex items-center gap-3 mt-6">
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" v-model="form.isActive" />
                    <span>Active</span>
                  </label>
                  <label class="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" v-model="form.stackable" />
                    <span>Stackable</span>
                  </label>
                </div>
              </div>
  
              <!-- Scope (checkboxes + select all) -->
              <div class="space-y-6">
                <h3 class="text-sm font-semibold text-gray-800">Scope (optional)</h3>
                <p class="text-xs text-gray-500">Leave empty for a global coupon.</p>
  
                <!-- Events -->
                <div class="border rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <label class="font-medium">Events</label>
                      <label class="text-xs inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          :checked="eventIdsArr.length === filteredEventOpts.length && filteredEventOpts.length>0"
                          @change="toggleAllEvents($event.target.checked)"
                        />
                        <span>Select All ({{ filteredEventOpts.length }})</span>
                      </label>
                    </div>
                    <input
                      v-model="eventSearch"
                      placeholder="Search events…"
                      class="text-xs px-2 py-1 border rounded"
                    />
                  </div>
  
                  <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-56 overflow-auto pr-1">
                    <label
                      v-for="opt in filteredEventOpts"
                      :key="`ev-${opt.id}`"
                      class="inline-flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        :value="opt.id"
                        :checked="eventIdsArr.includes(opt.id)"
                        @change="onToggleEvent(opt.id, $event.target.checked)"
                      />
                      <span>#{{ opt.id }} — {{ opt.name }}</span>
                    </label>
                    <div v-if="!filteredEventOpts.length" class="text-xs text-gray-500">No events.</div>
                  </div>
  
                  <div class="text-xs text-gray-500 mt-2">
                    Selected: {{ eventIdsArr.length }}
                    <button type="button" class="ml-2 underline" @click="eventIdsArr = []">Clear</button>
                  </div>
                </div>
  
                <!-- Poojas -->
                <div class="border rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <label class="font-medium">Poojas</label>
                      <label class="text-xs inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          :checked="poojaIdsArr.length === filteredPoojaOpts.length && filteredPoojaOpts.length>0"
                          @change="toggleAllPoojas($event.target.checked)"
                        />
                        <span>Select All ({{ filteredPoojaOpts.length }})</span>
                      </label>
                    </div>
                    <input
                      v-model="poojaSearch"
                      placeholder="Search poojas…"
                      class="text-xs px-2 py-1 border rounded"
                    />
                  </div>
  
                  <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-56 overflow-auto pr-1">
                    <label
                      v-for="opt in filteredPoojaOpts"
                      :key="`pj-${opt.id}`"
                      class="inline-flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        :value="opt.id"
                        :checked="poojaIdsArr.includes(opt.id)"
                        @change="onTogglePooja(opt.id, $event.target.checked)"
                      />
                      <span>#{{ opt.id }} — {{ opt.name }}</span>
                    </label>
                    <div v-if="!filteredPoojaOpts.length" class="text-xs text-gray-500">No poojas.</div>
                  </div>
  
                  <div class="text-xs text-gray-500 mt-2">
                    Selected: {{ poojaIdsArr.length }}
                    <button type="button" class="ml-2 underline" @click="poojaIdsArr = []">Clear</button>
                  </div>
                </div>
  
                <!-- Pooja Categories -->
                <div class="border rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <label class="font-medium">Pooja Categories</label>
                      <label class="text-xs inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          :checked="poojaCatIdsArr.length === filteredPoojaCatOpts.length && filteredPoojaCatOpts.length>0"
                          @change="toggleAllPoojaCats($event.target.checked)"
                        />
                        <span>Select All ({{ filteredPoojaCatOpts.length }})</span>
                      </label>
                    </div>
                    <input
                      v-model="poojaCatSearch"
                      placeholder="Search categories…"
                      class="text-xs px-2 py-1 border rounded"
                    />
                  </div>
  
                  <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-56 overflow-auto pr-1">
                    <label
                      v-for="opt in filteredPoojaCatOpts"
                      :key="`pc-${opt.id}`"
                      class="inline-flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        :value="opt.id"
                        :checked="poojaCatIdsArr.includes(opt.id)"
                        @change="onTogglePoojaCat(opt.id, $event.target.checked)"
                      />
                      <span>#{{ opt.id }} — {{ opt.name }}</span>
                    </label>
                    <div v-if="!filteredPoojaCatOpts.length" class="text-xs text-gray-500">No categories.</div>
                  </div>
  
                  <div class="text-xs text-gray-500 mt-2">
                    Selected: {{ poojaCatIdsArr.length }}
                    <button type="button" class="ml-2 underline" @click="poojaCatIdsArr = []">Clear</button>
                  </div>
                </div>
              </div>
  
              <div class="pt-2 flex justify-end gap-3">
                <button type="button" class="px-4 py-2 border rounded hover:bg-gray-50" @click="closeDrawer">Cancel</button>
                <button
                  type="submit"
                  :disabled="saving || !isFormValid"
                  class="px-4 py-2 rounded bg-[#570000] text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {{ saving ? 'Saving…' : (editId ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
  
      <div v-if="toast" class="fixed bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded shadow">
        {{ toast }}
      </div>
    </section>
  </template>
  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })
  
  import { ref, computed, onMounted, watch } from 'vue'
  import { useCouponService } from '~/composables/useCouponService'
  import { useSettingsService } from '~/composables/useSettingsService'
  import { useRuntimeConfig, useCookie } from '#app'
  
  const { listCoupons, createCoupon, updateCoupon, deleteCoupon } = useCouponService()
  const { getSettings } = useSettingsService()
  const config = useRuntimeConfig().public
  const token = useCookie('token').value
  
  /* ─────────── State ─────────── */
  const loading = ref(true)
  const items = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(1)
  const search = ref('')
  const active = ref() // undefined | true | false
  
  const currency = ref('INR')
  
  /* Drawer/Form state */
  const drawerOpen = ref(false)
  const saving = ref(false)
  const editId = ref(null)
  
  const form = ref({
    code: '',
    description: '',
    type: 'FLAT', // FLAT | PERCENT
    value: 0,
    maxDiscount: null,
    minOrderAmount: null,
    startsAt: '',
    endsAt: '',
    isActive: true,
    stackable: false,
    usageLimit: null,
    usageLimitPerUser: null,
  })
  
  /* Scope arrays (checkbox selections) */
  const eventIdsArr = ref([])
  const poojaIdsArr = ref([])
  const poojaCatIdsArr = ref([])
  
  /* Option lists + search filters */
  const eventOpts = ref([])       // [{id, name}]
  const poojaOpts = ref([])       // [{id, name}]
  const poojaCatOpts = ref([])    // [{id, name}]
  const eventSearch = ref('')
  const poojaSearch = ref('')
  const poojaCatSearch = ref('')
  
  const filteredEventOpts = computed(() => {
    const q = eventSearch.value.toLowerCase()
    return !q ? eventOpts.value : eventOpts.value.filter(o => String(o.name).toLowerCase().includes(q) || String(o.id).includes(q))
  })
  const filteredPoojaOpts = computed(() => {
    const q = poojaSearch.value.toLowerCase()
    return !q ? poojaOpts.value : poojaOpts.value.filter(o => String(o.name).toLowerCase().includes(q) || String(o.id).includes(q))
  })
  const filteredPoojaCatOpts = computed(() => {
    const q = poojaCatSearch.value.toLowerCase()
    return !q ? poojaCatOpts.value : poojaCatOpts.value.filter(o => String(o.name).toLowerCase().includes(q) || String(o.id).includes(q))
  })
  
  const toast = ref('')
  
  /* ─────────── Load & paging ─────────── */
  async function reload() {
    loading.value = true
    try {
      const res = await listCoupons({
        page: page.value,
        pageSize: pageSize.value,
        search: search.value,
        active: active.value,
      })
      items.value = res.items || []
      total.value = res.total || 0
      page.value = res.page || 1
      pageSize.value = res.pageSize || 10
      totalPages.value = res.totalPages || Math.max(1, Math.ceil(total.value / pageSize.value))
    } catch (e) {
      console.error(e)
      toast.value = e.message || 'Failed to load coupons'
      setTimeout(() => (toast.value = ''), 2500)
    } finally {
      loading.value = false
    }
  }
  
  function go(p) {
    if (p < 1 || p > totalPages.value) return
    page.value = p
    reload()
  }
  
  onMounted(async () => {
    try {
      const s = await getSettings()
      currency.value = s.currency || 'INR'
    } catch {}
    await Promise.all([reload(), loadEventOpts(), loadPoojaOpts(), loadPoojaCatOpts()])
  })
  
  watch([search, active], () => { page.value = 1 })
  
  /* ─────────── Option loaders (auth-enabled) ─────────── */
  async function authedGet(url) {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Failed to load: ${url}`)
    return res.json()
  }
  async function loadEventOpts() {
    const res = await authedGet(`${config.apiBase}/events`)
    const rows = Array.isArray(res) ? res : res?.items || []
    eventOpts.value = rows.map(r => ({ id: r.id, name: r.name || r.title || `Event ${r.id}` }))
  }
  async function loadPoojaOpts() {
    // ✅ singular route matches your backend
    const res = await authedGet(`${config.apiBase}/pooja`)
    const rows = Array.isArray(res) ? res : res?.items || []
    poojaOpts.value = rows.map(r => ({ id: r.id, name: r.name || `Pooja ${r.id}` }))
  }
  async function loadPoojaCatOpts() {
    const res = await authedGet(`${config.apiBase}/pooja-categories`)
    const rows = Array.isArray(res) ? res : res?.items || []
    poojaCatOpts.value = rows.map(r => ({ id: r.id, name: r.name || r.title || `Category ${r.id}` }))
  }
  
  /* ─────────── UI helpers ─────────── */
  function money(n) {
    try {
      return new Intl.NumberFormat(
        currency.value === 'INR' ? 'en-IN' : 'en-US',
        { style: 'currency', currency: currency.value, maximumFractionDigits: 2 },
      ).format(n ?? 0)
    } catch {
      return `${currency.value} ${(n ?? 0).toFixed(2)}`
    }
  }
  function dt(iso) {
    try { return new Date(iso).toLocaleString() } catch { return iso }
  }
  
  /* ─────────── Drawer actions ─────────── */
  function openCreate() {
    editId.value = null
    form.value = {
      code: '',
      description: '',
      type: 'FLAT',
      value: 0,
      maxDiscount: null,
      minOrderAmount: null,
      startsAt: '',
      endsAt: '',
      isActive: true,
      stackable: false,
      usageLimit: null,
      usageLimitPerUser: null,
    }
    eventIdsArr.value = []
    poojaIdsArr.value = []
    poojaCatIdsArr.value = []
    drawerOpen.value = true
  }
  
  function openEdit(row) {
    editId.value = row.id
    form.value = {
      code: row.code || '',
      description: row.description || '',
      type: row.type || 'FLAT',
      value: row.value ?? 0,
      maxDiscount: row.maxDiscount ?? null,
      minOrderAmount: row.minOrderAmount ?? null,
      startsAt: row.startsAt ? row.startsAt.slice(0, 16) : '',
      endsAt: row.endsAt ? row.endsAt.slice(0, 16) : '',
      isActive: !!row.isActive,
      stackable: !!row.stackable,
      usageLimit: row.usageLimit ?? null,
      usageLimitPerUser: row.usageLimitPerUser ?? null,
    }
    // Pre-populate scopes safely if server included them
    eventIdsArr.value = (row.events || []).map(x => x.eventId)
    poojaIdsArr.value = (row.poojas || []).map(x => x.poojaId)
    poojaCatIdsArr.value = (row.poojaCats || []).map(x => x.poojaCategoryId)
    drawerOpen.value = true
  }
  
  function closeDrawer() {
    drawerOpen.value = false
  }
  
  /* ─────────── Save / Delete ─────────── */
  const isFormValid = computed(() => {
    if (!form.value.code?.trim()) return false
    if (!form.value.type) return false
    const val = Number(form.value.value)
    if (!Number.isFinite(val) || val <= 0) return false
    if (form.value.type === 'PERCENT' && (val <= 0 || val > 100)) return false
    return true
  })
  
  async function save() {
    if (!isFormValid.value) return
    saving.value = true
    try {
      const payload = {
        ...form.value,
        maxDiscount: form.value.type === 'PERCENT' ? (form.value.maxDiscount ?? null) : null,
        minOrderAmount: form.value.minOrderAmount ?? null,
        startsAt: form.value.startsAt ? new Date(form.value.startsAt).toISOString() : null,
        endsAt: form.value.endsAt ? new Date(form.value.endsAt).toISOString() : null,
        eventIds: eventIdsArr.value.slice(),
        poojaIds: poojaIdsArr.value.slice(),
        poojaCategoryIds: poojaCatIdsArr.value.slice(),
      }
  
      if (editId.value) {
        await updateCoupon(editId.value, payload)
        toast.value = 'Coupon updated'
      } else {
        await createCoupon(payload)
        toast.value = 'Coupon created'
      }
      closeDrawer()
      reload()
    } catch (e) {
      console.error(e)
      toast.value = e.message || 'Save failed'
    } finally {
      saving.value = false
      setTimeout(() => (toast.value = ''), 2500)
    }
  }
  
  async function onDelete(row) {
    if (!confirm(`Delete coupon ${row.code}?`)) return
    try {
      await deleteCoupon(row.id)
      toast.value = 'Coupon deleted'
      reload()
    } catch (e) {
      toast.value = e.message || 'Delete failed'
    } finally {
      setTimeout(() => (toast.value = ''), 2500)
    }
  }
  
  /* ─────────── Checkbox helpers (Select All) ─────────── */
  function onToggleEvent(id, checked) {
    if (checked) {
      if (!eventIdsArr.value.includes(id)) eventIdsArr.value = [...eventIdsArr.value, id]
    } else {
      eventIdsArr.value = eventIdsArr.value.filter(x => x !== id)
    }
  }
  function toggleAllEvents(checked) {
    eventIdsArr.value = checked ? filteredEventOpts.value.map(o => o.id) : []
  }
  
  function onTogglePooja(id, checked) {
    if (checked) {
      if (!poojaIdsArr.value.includes(id)) poojaIdsArr.value = [...poojaIdsArr.value, id]
    } else {
      poojaIdsArr.value = poojaIdsArr.value.filter(x => x !== id)
    }
  }
  function toggleAllPoojas(checked) {
    poojaIdsArr.value = checked ? filteredPoojaOpts.value.map(o => o.id) : []
  }
  
  function onTogglePoojaCat(id, checked) {
    if (checked) {
      if (!poojaCatIdsArr.value.includes(id)) poojaCatIdsArr.value = [...poojaCatIdsArr.value, id]
    } else {
      poojaCatIdsArr.value = poojaCatIdsArr.value.filter(x => x !== id)
    }
  }
  function toggleAllPoojaCats(checked) {
    poojaCatIdsArr.value = checked ? filteredPoojaCatOpts.value.map(o => o.id) : []
  }
  </script>
  
  <style scoped>
  .slide-enter-active,
  .slide-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
  .slide-enter-from,
  .slide-leave-to { transform: translateX(20px); opacity: 0; }
  </style>
  