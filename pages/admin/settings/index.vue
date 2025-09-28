<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white border-b border-[#ccc] shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Admin Settings</h1>
        <span class="text-xs text-gray-500 hidden md:block">Last updated just now</span>
      </div>

      <!-- Tabs -->
      <nav class="max-w-7xl mx-auto flex overflow-x-auto gap-2 px-2 md:px-6 pb-2">
        <!-- General Settings -->
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="activeTab === 'general'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'general'"
        >
          <span class="material-icons text-[18px] mr-2">settings</span>
          General Settings
        </button>

        <!-- Venues -->
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="activeTab === 'venues'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'venues'"
        >
          <span class="material-icons text-[18px] mr-2">location_on</span>
          Venues
        </button>

        <!-- Users -->
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="activeTab === 'users'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'users'"
        >
          <span class="material-icons text-[18px] mr-2">group</span>
          Users
        </button>

        <!-- Roles -->
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="activeTab === 'roles'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'roles'"
        >
          <span class="material-icons text-[18px] mr-2">badge</span>
          Roles
        </button>

        <!-- Permissions -->
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :class="activeTab === 'permissions'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'permissions'"
        >
          <span class="material-icons text-[18px] mr-2">admin_panel_settings</span>
          Permissions
        </button>
      </nav>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

      <!-- Currency -->
      <section v-if="activeTab === 'general'" class="bg-white border border-[#ccc] rounded-xl shadow-sm">
        <div class="px-6 py-4 border-b border-[#ccc] flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Defaults</h3>
            <p class="text-sm text-gray-500">
              Choose the default currency and timezone for bookings, invoices and reports.
            </p>
          </div>
        </div>
        <div class="p-6 space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Currency -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select v-model="currency"
                class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500">
                <option v-for="opt in currencyOptions" :key="opt.code" :value="opt.code">
                  {{ opt.name }} ({{ opt.code }})
                </option>
              </select>
            </div>

            <!-- Timezone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select v-model="timezone"
                class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500">
                <option v-for="tz in timezoneOptions" :key="tz" :value="tz">
                  {{ tz }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button @click="saveSettings"
              class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer">
              Save
            </button>
          </div>
        </div>
      </section>

      <!-- NEW: Venues -->
      <section v-if="activeTab === 'venues'" class="space-y-6">
        <!-- List -->
        <div class="bg-white border border-[#ccc] rounded-xl shadow-sm">
          <div class="px-6 py-4 border-b border-[#ccc] flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Venues</h3>
              <p class="text-sm text-gray-500">Manage temple/banquet locations used in bookings.</p>
            </div>
            <button
              class="inline-flex items-center gap-2 rounded-md bg-black text-white px-3 py-2 hover:opacity-90 cursor-pointer"
              @click="openVenueForm()"
            >
              <span class="material-icons text-[18px]">add</span>
              <span>New Venue</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-600">
                  <th class="px-6 py-3 text-left font-medium">Title</th>
                  <th class="px-6 py-3 text-left font-medium">Address</th>
                  <th class="px-6 py-3 text-left font-medium">Zipcode</th>
                  <th class="px-6 py-3 text-left font-medium">Map Link</th>
                  <th class="px-6 py-3 text-left font-medium">Active</th>
                  <th class="px-6 py-3 text-left font-medium w-40">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="v in venues" :key="v.id" class="hover:bg-gray-50">
                  <td class="px-6 py-3">{{ v.title }}</td>
                  <td class="px-6 py-3">{{ v.address }}</td>
                  <td class="px-6 py-3">{{ v.zipcode }}</td>
                  <td class="px-6 py-3">
                    <a v-if="v.mapLink" :href="v.mapLink" target="_blank" class="text-blue-600 hover:underline">Open</a>
                    <span v-else class="text-gray-400">—</span>
                  </td>
                  <td class="px-6 py-3">
                    <span class="text-xs rounded px-2 py-0.5"
                          :class="v.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-300'">
                      {{ v.isActive ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td class="px-6 py-3">
                    <div class="flex items-center gap-2">
                      <button class="text-sm text-blue-600 hover:text-blue-800" @click="openVenueForm(v)">Edit</button>
                      <button class="text-sm text-red-600 hover:text-red-800" @click="onDeleteVenue(v)">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="venuesError" class="px-6 py-4 text-red-600">Failed to load venues.</div>
        </div>

        <!-- Create / Edit Form -->
        <div v-if="venueForm.open" class="bg-white border border-[#ccc] rounded-xl shadow-sm">
          <div class="px-6 py-4 border-b border-[#ccc]">
            <h3 class="text-lg font-semibold text-gray-900">{{ venueForm.id ? 'Edit Venue' : 'Create Venue' }}</h3>
          </div>
          <div class="p-6 space-y-4 max-w-3xl">
            <div class="grid md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input v-model.trim="venueForm.title" placeholder="e.g., Community Hall A"
                  class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"/>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea v-model.trim="venueForm.address" rows="3" placeholder="Full address"
                  class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
                <input v-model.trim="venueForm.zipcode" placeholder="e.g., 380001"
                  class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Map Link (optional)</label>
                <input v-model.trim="venueForm.mapLink" placeholder="https://maps.google.com/..."
                  class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"/>
              </div>
              <div class="flex items-center gap-2">
                <input id="isActive" type="checkbox" v-model="venueForm.isActive" class="h-4 w-4 border-[#ccc] rounded"/>
                <label for="isActive" class="text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button @click="saveVenue"
                class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700" :disabled="savingVenue">
                {{ savingVenue ? 'Saving…' : 'Save' }}
              </button>
              <button @click="cancelVenueForm"
                class="px-4 py-2 rounded-md border border-[#ccc] hover:bg-gray-50" :disabled="savingVenue">
                Cancel
              </button>
              <span v-if="venueSuccess" class="text-green-600 text-sm">Done!</span>
              <span v-if="venueError" class="text-red-600 text-sm">{{ venueError }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Users -->
      <section v-if="activeTab === 'users'" class="space-y-6">
        <!-- List -->
        <div class="bg-white border border-[#ccc] rounded-xl shadow-sm">
          <div class="px-6 py-4 border-b border-[#ccc] flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Existing Users</h3>
              <p class="text-sm text-gray-500">Manage current system users.</p>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-600">
                  <th class="px-6 py-3 text-left font-medium">Email</th>
                  <th class="px-6 py-3 text-left font-medium">Roles</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
                  <td class="px-6 py-3">{{ u.email }}</td>
                  <td class="px-6 py-3">{{ usersCellRoles(u) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="usersError" class="px-6 py-4 text-red-600">Failed to load users.</div>
        </div>

        <!-- Create -->
        <div class="bg-white border border-[#ccc] rounded-xl shadow-sm">
          <div class="px-6 py-4 border-b border-[#ccc]">
            <h3 class="text-lg font-semibold text-gray-900">Create New User</h3>
          </div>
          <div class="p-6 space-y-4 max-w-2xl">
            <input v-model="newUser.email" type="email" placeholder="Email"
              class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"/>
            <input v-model="newUser.password" type="password" placeholder="Password"
              class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"/>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
              <div class="flex flex-wrap gap-3">
                <label v-for="r in creatableRoles" :key="r.id"
                  class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer"
                  :class="newUser.roles.includes(r.id) ? 'bg-red-50 border-red-400 text-red-700' : 'border-[#ccc] text-gray-700'">
                  <input type="checkbox" class="sr-only" :value="r.id" v-model.number="newUser.roles">
                  <span>{{ r.name }}</span>
                </label>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button @click="createUser"
                class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                Create User
              </button>
              <span v-if="userSuccess" class="text-green-600 text-sm">Done!</span>
              <span v-if="userError" class="text-red-600 text-sm">Error.</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Roles -->
      <section v-if="activeTab === 'roles'" class="bg-white border border-[#ccc] rounded-xl shadow-sm">
        <div class="px-6 py-4 border-b border-[#ccc]">
          <h3 class="text-lg font-semibold text-gray-900">Existing Roles</h3>
        </div>
        <ul>
          <li v-for="r in roles" :key="r.id" class="flex items-center justify-between p-4 border-b border-[#ccc] last:border-b-0">
            <!-- Admin locked -->
            <template v-if="r.name.toLowerCase() === 'admin'">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ r.name }}</span>
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Locked</span>
              </div>
              <span class="text-gray-400 text-sm">Cannot edit</span>
            </template>
            <!-- Editable -->
            <template v-else>
              <div>
                <div v-if="editingRoleId !== r.id">
                  <span class="font-medium">{{ r.name }}</span>
                </div>
                <div v-else>
                  <input v-model.trim="editingRoleName"
                    class="w-64 rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"/>
                </div>
              </div>
              <div class="flex gap-2">
                <button v-if="editingRoleId !== r.id"
                  class="text-sm text-blue-600 hover:text-blue-800"
                  @click="startRoleEdit(r)">
                  Edit
                </button>
                <template v-else>
                  <button class="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          :disabled="savingRole" @click="saveRoleEdit(r)">
                    {{ savingRole ? 'Saving…' : 'Save' }}
                  </button>
                  <button class="px-3 py-1 rounded-md border border-[#ccc] hover:bg-gray-50"
                          :disabled="savingRole" @click="cancelRoleEdit">
                    Cancel
                  </button>
                </template>
              </div>
            </template>
          </li>
        </ul>
        <div class="px-6 py-4 border-t border-[#ccc] flex items-center gap-2">
          <input v-model="newRole" placeholder="Role name"
            class="flex-1 rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500"/>
          <button @click="createRole"
            class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
            Add
          </button>
          <span v-if="roleSuccess" class="text-green-600 text-sm">Added!</span>
          <span v-if="roleError" class="text-red-600 text-sm">Error.</span>
        </div>
      </section>

      <!-- Permissions -->
      <section v-if="activeTab === 'permissions'" class="bg-white border border-[#ccc] rounded-xl shadow-sm">
        <div class="px-6 py-4 border-b border-[#ccc]">
          <h3 class="text-lg font-semibold text-gray-900">Role Permissions</h3>
        </div>
        <div v-if="modulesError" class="px-6 py-4 text-red-600">Failed to load permissions.</div>
        <div v-for="role in permissionRoles" :key="role.id" class="px-6 py-4 border-b border-[#ccc] last:border-b-0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium">{{ role.name }}</h4>
            <div class="flex gap-2">
              <button class="px-3 py-1 rounded-md border border-[#ccc] text-sm hover:bg-gray-50" @click="rolePermissions[role.id] = new Set()">Clear</button>
              <button class="px-3 py-1 rounded-md bg-red-600 text-white text-sm hover:bg-red-700" @click="savePermissions(role.id)">Save</button>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label v-for="perm in modules" :key="perm.id"
              class="flex items-center gap-3 rounded-md border border-[#ccc] px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox"
                class="sr-only peer"
                :checked="rolePermissions[role.id]?.has(perm.id)"
                @change="togglePermission(role.id, perm.id, $event.target.checked)"/>
              <span class="relative inline-block h-5 w-10 rounded-full bg-gray-300 peer-checked:bg-emerald-500 transition-colors">
                <span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transform peer-checked:translate-x-5 transition"></span>
              </span>
              <span class="text-sm">{{ perm.name }}</span>
            </label>
          </div>

        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, reactive, onMounted, computed } from 'vue'
import { useSettingsService }   from '~/composables/useSettingsService'
import { useUserService }       from '~/composables/useUserService'
import { usePermissionService } from '~/composables/usePermissionService'
import { useVenueService }      from '~/composables/useVenueService'
import { useNotification }      from '~/composables/useNotification'

const { showNotification } = useNotification()

/** Tabs **/
const activeTab = ref('general')

/** Defaults (Currency + Timezone) **/
const { getSettings, updateSettings } = useSettingsService()
const currency = ref('USD')
const timezone = ref('Asia/Kolkata')

const currencyOptions = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'AED', name: 'UAE Dirham' }
]

const timezoneOptions = [
  // 🌍 Common Global Timezonesd
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'Australia/Sydney',

  // 🇺🇸 All US Timezones
  'America/New_York',      // Eastern
  'America/Detroit',
  'America/Kentucky/Louisville',
  'America/Kentucky/Monticello',
  'America/Indiana/Indianapolis',
  'America/Indiana/Vincennes',
  'America/Indiana/Winamac',
  'America/Indiana/Marengo',
  'America/Indiana/Petersburg',
  'America/Indiana/Vevay',
  'America/Chicago',       // Central
  'America/Indiana/Tell_City',
  'America/Indiana/Knox',
  'America/Menominee',
  'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem',
  'America/North_Dakota/Beulah',
  'America/Denver',        // Mountain
  'America/Boise',
  'America/Phoenix',       // Arizona (no DST)
  'America/Los_Angeles',   // Pacific
  'America/Anchorage',     // Alaska
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',          // Aleutian
  'Pacific/Honolulu'       // Hawaii
]

async function loadSettings() {
  try {
    const s = await getSettings()
    currency.value = s.currency || 'USD'
    timezone.value = s.timezone || 'Asia/Kolkata'
  } catch {
    showNotification('Failed to load settings', 'error')
  }
}

async function saveSettings() {
  try {
    await updateSettings({ currency: currency.value, timezone: timezone.value })
    showNotification('Settings saved successfully', 'success')
  } catch (e) {
    showNotification(e?.message || 'Failed to update settings', 'error')
  }
}

/** Venues **/
const { fetchVenues, createVenue, updateVenue, deleteVenue } = useVenueService()
const venues = ref([])
const venueForm = reactive({
  open: false,
  id: null,
  title: '',
  address: '',
  zipcode: '',
  mapLink: '',
  isActive: true
})
const savingVenue  = ref(false)

function resetVenueForm() {
  venueForm.id = null
  venueForm.title = ''
  venueForm.address = ''
  venueForm.zipcode = ''
  venueForm.mapLink = ''
  venueForm.isActive = true
}
function openVenueForm(v = null) {
  venueForm.open = true
  if (v) {
    venueForm.id = v.id
    venueForm.title = v.title
    venueForm.address = v.address
    venueForm.zipcode = v.zipcode
    venueForm.mapLink = v.mapLink || ''
    venueForm.isActive = !!v.isActive
  } else {
    resetVenueForm()
  }
}
function cancelVenueForm() {
  venueForm.open = false
  resetVenueForm()
}

async function loadVenues() {
  try {
    venues.value = await fetchVenues()
  } catch {
    showNotification('Failed to load venues', 'error')
  }
}

async function saveVenue() {
  if (!venueForm.title?.trim()) { showNotification('Title is required', 'error'); return }
  if (!venueForm.address?.trim()) { showNotification('Address is required', 'error'); return }
  if (!venueForm.zipcode?.trim()) { showNotification('Zipcode is required', 'error'); return }

  savingVenue.value = true
  try {
    let link = venueForm.mapLink?.trim() || ''

    // 🔧 Fix bad prefixes like "https;//"
    if (link && link.startsWith('https;//')) {
      link = link.replace('https;//', 'https://')
    }
    // 🔧 Only keep it if it looks like a full URL
    if (link && !/^https?:\/\//i.test(link)) {
      link = `https://${link}`
    }

    const payload = {
      title: venueForm.title.trim(),
      address: venueForm.address.trim(),
      zipcode: venueForm.zipcode.trim(),
      mapLink: link || undefined,
      isActive: !!venueForm.isActive
    }

    if (venueForm.id) await updateVenue(venueForm.id, payload)
    else await createVenue(payload)

    showNotification('Venue saved successfully', 'success')
    await loadVenues()
    cancelVenueForm()
  } catch (e) {
    showNotification(e?.message || 'Failed to save venue', 'error')
  } finally {
    savingVenue.value = false
  }
}


async function onDeleteVenue(v) {
  if (!confirm(`Delete venue "${v.title}"?`)) return
  try {
    await deleteVenue(v.id)
    await loadVenues()
    showNotification('Venue deleted', 'success')
  } catch (e) {
    showNotification(e?.message || 'Failed to delete venue', 'error')
  }
}

/** Users & Roles **/
const {
  fetchUsers,
  createUser: createUserService,
  fetchRoles,
  createRole: createRoleService,
  updateRole: updateRoleService,
} = useUserService()

const users       = ref([])
const newUser     = reactive({ email: '', password: '', roles: [] })
const roles       = ref([])
const newRole     = ref('')

async function loadUsers() {
  try {
    users.value = await fetchUsers()
  } catch {
    showNotification('Failed to load users', 'error')
  }
}
async function loadRoles() {
  try {
    roles.value = await fetchRoles()
  } catch {
    showNotification('Failed to load roles', 'error')
  }
}

const creatableRoles = computed(() =>
  roles.value.filter(r => r.name.toLowerCase() !== 'admin')
)

async function createUser() {
  try {
    await createUserService({
      email:    newUser.email,
      password: newUser.password,
      roles:    newUser.roles
    })
    showNotification('User created successfully', 'success')
    newUser.email     = ''
    newUser.password  = ''
    newUser.roles     = []
    await loadUsers()
  } catch (e) {
    showNotification(e?.message || 'Failed to create user', 'error')
  }
}
function usersCellRoles(u) {
  return u.roles.map(ur => ur.role?.name || ur.name).join(', ')
}
async function createRole() {
  try {
    await createRoleService({ name: newRole.value })
    showNotification('Role created successfully', 'success')
    newRole.value = ''
    await loadRoles()
  } catch (e) {
    showNotification(e?.message || 'Failed to create role', 'error')
  }
}

/** Inline edit state for roles **/
const editingRoleId   = ref(null)
const editingRoleName = ref('')
const savingRole      = ref(false)

function startRoleEdit(role) {
  if (role.name.toLowerCase() === 'admin') return
  editingRoleId.value   = role.id
  editingRoleName.value = role.name
}
function cancelRoleEdit() {
  editingRoleId.value   = null
  editingRoleName.value = ''
  savingRole.value      = false
}
async function saveRoleEdit(role) {
  if (!editingRoleId.value) return
  const newName = editingRoleName.value.trim()
  if (!newName) { showNotification('Role name is required', 'error'); return }
  if (newName.toLowerCase() === 'admin') {
    showNotification('Cannot rename a role to "admin".', 'error')
    return
  }
  try {
    savingRole.value = true
    await updateRoleService(editingRoleId.value, { name: newName })
    await loadRoles()
    showNotification('Role updated successfully', 'success')
    cancelRoleEdit()
  } catch (e) {
    showNotification(e?.message || 'Failed to update role', 'error')
  } finally {
    savingRole.value = false
  }
}

/** Permissions **/
const {
  fetchModules,            // GET /permissions
  fetchRolePermissions,    // GET /roles/:id/permissions
  assignRolePermissions    // POST /roles/:id/permissions
} = usePermissionService()

const modules         = ref([])
const rolePermissions = reactive({})  // roleId -> Set<permId>

const permissionRoles = computed(() =>
  roles.value.filter(r => r.name.toLowerCase() !== 'admin')
)

function togglePermission(roleId, permId, isOn) {
  if (!rolePermissions[roleId]) rolePermissions[roleId] = new Set()
  if (isOn) rolePermissions[roleId].add(permId)
  else       rolePermissions[roleId].delete(permId)
}

async function savePermissions(roleId) {
  const selected = Array.from(rolePermissions[roleId] || [])
  try {
    await assignRolePermissions(roleId, selected)
    showNotification('Permissions updated successfully', 'success')
  } catch (e) {
    showNotification(e?.message || 'Failed to save permissions', 'error')
  }
}

onMounted(async () => {
  await loadSettings()
  await loadUsers()
  await loadRoles()
  await loadVenues()

  try {
    modules.value = await fetchModules()
  } catch {
    showNotification('Failed to load permission modules', 'error')
  }

  for (const r of permissionRoles.value) {
    try {
      const ids = await fetchRolePermissions(r.id)
      rolePermissions[r.id] = new Set(ids)
    } catch {
      rolePermissions[r.id] = new Set()
    }
  }
})
</script>
