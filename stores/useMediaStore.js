// stores/useMediaStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Global media picker store
 * - Controls MediaModal open/close and options
 * - Returns a promise from open() that resolves with the user's selection
 *
 * Usage:
 *   const media = useMediaStore()
 *   const sel = await media.open({ multiple: false, accept: 'image/*' })
 *   // sel = asset object (single) or array of assets (multiple) or null on cancel
 */
export const useMediaStore = defineStore('media', () => {
  const isOpen   = ref(false)
  const multiple = ref(false)
  const accept   = ref('image/*')

  // optional: keep last choice for UX
  const lastSelection = ref(null)

  let resolver = null

  function open(opts = {}) {
    // apply options
    multiple.value = !!opts.multiple
    accept.value   = opts.accept || 'image/*'

    // reset state
    lastSelection.value = null
    isOpen.value = true

    // return a promise that resolves when user applies/cancels
    return new Promise((resolve) => { resolver = resolve })
  }

  function apply(selection) {
    lastSelection.value = selection || null
    isOpen.value = false
    if (resolver) { resolver(lastSelection.value); resolver = null }
  }

  function cancel() {
    isOpen.value = false
    if (resolver) { resolver(null); resolver = null }
  }

  // convenience helpers
  function pickOne(opts = {})  { return open({ ...opts, multiple: false }) }
  function pickMany(opts = {}) { return open({ ...opts, multiple: true }) }

  return {
    // state
    isOpen,
    multiple,
    accept,
    lastSelection,

    // actions
    open,
    apply,
    cancel,
    pickOne,
    pickMany,
  }
})
