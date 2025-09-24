<template>
    <section class="max-w-full mx-auto">
      <div v-if="!form" class="text-gray-500">Loading editor…</div>
  
      <div v-else class="space-y-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">
              Edit {{ prettyTitle }} Page
            </h2>
            <p class="text-sm text-gray-500">Static legal page shown on the website.</p>
          </div>
  
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-3 py-2 text-sm border rounded hover:bg-gray-50"
              @click="restoreTemplate"
            >
              Restore Template
            </button>
            <span
              v-if="hasErrors"
              class="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200"
            >
              Please fix the highlighted fields
            </span>
            <button
              @click="save"
              :disabled="saving || !isValid || !form"
              class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
  
        <!-- Basics -->
        <div class="bg-white shadow overflow-hidden">
          <div class="px-5 py-4 border-b bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-700">Basics</h3>
            <p class="text-sm text-gray-500">Title, effective date, and a short summary/intro.</p>
          </div>
  
          <div class="p-5 grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input v-model.trim="form.title" type="text" class="w-full p-2 border rounded" />
              <p v-if="errors['title']" class="text-xs text-red-600 mt-1">{{ errors['title'] }}</p>
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input v-model="form.effectiveDate" type="date" class="w-full p-2 border rounded" />
              <p v-if="errors['effectiveDate']" class="text-xs text-red-600 mt-1">
                {{ errors['effectiveDate'] }}
              </p>
            </div>
  
            <div class="md:col-span-2">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700 mb-1">Summary (HTML)</label>
                <label class="px-3 py-1 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 text-xs">
                  Insert image…
                  <input type="file" accept="image/*" class="hidden" @change="insertImage('summaryHtml')" />
                </label>
              </div>
              <textarea v-model="form.summaryHtml" rows="4" class="w-full p-2 border rounded" />
            </div>
          </div>
        </div>
  
        <!-- Sections -->
        <div class="bg-white shadow overflow-hidden">
          <div class="px-5 py-4 border-b bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-700">Sections</h3>
            <p class="text-sm text-gray-500">Add or reorder sections with headings and HTML content.</p>
          </div>
  
          <div class="p-5 space-y-6">
            <div
              v-for="(sec, i) in form.sections"
              :key="sec.id || i"
              class="border p-4 space-y-4"
              :class="hasSectionErrors(i) ? 'border-red-300 bg-red-50/20' : 'border-gray-200'"
            >
              <div class="flex items-center justify-between">
                <h4 class="font-medium text-gray-800">Section #{{ i + 1 }}</h4>
                <div class="flex gap-2">
                  <button
                    class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
                    :disabled="i === 0"
                    @click="moveSection(i, -1)"
                  >↑</button>
                  <button
                    class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
                    :disabled="i === form.sections.length - 1"
                    @click="moveSection(i, +1)"
                  >↓</button>
                  <button
                    class="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded text-sm text-red-600"
                    @click="removeSection(i)"
                  >Remove</button>
                </div>
              </div>
  
              <div class="grid md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                  <input v-model.trim="sec.heading" type="text" class="w-full p-2 border rounded" />
                  <p v-if="errors[`sections.${i}.heading`]" class="text-xs text-red-600 mt-1">
                    {{ errors[`sections.${i}.heading`] }}
                  </p>
                </div>
                <div class="md:col-span-2">
                  <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
                    <label class="px-3 py-1 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 text-xs">
                      Insert image…
                      <input type="file" accept="image/*" class="hidden" @change="insertImage('sections', i)" />
                    </label>
                  </div>
                  <textarea v-model="sec.bodyHtml" rows="5" class="w-full p-2 border rounded" />
                  <p v-if="errors[`sections.${i}.bodyHtml`]" class="text-xs text-red-600 mt-1">
                    {{ errors[`sections.${i}.bodyHtml`] }}
                  </p>
                </div>
              </div>
            </div>
  
            <button
              type="button"
              class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
              @click="addSection"
            >
              + Add Section
            </button>
            <p v-if="errors['sections']" class="text-xs text-red-600 mt-1">{{ errors['sections'] }}</p>
          </div>
        </div>
  
        <!-- Contact (optional but handy for Privacy page) -->
        <div class="bg-white shadow overflow-hidden">
          <div class="px-5 py-4 border-b bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-700">Contact Info (optional)</h3>
            <p class="text-sm text-gray-500">Shown at the end of the page.</p>
          </div>
  
          <div class="p-5 grid md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model.trim="form.contact.email" type="email" class="w-full p-2 border rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input v-model.trim="form.contact.phone" type="text" class="w-full p-2 border rounded" />
            </div>
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea v-model.trim="form.contact.address" rows="2" class="w-full p-2 border rounded"></textarea>
            </div>
          </div>
        </div>
  
        <!-- Save -->
        <div class="flex justify-end pt-2">
          <button
            @click="save"
            :disabled="saving || !isValid || !form"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  import { useStaticPages } from '~/composables/useStaticPages'
  
  const props = defineProps({
    slug: { type: String, required: true },
    content: { type: Object, default: null }
  })
  const emit = defineEmits(['saved'])
  
  const { updatePage, uploadPhoto } = useStaticPages()
  
  const form = ref(null)
  const errors = ref({})
  const saving = ref(false)
  
  const prettyTitle = computed(() =>
    props.slug === 'privacy' ? 'Privacy Policy'
    : props.slug === 'terms' ? 'Terms & Conditions'
    : 'Static'
  )
  
  // Defaults per page
  function defaultContent() {
    const today = new Date().toISOString().slice(0, 10)
    if (props.slug === 'privacy') {
      return {
        title: 'Privacy Policy',
        effectiveDate: today,
        summaryHtml: '<p>This Privacy Policy explains how we collect, use, and safeguard your information.</p>',
        sections: [
          { heading: 'Information We Collect', bodyHtml: '<p>…</p>' },
          { heading: 'How We Use Information', bodyHtml: '<p>…</p>' },
          { heading: 'Data Security', bodyHtml: '<p>…</p>' },
          { heading: 'Your Rights', bodyHtml: '<p>…</p>' }
        ],
        contact: { email: '', phone: '', address: '' }
      }
    }
    // terms
    return {
      title: 'Terms & Conditions',
      effectiveDate: today,
      summaryHtml: '<p>These Terms govern your use of our website and services.</p>',
      sections: [
        { heading: 'Acceptance of Terms', bodyHtml: '<p>…</p>' },
        { heading: 'Use of Services', bodyHtml: '<p>…</p>' },
        { heading: 'Payments & Refunds', bodyHtml: '<p>…</p>' },
        { heading: 'Limitation of Liability', bodyHtml: '<p>…</p>' },
        { heading: 'Changes to these Terms', bodyHtml: '<p>…</p>' }
      ],
      contact: { email: '', phone: '', address: '' }
    }
  }
  
  watch(() => props.content, (c) => {
    form.value = c && typeof c === 'object' ? structuredClone(c) : defaultContent()
    validate()
  }, { immediate: true })
  
  /* -------- Validation -------- */
  function setError(k, v) { if (v) errors.value[k] = v; else delete errors.value[k] }
  
  function validate() {
    if (!form.value) return
    const f = form.value
    errors.value = {}
    setError('title', f.title?.trim() ? '' : 'Title is required')
    setError('effectiveDate', /^\d{4}-\d{2}-\d{2}$/.test(String(f.effectiveDate || '')) ? '' : 'Valid date is required')
  
    if (!Array.isArray(f.sections) || f.sections.length === 0) {
      setError('sections', 'Add at least one section')
    } else {
      f.sections.forEach((s, i) => {
        setError(`sections.${i}.heading`, s.heading?.trim() ? '' : 'Heading is required')
        setError(`sections.${i}.bodyHtml`, s.bodyHtml?.trim() ? '' : 'Body is required')
      })
    }
  }
  
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)
  const isValid = computed(() => !hasErrors.value)
  watch(form, validate, { deep: true })
  
  /* -------- Sections helpers -------- */
  function addSection() { form.value.sections.push({ heading: '', bodyHtml: '' }) }
  function removeSection(i) { form.value.sections.splice(i, 1); validate() }
  function moveSection(i, delta) {
    const j = i + delta
    if (j < 0 || j >= form.value.sections.length) return
    const arr = form.value.sections
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  function hasSectionErrors(i) {
    return Boolean(errors.value[`sections.${i}.heading`] || errors.value[`sections.${i}.bodyHtml`])
  }
  
  /* -------- Insert image uploader -------- */
  async function insertImage(target, index) {
    const file = event?.target?.files?.[0]
    if (!file) return
    try {
      const { url } = await uploadPhoto(file) // { url: "/uploads/..." }
      const imgTag = `<p><img src="${url}" alt=""></p>`
      if (target === 'summaryHtml') {
        form.value.summaryHtml = (form.value.summaryHtml || '') + imgTag
      } else if (target === 'sections' && typeof index === 'number') {
        form.value.sections[index].bodyHtml = (form.value.sections[index].bodyHtml || '') + imgTag
      }
    } catch (e) {
      console.error(e)
      alert('Image upload failed')
    } finally {
      if (event?.target) event.target.value = ''
    }
  }
  
  /* -------- Restore template -------- */
  function restoreTemplate() {
    form.value = defaultContent()
    validate()
  }
  
  /* -------- Save -------- */
  async function save() {
    validate()
    if (!isValid.value) return
    try {
      saving.value = true
      await updatePage(props.slug, form.value)
      alert('Page updated!')
      emit('saved')
    } catch (e) {
      console.error(e)
      alert('Failed to save page')
    } finally {
      saving.value = false
    }
  }
  </script>
  