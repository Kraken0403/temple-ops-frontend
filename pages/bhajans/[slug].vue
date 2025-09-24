<script setup>
import { computed } from 'vue'
import { useBhajansService } from '~/composables/useBhajansService'
import { useMediaUrl } from '~/composables/useMediaUrl'
import BhajanPdfViewer from '~/components/BhajanPdfViewer.client.vue'

const route = useRoute()
const slug = computed(() => {
  const s = route.params?.slug
  return typeof s === 'string' ? s : Array.isArray(s) ? s[0] : ''
})

const svc = useBhajansService()
const { data } = await useAsyncData(
  () => (slug.value ? svc.bySlug(slug.value) : null),
  { watch: [slug] }
)
const bhajan = computed(() => data.value || null)

const { toAbs } = useMediaUrl()
const pdfSrc = computed(() => toAbs(bhajan.value?.pdfUrl))
const thumbSrc = computed(() => toAbs(bhajan.value?.thumbnailUrl))

const safeTags = computed(() => {
  try { return bhajan.value?.tagsJson ? JSON.parse(bhajan.value.tagsJson) : [] }
  catch { return [] }
})

useSeoMeta({
  title: computed(() =>
    bhajan.value?.title ? `${bhajan.value.title} | Bhajans` : 'Bhajans'
  )
})
</script>

<template>
  <article class="container mx-auto px-4 py-8">
    <NuxtLink to="/bhajans" class="text-sm text-gray-500 hover:underline">← All Bhajans</NuxtLink>

    <header class="mt-2 mb-6">
      <h1 class="text-3xl font-semibold">{{ bhajan?.title }}</h1>
      <div class="text-gray-500 text-sm mt-1">
        <span v-if="bhajan?.language">{{ bhajan.language }}</span>
        <span v-if="bhajan?.viewsCount"> • {{ bhajan.viewsCount }} views</span>
      </div>
      <div class="mt-3 flex items-center gap-3">
        <!-- Open in new tab instead of using download attribute -->
        <a v-if="pdfSrc" :href="pdfSrc" target="_blank" rel="noopener" class="border rounded px-3 py-2">
          Open PDF
        </a>
        <a v-if="bhajan?.audioUrl" :href="bhajan.audioUrl" target="_blank" rel="noopener" class="border rounded px-3 py-2">
          Listen
        </a>
      </div>
    </header>

    <ClientOnly>
      <BhajanPdfViewer v-if="pdfSrc" :key="pdfSrc" :src="pdfSrc" class="w-full border rounded-lg" />
      <template #fallback>
        <object v-if="pdfSrc" :data="pdfSrc" type="application/pdf" width="100%" height="800">
          <iframe :src="pdfSrc" width="100%" height="800"></iframe>
        </object>
      </template>
    </ClientOnly>

    <section v-if="bhajan?.lyricsHtml" class="prose max-w-none mt-8" v-html="bhajan.lyricsHtml" />

    <section v-if="safeTags.length" class="mt-8 text-sm text-gray-500">
      <strong>Tags:</strong> {{ safeTags.join(', ') }}
    </section>
  </article>
</template>
