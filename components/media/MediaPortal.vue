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
import { useMediaPickerStore } from '@/stores/mediaPicker'
import MediaModal from '@/components/media/MediaModal.vue'
const store = useMediaPickerStore()
function onApply(selection){ store.apply(selection) }
</script>
