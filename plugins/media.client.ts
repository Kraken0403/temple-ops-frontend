import { useMediaPickerStore } from '@/stores/mediaPicker'

export default defineNuxtPlugin(() => {
  const store = useMediaPickerStore()
  // console.debug('[media] plugin loaded')  // <- uncomment to verify in console
  return {
    provide: {
      media: {
        pick: (opts = {}) => store.pick(opts),   // Promise<asset | asset[]>
      },
    },
  }
})
