<template>
    <section class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold">Bhajans</h1>
        <button @click="openForm(null)" class="bg-black text-white px-3 py-2 rounded-md">Add Bhajan</button>
      </div>
  
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="b in items" :key="b.id" class="border rounded-lg p-4">
          <h3 class="font-semibold">{{ b.title }}</h3>
          <p class="text-xs text-gray-500 mt-1">/{{ b.slug }}</p>
          <div class="mt-3 flex items-center gap-2">
            <NuxtLink :to="`/bhajans/${b.slug}`" class="border rounded px-2 py-1">View</NuxtLink>
            <button @click="openForm(b)" class="border rounded px-2 py-1">Edit</button>
            <button @click="del(b.id)" class="border rounded px-2 py-1 text-red-600">Delete</button>
          </div>
        </div>
      </div>
  
      <AdminBhajanForm v-if="show" :bhajan="current" @close="show=false" @saved="reload" />
    </section>
  </template>
  
  <script setup>
  definePageMeta({ layout: 'admin', middleware: 'auth' })


  import { useBhajansService } from '~/composables/useBhajansService'
  import AdminBhajanForm from '~/components/AdminBhajanForm.vue'
  
  const svc = useBhajansService()
  const items = ref([])
  const show = ref(false)
  const current = ref(null)
  async function reload(){ const { items: list } = await svc.list({ limit: 200 }); items.value = list }
  function openForm(b){ current.value = b; show.value = true }
  async function del(id){ if(confirm('Delete bhajan?')) { await svc.remove(id); reload() } }
  onMounted(reload)
  </script>
  