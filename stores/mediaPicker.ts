// stores/mediaPicker.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

type Selection = any | any[] | null

export const useMediaPickerStore = defineStore('mediaPicker', () => {
  const isOpen = ref(false)
  const multiple = ref(false)
  const accept = ref('image/*')

  let _resolver: ((v: Selection) => void) | null = null

  function open(opts?: { multiple?: boolean; accept?: string }) {
    multiple.value = !!opts?.multiple
    accept.value = opts?.accept || 'image/*'
    isOpen.value = true
    return new Promise<Selection>((resolve) => { _resolver = resolve })
  }

  function apply(selection: Selection) {
    isOpen.value = false
    _resolver?.(selection)
    _resolver = null
  }

  function cancel() {
    isOpen.value = false
    _resolver?.(null)
    _resolver = null
  }

  return { isOpen, multiple, accept, open, apply, cancel }
})
