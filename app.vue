<!-- app.vue -->
<template>
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
import { loadTimezone } from '@/utils/timezone'

onMounted(async () => {
  await loadTimezone()
})

</script>

<style lang="scss" src="./assets/css/global.scss">
</style>
