<template>
    <section class="py-0 w-full mx-auto">
      <PageHero
        title="Bhajans & Aartis"
        caption="Explore devotional songs with embedded PDFs and lyrics."
        :imageUrl="bg"
      />
  
      <div class="max-w-[1190px] mx-auto py-16">
        <!-- <h1 class="text-3xl font-bold text-center mb-[50px]">Our Bhajans</h1> -->
  
        <!-- Filters -->
        <div class="flex flex-wrap gap-3 justify-center mb-8">
          <input
            v-model.trim="q.search"
            placeholder="Search bhajans…"
            class="px-4 py-2 border rounded w-full sm:w-[320px]"
          />
          <input
            v-model.trim="q.tag"
            placeholder="Tag e.g. Krishna"
            class="px-4 py-2 border rounded w-full sm:w-[220px]"
          />
          <select v-model.number="q.limit" class="px-4 py-2 border rounded">
            <option :value="12">12</option>
            <option :value="24">24</option>
            <option :value="48">48</option>
          </select>
        </div>
  
        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="i in 6" :key="i" class="animate-pulse bg-gray-100 h-28 rounded-lg"></div>
        </div>
  
        <!-- Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NuxtLink
            v-for="b in items"
            :key="b.id"
            :to="`/bhajans/${b.slug}`"
            class="flex bg-white border border-[#8c8c8c] rounded-[12px] p-4 shadow hover:shadow-md transition hover:bg-amber-50"
          >
            <!-- Thumb -->
            <div class="w-24 h-24 rounded-lg overflow-hidden border mr-4 hidden sm:block">
              <img
                v-if="b.thumbnailUrl"
                :src="b.thumbnailUrl"
                alt=""
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full grid place-items-center text-xs text-gray-400">
                No Image
              </div>
            </div>
  
            <!-- Content -->
            <div class="flex-1 flex flex-col">
              <h3 class="text-[18px] sm:text-[20px] font-semibold mb-2 line-clamp-2">
                {{ b.title }}
              </h3>
              <div class="mt-auto flex items-center justify-between">
                <div class="flex items-center gap-4 text-[#8c8c8c] font-semibold text-sm">
                  <div class="flex items-center gap-1">
                    <i class="material-icons text-[#570000]">article</i>
                    <span>PDF</span>
                  </div>
                  <div v-if="b.language" class="flex items-center gap-1">
                    <i class="material-icons text-[#570000]">translate</i>
                    <span>{{ b.language }}</span>
                  </div>
                </div>
                <div class="arrow bg-[#570000] rounded-full flex items-center p-[5px]">
                  <span class="material-icons text-2xl text-white">arrow_forward</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
  
        <!-- Pager -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-8">
          <button :disabled="q.page<=1" @click="go(q.page-1)" class="border rounded px-3 py-2">
            Prev
          </button>
          <span class="text-sm text-gray-500">Page {{ q.page }} of {{ totalPages }}</span>
          <button :disabled="q.page>=totalPages" @click="go(q.page+1)" class="border rounded px-3 py-2">
            Next
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import PageHero from '@/components/PageHero.vue'
  import bg from '@/assets/images/sample-2.webp'
  import { useBhajansService } from '~/composables/useBhajansService'
  
  const svc = useBhajansService()
  const q = reactive({ search: '', tag: '', page: 1, limit: 12 })
  
  const items = ref([])
  const total = ref(0)
  const loading = ref(true)
  
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / q.limit)))
  function go(p) { q.page = Math.max(1, Math.min(totalPages.value, p)) }
  
  async function load() {
    loading.value = true
    try {
      const { items: list, total: t } = await svc.list(q)
      items.value = list
      total.value = t
    } finally {
      loading.value = false
    }
  }
  
  onMounted(load)
  // re-load on filter change
  watch(() => ({ ...q }), load, { deep: true })
  </script>
  
  <style scoped>
  .material-icons { font-size: 20px; vertical-align: middle; }
  .animate-pulse { animation: pulse 1.5s infinite ease-in-out; }
  @keyframes pulse { 0%,100%{background:#f3f3f3} 50%{background:#e5e5e5} }
  </style>
  