<template>
  <!-- Fixed left rail, scrollable inside -->
  <aside
    class="fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r shadow-sm transform transition-transform duration-200"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-full flex flex-col">
      <!-- Scrollable area -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
        <img class="mb-5 max-w-[140px]" src="../assets/images/logo.png" alt="Logo" />

        <!-- BOOKINGS -->
        <NavItem
          v-if="userPerms.has('Bookings')"
          to="/admin/bookings"
          label="Bookings"
          icon="event"
        />

        <!-- POOJAS -->
        <NavItem
          v-if="userPerms.has('Poojas')"
          to="/admin/poojas"
          label="Poojas"
          icon="local_fire_department"
        />

        <!-- EVENTS -->
        <div v-if="userPerms.has('Events')" class="mt-3">
          <button
            @click="isEventsOpen = !isEventsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">calendar_today</span>
              <span>Events</span>
            </div>
            <span class="material-icons text-[18px] transition-transform" :class="{ 'rotate-180': isEventsOpen }">
              expand_more
            </span>
          </button>
          <ul v-if="isEventsOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/events" label="All Events" icon="list" /></li>
            <li v-if="userPerms.has('Bookings')">
              <NavItem to="/admin/events/bookings" label="Bookings" icon="book_online" />
            </li>
          </ul>
        </div>

        <!-- PRIESTS -->
        <div v-if="userPerms.has('Priests')" class="mt-3">
          <button
            @click="isPriestsOpen = !isPriestsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">self_improvement</span>
              <span>Priests</span>
            </div>
            <span class="material-icons text-[18px] transition-transform" :class="{ 'rotate-180': isPriestsOpen }">
              expand_more
            </span>
          </button>
          <ul v-if="isPriestsOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/priests" label="All Priests" icon="list" /></li>
            <li><NavItem to="/admin/priests/calendar" label="Calendar" icon="calendar_today" /></li>
          </ul>
        </div>

        <!-- SPONSORSHIPS -->
        <div v-if="userPerms.has('Sponsorships')" class="mt-3">
          <button
            @click="isSponsorshipsOpen = !isSponsorshipsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">redeem</span>
              <span>Sponsorships</span>
            </div>
            <span class="material-icons text-[18px] transition-transform" :class="{ 'rotate-180': isSponsorshipsOpen }">
              expand_more
            </span>
          </button>
          <ul v-if="isSponsorshipsOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/sponsorships" label="Sponsorships" icon="list_alt" /></li>
            <li v-if="userPerms.has('Bookings')">
              <NavItem to="/admin/sponsorships/bookings" label="Bookings" icon="book_online" />
            </li>
          </ul>
        </div>

        <!-- DONATIONS -->
        <div v-if="userPerms.has('Donations')" class="mt-3">
          <button
            @click="isDonationsOpen = !isDonationsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">volunteer_activism</span>
              <span>Donations</span>
            </div>
            <span class="material-icons text-[18px] transition-transform" :class="{ 'rotate-180': isDonationsOpen }">
              expand_more
            </span>
          </button>
          <ul v-if="isDonationsOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/donations" label="Items" icon="payment" /></li>
            <li><NavItem to="/admin/donations/records" label="Records" icon="receipt_long" /></li>
          </ul>
        </div>

        <!-- PAGES -->
        <div class="mt-3">
          <button
            @click="isPagesOpen = !isPagesOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">article</span>
              <span>Pages</span>
            </div>
            <span class="material-icons text-[18px] transition-transform" :class="{ 'rotate-180': isPagesOpen }">
              expand_more
            </span>
          </button>
          <ul v-if="isPagesOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/static-pages/home" label="Home" icon="home" /></li>
            <li><NavItem to="/admin/static-pages/about" label="About" icon="info" /></li>
            <li><NavItem to="/admin/static-pages/gallery" label="Gallery" icon="photo_library" /></li>
            <li><NavItem to="/admin/static-pages/bhajans" label="Bhajans" icon="queue_music" /></li>
            <!-- Add these if you want quick access -->
            <li><NavItem to="/admin/static-pages/privacy" label="Privacy Policy" icon="policy" /></li>
            <li><NavItem to="/admin/static-pages/terms" label="Terms & Conditions" icon="gavel" /></li>
          </ul>
        </div>

        <!-- SETTINGS -->
        <NavItem
          v-if="userPerms.has('Settings')"
          to="/admin/settings"
          label="Settings"
          icon="settings"
        />
      </nav>

      <!-- Static bottom bar (not scrolling) -->
      <div class="p-4 border-t bg-white">
        <button
          @click="$emit('close'); logout()"
          class="w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePermissionService } from '~/composables/usePermissionService'
import { useUserService } from '~/composables/useUserService'

const props = defineProps({
  open: { type: Boolean, default: true },
})

defineEmits(['close'])

const auth = useAuth()
const { fetchModules, fetchRolePermissions } = usePermissionService()
const { fetchRoles } = useUserService()

const allPermissions = ref([])
const allRoles = ref([])
const userPerms = ref(new Set())

const isEventsOpen = ref(false)
const isPriestsOpen = ref(false)
const isDonationsOpen = ref(false)
const isSponsorshipsOpen = ref(false)
const isPagesOpen = ref(false)

onMounted(async () => {
  try {
    allPermissions.value = await fetchModules()
    allRoles.value = await fetchRoles()
  } catch (e) {
    console.error('Failed to load perms or roles:', e)
  }
})

watchEffect(async () => {
  userPerms.value.clear()
  const me = auth.user.value
  if (!me || !Array.isArray(me.roles) || allRoles.value.length === 0) return

  await Promise.all(
    me.roles.map(async roleName => {
      const roleObj = allRoles.value.find(r => r.name === roleName)
      if (!roleObj) return
      try {
        const permIds = await fetchRolePermissions(roleObj.id)
        permIds.forEach(id => {
          const perm = allPermissions.value.find(p => p.id === id)
          if (perm) userPerms.value.add(perm.name)
        })
      } catch (e) {
        console.error(`Failed to load perms for ${roleName}:`, e)
      }
    })
  )
})

const { logout } = auth
</script>
