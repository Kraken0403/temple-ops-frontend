<!-- components/admin/Sidebar.vue -->
<template>
  <div class="sidebar-component bg-white">
    <nav class="flex flex-col h-full justify-between p-4 space-y-2 text-sm">
      <div class="sidebar-nav">
        <img class="sidebar-logo mb-5" src="../assets/images/logo.png" alt="Logo" />

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

        <!-- EVENTS dropdown -->
        <div v-if="userPerms.has('Events')" class="mt-3">
          <button
            @click="isEventsOpen = !isEventsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">calendar_today</span>
              <span>Events</span>
            </div>
            <span
              class="material-icons text-[18px] transition-transform"
              :class="{ 'rotate-180': isEventsOpen }"
            >
              expand_more
            </span>
          </button>
          <ul v-if="isEventsOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li>
              <NavItem to="/admin/events" label="All Events" icon="list" />
            </li>
            <li v-if="userPerms.has('Bookings')">
              <NavItem to="/admin/events/bookings" label="Bookings" icon="book_online" />
            </li>
          </ul>
        </div>

        <!-- PRIESTS dropdown -->
        <div v-if="userPerms.has('Priests')" class="mt-3">
          <button
            @click="isPriestsOpen = !isPriestsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">self_improvement</span>
              <span>Priests</span>
            </div>
            <span
              class="material-icons text-[18px] transition-transform"
              :class="{ 'rotate-180': isPriestsOpen }"
            >
              expand_more
            </span>
          </button>
          <ul v-if="isPriestsOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/priests" label="All Priests" icon="list" /></li>
            <li><NavItem to="/admin/priests/calendar" label="Calendar" icon="calendar_today" /></li>
          </ul>
        </div>

        <!-- SPONSORSHIPS dropdown -->
        <div v-if="userPerms.has('Sponsorships')" class="mt-3">
          <button
            @click="isSponsorshipsOpen = !isSponsorshipsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">redeem</span>
              <span>Sponsorships</span>
            </div>
            <span
              class="material-icons text-[18px] transition-transform"
              :class="{ 'rotate-180': isSponsorshipsOpen }"
            >
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

        <!-- DONATIONS dropdown -->
        <div v-if="userPerms.has('Donations')" class="mt-3">
          <button
            @click="isDonationsOpen = !isDonationsOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">volunteer_activism</span>
              <span>Donations</span>
            </div>
            <span
              class="material-icons text-[18px] transition-transform"
              :class="{ 'rotate-180': isDonationsOpen }"
            >
              expand_more
            </span>
          </button>
          <ul v-if="isDonationsOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/donations" label="Items" icon="payment" /></li>
            <li><NavItem to="/admin/donations/records" label="Records" icon="receipt_long" /></li>
          </ul>
        </div>

        <!-- PAGES dropdown -->
        <div class="mt-3">
          <button
            @click="isPagesOpen = !isPagesOpen"
            class="w-full flex justify-between items-center px-2 py-2 rounded hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <span class="material-icons text-[18px]">article</span>
              <span>Pages</span>
            </div>
            <span
              class="material-icons text-[18px] transition-transform"
              :class="{ 'rotate-180': isPagesOpen }"
            >
              expand_more
            </span>
          </button>
          <ul v-if="isPagesOpen" class="ml-6 mt-2 space-y-1 text-sm">
            <li><NavItem to="/admin/static-pages/home" label="Home" icon="home" /></li>
            <li><NavItem to="/admin/static-pages/about" label="About" icon="info" /></li>
            <li><NavItem to="/admin/static-pages/gallery" label="Gallery" icon="photo_library" /></li>
          </ul>
        </div>

        <!-- SETTINGS -->
        <NavItem
          v-if="userPerms.has('Settings')"
          to="/admin/settings"
          label="Settings"
          icon="settings"
        />
      </div>

      <!-- Logout Button -->
      <button
        @click="logout()"
        class="w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600"
      >
        Logout
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { useAuth }              from '~/composables/useAuth'
import { usePermissionService } from '~/composables/usePermissionService'
import { useUserService }       from '~/composables/useUserService'

const auth = useAuth()
const { fetchModules, fetchRolePermissions } = usePermissionService()
const { fetchRoles } = useUserService()

// full lists
const allPermissions = ref([])        // [{id,name,...},…]
const allRoles       = ref([])        // [{id,name},…]
const userPerms      = ref(new Set()) // Set<string>

// dropdown toggles
const isEventsOpen       = ref(false)
const isPriestsOpen      = ref(false)
const isDonationsOpen    = ref(false)
const isSponsorshipsOpen = ref(false)
const isPagesOpen        = ref(false)

onMounted(async () => {
  try {
    allPermissions.value = await fetchModules()
    allRoles.value       = await fetchRoles()
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

<style scoped src="../assets/css/Sidebar.scss"></style>
