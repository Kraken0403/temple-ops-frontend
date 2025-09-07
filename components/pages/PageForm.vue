<template>
  <form @submit.prevent="onSubmit" class="space-y-6 p-6 bg-white rounded shadow">
    <!-- Slug -->
    <div>
      <label class="block font-medium mb-1">Slug</label>
      <input
        v-model="form.slug"
        required
        class="w-full border rounded px-3 py-2"
        placeholder="e.g. about"
      />
    </div>

    <!-- Title -->
    <div>
      <label class="block font-medium mb-1">Title</label>
      <input
        v-model="form.title"
        required
        class="w-full border rounded px-3 py-2"
        placeholder="Page title"
      />
    </div>

    <!-- Template selector -->
    <div>
      <label class="block font-medium mb-1">Template</label>
      <select
        v-model="form.template"
        class="w-full border rounded px-3 py-2"
      >
        <option value="">Default</option>
        <option value="about">About</option>
        <option value="gallery">Gallery</option>
        <option value="contact">Contact</option>
      </select>
    </div>

    <!-- Dynamic sub-form -->
    <div>
      <component
        :is="currentForm"
        v-model="form.content"
        class="p-4 border rounded bg-gray-50"
      />
    </div>

    <!-- Submit button -->
    <button
      type="submit"
      class="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      {{ isNew ? 'Create Page' : 'Update Page' }}
    </button>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue'
import AboutForm   from '~/components/pages/forms/AboutForm.vue'
import GalleryForm from '~/components/pages/forms/GalleryForm.vue'
import ContactForm from '~/components/pages/forms/ContactForm.vue'
import DefaultForm from '~/components/pages/forms/DefaultForm.vue'

// props & emits
const props = defineProps({
  initial: { type: Object, default: () => ({ slug:'', title:'', template:'', content:{} }) },
  isNew:   { type: Boolean, default: true },
})
const emit = defineEmits(['save'])

// Reactive form state
const form = reactive({
  slug:     props.initial.slug,
  title:    props.initial.title,
  template: props.initial.template,
  content:  props.initial.content,
})

// Map template → sub-form
const mapping = {
  about:   AboutForm,
  gallery: GalleryForm,
  contact: ContactForm,
}
const currentForm = computed(() => mapping[form.template] || DefaultForm)

// Emit the filled‐out page
function onSubmit() {
  emit('save', { ...form })
}
</script>
