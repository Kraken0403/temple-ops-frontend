<template>
    <div class="p-6 space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Pages</h1>
        <NuxtLink to="/admin/pages/new" class="btn-primary">New Page</NuxtLink>
      </div>
  
      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-else-if="!pages.length" class="text-gray-500">No pages yet.</div>
  
      <ul v-else class="space-y-2">
        <li v-for="p in pages" :key="p.id" class="flex justify-between items-center border p-4 rounded">
          <div>
            <h2 class="font-semibold">{{ p.title }}</h2>
            <small class="text-gray-500">/{‌{ p.slug }}</small>
          </div>
          <div class="space-x-2">
            <NuxtLink :to="`/admin/pages/${p.id}/edit`" class="btn-sm">Edit</NuxtLink>
            <button @click="remove(p.id)" class="btn-sm text-red-600">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { usePageService } from '@/composables/usePageService'
  
  const pages = ref([])
  const error = ref(null)
  const router = useRouter()
  const { fetchPages, deletePage } = usePageService()
  
  async function load() {
    try {
      pages.value = await fetchPages()
    } catch (e) {
      error.value = e.message
    }
  }
  async function remove(id) {
    if (!confirm('Delete this page?')) return
    await deletePage(id)
    await load()
  }
  
  onMounted(load)
  </script>
  
  <style scoped>
  .btn-primary {
    background: #570000; color: #fff; padding: .5rem 1rem; border-radius: .375rem;
  }
  .btn-sm {
    padding: .25rem .5rem; border: 1px solid #ccc; border-radius: .25rem;
  }
  </style>
  