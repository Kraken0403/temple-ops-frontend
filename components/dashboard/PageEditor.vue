<template>
    <div class="space-y-4">
      <div>
        <label class="block font-medium mb-1">Slug</label>
        <input v-model="form.slug" class="w-full border p-2 rounded" />
      </div>
      <div>
        <label class="block font-medium mb-1">Title</label>
        <input v-model="form.title" class="w-full border p-2 rounded" />
      </div>
  
      <div>
        <label class="block font-medium mb-1">Blocks</label>
        <div class="space-y-2">
          <div v-for="(blk, i) in form.blocks" :key="i" class="p-2 border rounded">
            <select v-model="blk.type" class="border p-1 rounded mb-1">
              <option value="paragraph">Paragraph</option>
              <option value="image">Image</option>
            </select>
  
            <div v-if="blk.type==='paragraph'">
              <textarea v-model="blk.data.text" class="w-full border p-1 rounded" rows="3" />
            </div>
            <div v-else>
              <input v-model="blk.data.url" placeholder="Image URL" class="w-full border p-1 rounded mb-1" />
              <input v-model="blk.data.alt" placeholder="Alt text" class="w-full border p-1 rounded" />
            </div>
  
            <button @click="removeBlock(i)" class="text-red-600 text-sm mt-1">Remove Block</button>
          </div>
        </div>
  
        <div class="mt-2 space-x-2">
          <button @click="addBlock('paragraph')" class="btn-sm">+ Para</button>
          <button @click="addBlock('image')"     class="btn-sm">+ Image</button>
        </div>
      </div>
  
      <div class="flex justify-end space-x-2">
        <button @click="$emit('cancel')" class="btn-sm">Cancel</button>
        <button @click="save" :disabled="saving" class="btn-primary">
          {{ saving ? 'Saving…' : 'Save Page' }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, toRefs, onMounted } from 'vue'
  import { usePageService } from '@/composables/usePageService'
  
  const props = defineProps({
    pageId: { type: [String, Number], default: null }
  })
  const emit = defineEmits(['saved','cancel'])
  
  const { getPageById, createPage, updatePage } = usePageService()
  const saving = ref(false)
  
  const form = reactive({
    slug:   '',
    title:  '',
    blocks: []
  })
  
  onMounted(async () => {
    if (props.pageId) {
      const p = await getPageById(props.pageId)
      form.slug   = p.slug
      form.title  = p.title
      form.blocks = p.blocks.map(b=>({
        type: b.type,
        data: {...b.data}
      }))
    }
  })
  
  function addBlock(type) {
    form.blocks.push({
      type,
      data: type==='paragraph'
        ? { text: '' }
        : { url:'', alt:'' }
    })
  }
  function removeBlock(i) {
    form.blocks.splice(i,1)
  }
  
  async function save() {
    saving.value = true
    try {
      let res
      if (props.pageId) {
        res = await updatePage(props.pageId, form)
      } else {
        res = await createPage(form)
      }
      emit('saved', res.id)
    } finally {
      saving.value = false
    }
  }
  </script>
  
  <style scoped>
  .btn-primary { background:white; color:#570000; padding:.5rem 1rem; border-radius:.375rem; }
  .btn-sm      { background:#f0f0f0; padding:.25rem .5rem; border-radius:.25rem; }
  </style>
  