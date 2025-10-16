<template>
    <div class="max-w-[1100px] mx-auto px-4 py-8">
      <LegalPageEditor slug="cancellation" :content="pageContent" @saved="reload" />
    </div>
  </template>
  
  <script setup>
  definePageMeta({
    layout: 'admin',
    middleware: 'auth'
  })
  
  import { ref, onMounted } from 'vue'
  import LegalPageEditor from '~/components/LegalPageEditor.vue'
  import { useStaticPages } from '~/composables/useStaticPages'
  
  const { fetchPage, createPage } = useStaticPages()
  const pageContent = ref(null)
  
  async function load() {
    try {
      const res = await fetchPage('cancellation')
      pageContent.value = res?.content || null
    } catch (e) {
      const content = {
        title: 'Cancellation & Refund Policy',
        effectiveDate: new Date().toISOString().slice(0, 10),
        summaryHtml: '<p>This policy explains how cancellations and refunds are handled for our services.</p>',
        sections: [
          {
            heading: 'Cancellation Requests',
            bodyHtml: '<p>Customers may request a cancellation within 24 hours of purchase by contacting our support team.</p>'
          },
          {
            heading: 'Refund Eligibility',
            bodyHtml: '<p>Refunds will be processed only if the service has not been initiated or delivered in part.</p>'
          },
          {
            heading: 'Processing Time',
            bodyHtml: '<p>Refunds, when approved, will be credited within 7–10 business days.</p>'
          },
          {
            heading: 'Non-refundable Services',
            bodyHtml: '<p>Customized or one-time-use services are non-refundable once initiated.</p>'
          }
        ],
        contact: { email: '', phone: '', address: '' }
      }
  
      await createPage('cancellation', content)
      pageContent.value = content
    }
  }
  
  function reload() {
    load()
  }
  
  onMounted(load)
  </script>
  