<!-- app.vue -->
<template>
  <!-- 
    NuxtLayout chooses the current layout (default or admin)
    which in turn renders <NuxtPage/>
  -->
  <NuxtLayout >
    <MediaPortal />
  </NuxtLayout>
  <NotificationSnackbar />
</template>

<script setup lang="js">
// You can register global components or imports here if needed,
// or set layout-specific watchers, etc.
import NotificationSnackbar from '@/components/ui/NotificationSnackbar.vue'
import MediaPortal from '@/components/media/MediaPortal.vue'
</script>

<style lang="scss" src="./assets/css/global.scss">
</style>
