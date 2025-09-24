<template>
    <div class="max-w-[1100px] mx-auto px-4 py-8">
      <LegalPageEditor slug="terms" :content="pageContent" @saved="reload" />
    </div>
  </template>
  
  <script setup>
definePageMeta({ layout: 'admin', middleware: 'auth' })

  import { ref, onMounted } from 'vue'
  import LegalPageEditor from '~/components/LegalPageEditor.vue'
  import { useStaticPages } from '~/composables/useStaticPages'
  
  const { fetchPage, createPage } = useStaticPages()
  const pageContent = ref(null)
  
  async function load() {
    try {
      const res = await fetchPage('terms')
      pageContent.value = res?.content || null
    } catch (e) {
      const content = {
        title: 'Terms & Conditions',
        effectiveDate: new Date().toISOString().slice(0,10),
        summaryHtml: '',
        sections: [],
        contact: { email: '', phone: '', address: '' }
      }
      await createPage('terms', content)
      pageContent.value = content
    }
  }
  function reload() { load() }
  
  onMounted(load)
  </script>
  