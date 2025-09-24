<template>
    <div class="pdf-wrap p-3">
      <div class="mb-3 flex items-center gap-2">
        <button class="border rounded px-2 py-1" @click="prevPage">Prev</button>
        <span class="text-sm text-gray-600">Page {{ pageNum }} / {{ numPages || '…' }}</span>
        <button class="border rounded px-2 py-1" @click="nextPage">Next</button>
        <button class="border rounded px-2 py-1" @click="zoomOut">-</button>
        <button class="border rounded px-2 py-1" @click="zoomIn">+</button>
        <button class="border rounded px-2 py-1" @click="fitWidth">Fit width</button>
      </div>
      <canvas ref="canvas" class="w-full block" />
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue'
  
  const props = defineProps({ src: { type: String, required: true } })
  
  let pdfjs = null
  let pdfDoc = null
  const pageNum = ref(1)
  const numPages = ref(null)
  const scale = ref(1.2)
  const canvas = ref(null)
  let rendering = false
  let resizeObserver
  
  async function loadPdf() {
    // ESM entry + worker URL for Vite
    const [{ getDocument, GlobalWorkerOptions }, workerUrlMod] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.mjs?url'),
    ])
  
    pdfjs = { getDocument, GlobalWorkerOptions }
    const workerUrl = workerUrlMod?.default || workerUrlMod
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  
    // (re)load
    if (pdfDoc) try { await pdfDoc.destroy?.() } catch {}
    const loadingTask = pdfjs.getDocument(props.src)
    pdfDoc = await loadingTask.promise
    numPages.value = pdfDoc.numPages
    pageNum.value = 1
    await nextTick()
    renderPage()
  }
  
  async function renderPage() {
    if (!pdfDoc || rendering) return
    rendering = true
    try {
      const page = await pdfDoc.getPage(pageNum.value)
      const viewport = page.getViewport({ scale: scale.value })
      const ctx = canvas.value.getContext('2d')
      canvas.value.height = viewport.height
      canvas.value.width = viewport.width
      await page.render({ canvasContext: ctx, viewport }).promise
    } finally {
      rendering = false
    }
  }
  
  function prevPage() { if (pageNum.value > 1) { pageNum.value--; renderPage() } }
  function nextPage() { if (numPages.value && pageNum.value < numPages.value) { pageNum.value++; renderPage() } }
  function zoomIn()  { scale.value = Math.min(4, scale.value + 0.2); renderPage() }
  function zoomOut() { scale.value = Math.max(0.5, scale.value - 0.2); renderPage() }
  function fitWidth() {
    if (!pdfDoc || !canvas.value) return
    const w = canvas.value.parentElement.clientWidth
    // approximate fit-to-width based on current canvas width
    scale.value = (w / canvas.value.width) * scale.value
    renderPage()
  }
  
  watch(() => props.src, () => { pageNum.value = 1; loadPdf() })
  
  onMounted(() => {
    loadPdf()
    // responsive re-render
    if (window && window.ResizeObserver && canvas.value?.parentElement) {
      resizeObserver = new ResizeObserver(() => fitWidth())
      resizeObserver.observe(canvas.value.parentElement)
    } else {
      window.addEventListener('resize', fitWidth)
    }
  })
  onBeforeUnmount(() => {
    if (resizeObserver && canvas.value?.parentElement) resizeObserver.unobserve(canvas.value.parentElement)
    window.removeEventListener?.('resize', fitWidth)
  })
  </script>
  