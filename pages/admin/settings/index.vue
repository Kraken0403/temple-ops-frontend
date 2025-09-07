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
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'currency'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'currency'"
        >
          <span class="material-icons text-[18px] mr-2">payments</span>Currency
        </button>
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'users'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'users'"
        >
          <span class="material-icons text-[18px] mr-2">group</span>Users
        </button>
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'roles'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'roles'"
        >
          <span class="material-icons text-[18px] mr-2">badge</span>Roles
        </button>
        <button
          class="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'permissions'
            ? 'bg-red-600 text-white shadow'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          @click="activeTab = 'permissions'"
        >
          <span class="material-icons text-[18px] mr-2">admin_panel_settings</span>Permissions
        </button>
      </nav>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

      <!-- Currency -->
      <section v-if="activeTab === 'currency'" class="bg-white border border-[#ccc] rounded-xl shadow-sm">
        <div class="px-6 py-4 border-b border-[#ccc] flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Default Currency</h3>
            <p class="text-sm text-gray-500">Choose the currency used for invoices and reports.</p>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select v-model="currency"
                class="w-full rounded-md border border-[#ccc] px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500">
                <option v-for="opt in currencyOptions" :key="opt.code" :value="opt.code">
                  {{ opt.name }} ({{ opt.code }})
                </option>
              </select>
            </div>
            <div class="flex items-center gap-3">
              <button @click="saveCurrency"
                class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                Save
              </button>
              <span v-if="currencySuccess" class="text-green-600 text-sm">Saved!</span>
              <span v-if="currencyError" class="text-red-600 text-sm">Error.</span>
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
          <div class="mt-2">
            <span v-if="permissionSuccess[role.id]" class="text-green-600 text-sm">✓ Saved</span>
            <span v-if="permissionError[role.id]" class="text-red-600 text-sm">✕ Error</span>
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

/** Currency **/
const { getSettings, updateSettings } = useSettingsService()
const currency        = ref('USD')
const currencySuccess = ref(false)
const currencyError   = ref(false)
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
async function loadCurrency() {
  try {
    const s = await getSettings()
    currency.value = s.currency || 'USD'
  } catch {
    currencyError.value = true
  }
}
async function saveCurrency() {
  try {
    await updateSettings({ currency: currency.value })
    currencySuccess.value = true
    currencyError.value   = false
  } catch {
    currencySuccess.value = false
    currencyError.value   = true
  }
}

/** Users & Roles **/
const {
  fetchUsers,
  createUser: createUserService,
  fetchRoles,
  createRole: createRoleService,
  updateRole: updateRoleService,          // 👈 NEW
} = useUserService()

const users       = ref([])
const usersError  = ref(false)
const newUser     = reactive({ email: '', password: '', roles: [] })
const userSuccess = ref(false)
const userError   = ref(false)

const roles       = ref([])
const rolesError  = ref(false)

const newRole     = ref('')
const roleSuccess = ref(false)
const roleError   = ref(false)

async function loadUsers() {
  try {
    users.value      = await fetchUsers()
    usersError.value = false
  } catch {
    usersError.value = true
  }
}
async function loadRoles() {
  try {
    roles.value      = await fetchRoles()
    rolesError.value = false
  } catch {
    rolesError.value = true
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
    userSuccess.value = true
    userError.value   = false
    newUser.email     = ''
    newUser.password  = ''
    newUser.roles     = []
    await loadUsers()
  } catch {
    userSuccess.value = false
    userError.value   = true
  }
}
function usersCellRoles(u) {
  return u.roles.map(ur => ur.role?.name || ur.name).join(', ')
}
async function createRole() {
  try {
    await createRoleService({ name: newRole.value })
    roleSuccess.value = true
    roleError.value   = false
    newRole.value     = ''
    await loadRoles()
  } catch {
    roleSuccess.value = false
    roleError.value   = true
  }
}

/** Inline edit state for roles **/
const editingRoleId   = ref(null)
const editingRoleName = ref('')
const savingRole      = ref(false)
const editRoleSuccess = ref(false)
const editRoleError   = ref('')

function startRoleEdit(role) {
  if (role.name.toLowerCase() === 'admin') return
  editingRoleId.value   = role.id
  editingRoleName.value = role.name
  editRoleSuccess.value = false
  editRoleError.value   = ''
}
function cancelRoleEdit() {
  editingRoleId.value   = null
  editingRoleName.value = ''
  savingRole.value      = false
  editRoleSuccess.value = false
  editRoleError.value   = ''
}
async function saveRoleEdit(role) {
  if (!editingRoleId.value) return
  const newName = editingRoleName.value.trim()
  if (!newName) { editRoleError.value = 'Role name is required'; return }
  if (newName.toLowerCase() === 'admin') {
    editRoleError.value = 'Cannot rename a role to "admin".'
    return
  }
  try {
    savingRole.value = true
    editRoleError.value = ''
    await updateRoleService(editingRoleId.value, { name: newName })
    await loadRoles()
    editRoleSuccess.value = true
    cancelRoleEdit()
  } catch (e) {
    editRoleSuccess.value = false
    editRoleError.value   = e?.message || 'Failed to update role'
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

const modules           = ref([])
const modulesError      = ref(false)
const rolePermissions   = reactive({})  // roleId -> Set<permId>
const permissionSuccess = reactive({})
const permissionError   = reactive({})

const permissionRoles = computed(() =>
  roles.value.filter(r => r.name.toLowerCase() !== 'admin')
)

function togglePermission(roleId, permId, isOn) {
  if (!rolePermissions[roleId]) rolePermissions[roleId] = new Set()
  if (isOn) rolePermissions[roleId].add(permId)
  else       rolePermissions[roleId].delete(permId)
}

async function savePermissions(roleId) {
  permissionSuccess[roleId] = false
  permissionError[roleId]   = false
  const selected = Array.from(rolePermissions[roleId] || [])
  try {
    await assignRolePermissions(roleId, selected)
    permissionSuccess[roleId] = true
  } catch (e) {
    permissionError[roleId] = true
  }
}

/** Tabs **/
const activeTab = ref('currency')

onMounted(async () => {
  await loadCurrency()
  await loadUsers()
  await loadRoles()

  // load permission modules
  try {
    modules.value = await fetchModules()
  } catch {
    modulesError.value = true
  }

  // load each role’s assigned permission IDs
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
