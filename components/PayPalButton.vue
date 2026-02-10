<template>
  <div class="paypal-button-wrapper">
    <div ref="btn"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#app'

/* =========================
   PROPS
========================= */
const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: true, // EVENT | SERVICES | DONATION | SPONSORSHIP
  },
  currency: {
    type: String,
    default: 'USD',
  },
})

/* =========================
   EMITS
========================= */
const emit = defineEmits(['success', 'cancel', 'error'])

/* =========================
   REFS & STATE
========================= */
const btn = ref(null)
const rendered = ref(false)
let waitTimer = null

const config = useRuntimeConfig()
const PAYPAL_API = config.public.apiBase || config.apiBase

/* =========================
   PAYPAL INIT
========================= */
onMounted(() => {
  waitTimer = setInterval(() => {
    if (!window.paypal || !btn.value || rendered.value) return

    rendered.value = true
    clearInterval(waitTimer)

    console.log('[PayPal] Initializing button')
    console.log('[PayPal] Backend:', PAYPAL_API)

    window.paypal.Buttons({
  // ❌ do NOT force fundingSource here

    async createOrder(data, actions) {
      console.group('[PayPal] createOrder')
      console.log('amount:', props.amount)
      console.log('currency:', props.currency)
      console.log('purpose:', props.purpose)
      console.log('referenceId:', props.referenceId)

      const payload = {
        amount: Number(props.amount).toFixed(2),
        currency: props.currency,
        purpose: props.purpose,
        referenceId: Number(props.referenceId),
      }

      console.log('payload → backend:', payload)

      const res = await fetch(`${PAYPAL_API}/payments/paypal/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const raw = await res.text()
      console.log('raw backend response:', raw)

      if (!res.ok) {
        console.error('Create order failed')
        throw new Error(raw || 'Create order failed')
      }

      let dataJson
      try {
        dataJson = JSON.parse(raw)
      } catch (e) {
        console.error('JSON parse failed')
        throw new Error('Invalid JSON from backend')
      }

      console.log('parsed response:', dataJson)

      if (!dataJson.orderId) {
        console.error('orderId missing!')
        throw new Error('orderId missing from backend')
      }

      console.log('✅ returning PayPal orderId:', dataJson.orderId)
      console.groupEnd()

      return dataJson.orderId
    },

    async onApprove(data) {
      console.group('[PayPal] onApprove')
      console.log('data:', data)

      if (!data.orderID) {
        console.error('orderID missing in onApprove')
        throw new Error('orderID missing')
      }

      const res = await fetch(`${PAYPAL_API}/payments/paypal/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      })

      const raw = await res.text()
      console.log('capture raw:', raw)

      if (!res.ok) {
        console.error('Capture failed')
        throw new Error(raw || 'Capture failed')
      }

      const result = JSON.parse(raw)
      console.log('✅ payment captured:', result)
      console.groupEnd()

      emit('success', result)
      return result
    },

    onCancel() {
      console.warn('[PayPal] payment cancelled')
      emit('cancel')
    },

    onError(err) {
      console.error('[PayPal] SDK error:', err)
      emit('error', err)
    },
  }).render(btn.value)

  }, 200)
})

/* =========================
   CLEANUP
========================= */
onBeforeUnmount(() => {
  if (waitTimer) clearInterval(waitTimer)
})
</script>

<style scoped>
.paypal-button-wrapper {
  width: 100%;
}
</style>
