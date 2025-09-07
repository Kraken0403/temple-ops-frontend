<template>
  <div class="">
    <h1 class="text-[16px] font-bold mb-[5px] p-[15px]">
      Edit: {{ slug }}
      <span class="text-gray-400 text-sm">({{ template }})</span>
    </h1>

    <div v-if="loading" class="text-gray-500">Loading…</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else>
      <!-- Render correct editor -->
      <component
        :is="CurrentEditor"
        :content="content"
        :slug="slug"
        @saved="reload"
      />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRoute } from '#app'
import { useStaticPages } from '~/composables/useStaticPages'

// Editors registry (pointing to components folder, not pages!)
const Editors = {
  home:  defineAsyncComponent(() => import('~/pages/admin/static-pages/HomeEditor.vue')),
  about: defineAsyncComponent(() => import('~/pages/admin/static-pages/AboutEditor.vue')),
  gallery: defineAsyncComponent(() => import('~/pages/admin/static-pages/GalleryEditor.vue')),
  // fallback: generic JSON editor
  // default: defineAsyncComponent(() => import('~/components/admin/static/GenericJsonEditor.vue')),
}

const route = useRoute()
const slug  = computed(() => route.params.slug)
const { fetchPage } = useStaticPages()

const loading  = ref(true)
const error    = ref('')
const pageRow  = ref(null)
const content  = ref({})
const template = computed(() => pageRow.value?.template || slug.value)

const CurrentEditor = computed(() => Editors[template.value] || Editors.default)

async function reload() {
  try {
    loading.value = true
    error.value = ''
    const res = await fetchPage(slug.value)
    pageRow.value = res
    content.value = res?.content || {}
  } catch (e) {
    error.value = e?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

onMounted(reload)
</script>
