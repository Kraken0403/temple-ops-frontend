<script setup>
defineProps({
  calendarEvent: Object
})
</script>

<template>
  <div
    class="bg-blue-600 text-white rounded px-2 py-1 text-xs overflow-hidden cursor-pointer"
  >
    <div class="font-semibold truncate">{{ event.title }}</div>
    <div class="text-[10px]">
      👳 {{ event.meta?.priestName || '—' }} <br />
      👤 {{ event.meta?.userName || '—' }}
    </div>
  </div>
</template>
