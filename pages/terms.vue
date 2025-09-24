<template>
    <article class="max-w-[900px] mx-auto px-4 py-10">
      <h1 class="text-3xl font-semibold">{{ doc.title || 'Terms & Conditions' }}</h1>
      <p v-if="doc.effectiveDate" class="text-sm text-gray-500 mt-1">
        Effective: {{ doc.effectiveDate }}
      </p>
  
      <section v-if="doc.summaryHtml" class="prose max-w-none mt-6" v-html="html(doc.summaryHtml)" />
  
      <section v-for="(s, i) in doc.sections" :key="i" class="prose max-w-none mt-8">
        <h2 class="text-xl font-semibold">{{ s.heading }}</h2>
        <div v-html="html(s.bodyHtml)"></div>
      </section>
  
      <section v-if="doc.contact && (doc.contact.email || doc.contact.phone || doc.contact.address)" class="mt-10 text-sm text-gray-700">
        <h3 class="text-base font-semibold mb-2">Contact</h3>
        <p v-if="doc.contact.email"><strong>Email:</strong> {{ doc.contact.email }}</p>
        <p v-if="doc.contact.phone"><strong>Phone:</strong> {{ doc.contact.phone }}</p>
        <p v-if="doc.contact.address"><strong>Address:</strong> {{ doc.contact.address }}</p>
      </section>
    </article>
  </template>
  
  <script setup>
//  definePageMeta({ layout: 'admin', middleware: 'auth' })

  import { computed } from 'vue'
  import { useStaticPages } from '~/composables/useStaticPages'
  import { useRuntimeConfig } from '#app'
  
  const { fetchPage } = useStaticPages()
  const cfg = useRuntimeConfig().public
  const origin = new URL(cfg.apiBase).origin
  
  const { data } = await useAsyncData('terms', () => fetchPage('terms'))
  const doc = computed(() => data.value?.content || {})
  
  const html = (s) => (s || '').replaceAll('src="/uploads', `src="${origin}/uploads`)
  useSeoMeta({ title: doc.value?.title || 'Terms & Conditions' })
  </script>
  