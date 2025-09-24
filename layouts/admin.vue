<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <!-- Fixed sidebar -->
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Mobile backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/30 z-40 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Right side: Topbar + page content; shift when sidebar is open -->
    <div :class="['transition-[margin] duration-200', sidebarOpen ? 'md:ml-64' : 'md:ml-0']">
      <Topbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="min-h-[calc(100vh-56px)] overflow-auto mx-[5px] pt-2">
        <NuxtPage />
      </main>
    </div>

    <!-- Media picker portal -->
    <ClientOnly>
      <MediaPortal />
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Topbar from '~/components/Topbar.vue'
import MediaPortal from '@/components/media/MediaPortal.vue'

const sidebarOpen = ref(true)
</script>
