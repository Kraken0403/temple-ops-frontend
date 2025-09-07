import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMediaPickerStore = defineStore('mediaPicker', () => {
  const isOpen = ref(false)
  const multiple = ref(false)
  const accept = ref('image/*')
  const resolveFn = ref(null)
  const rejectFn = ref(null)

  function pick(opts = {}) {
    multiple.value = !!opts.multiple
    accept.value = opts.accept || 'image/*'
    isOpen.value = true
    return new Promise((resolve, reject) => {
      resolveFn.value = resolve
      rejectFn.value = reject
    })
  }
  function apply(selection) {
    resolveFn.value?.(selection)
    cleanup()
  }
  function cancel() {
    rejectFn.value?.(new Error('cancelled'))
    cleanup()
  }
  function close() { cleanup() }
  function cleanup() {
    isOpen.value = false
    resolveFn.value = null
    rejectFn.value = null
  }

  return { isOpen, multiple, accept, pick, apply, cancel, close }
})
