<!-- src/components/pages/blocks/RichTextBlock.vue -->
<template>
    <div>
      <editor-content :editor="editor" />
    </div>
  </template>
 <script setup>
 import { onBeforeUnmount, ref, watch } from 'vue'
 import { Editor } from '@tiptap/vue-3'

 import StarterKit from '@tiptap/starter-kit'
 
 const props = defineProps({ modelValue: String })
 const emit  = defineEmits(['update:modelValue'])
 
 const editor = new Editor({
   extensions: [ StarterKit ],
   content: props.modelValue || '',
   onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML())
 })
 
 watch(() => props.modelValue, v => {
   if (v !== editor.getHTML()) editor.commands.setContent(v || '')
 })
 
 onBeforeUnmount(() => editor.destroy())
 </script>
 