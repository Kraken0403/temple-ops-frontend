<template>
  <div class="flex h-screen bg-[#f5f5f5]">
    <!-- Sidebar on the very left -->
    <transition name="slide">
      <Sidebar
        v-if="sidebarOpen"
        class="w-64 bg-['#ffffff'] "
      />
    </transition>

    <!-- Right side: Topbar at top, page content below -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Topbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 overflow-auto mx-[5px]">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Topbar  from '~/components/Topbar.vue'

const sidebarOpen = ref(true)
</script>

<style>
/* slide transition for the sidebar */
.slide-enter-active,
.slide-leave-active {
  transition: width .2s ease;
}
.slide-enter-from,
.slide-leave-to {
  width: 0;
  overflow: hidden;
}
</style>
