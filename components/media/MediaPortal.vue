<template>
  <MediaModal
    :open="store.isOpen"
    :multiple="store.multiple"
    :accept="store.accept"
    @close="store.cancel()"
    @apply="onApply"
  />
</template>

<script setup>
import { useMediaStore } from '@/stores/useMediaStore'   // ✅ same store as caller
import MediaModal from '@/components/media/MediaModal.vue'

const store = useMediaStore()
function onApply(selection){ store.apply(selection) }
</script>
