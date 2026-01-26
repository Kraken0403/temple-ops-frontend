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

    window.paypal
      .Buttons({
        fundingSource: window.paypal.FUNDING.PAYPAL, // 👈 single button only

        async createOrder() {
          console.log('[PayPal] createOrder called')

          const res = await fetch(`${PAYPAL_API}/payments/paypal/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: Number(props.amount),
              purpose: props.purpose,
              referenceId: Number(props.referenceId),
              currency: props.currency,
            }),
          })

          const raw = await res.text()
          console.log('[PayPal] create raw:', raw)

          if (!res.ok) throw new Error(raw || 'Create order failed')

          const data = JSON.parse(raw)
          if (!data.orderId) throw new Error('orderId missing from backend')

          console.log('[PayPal] orderId:', data.orderId)
          return data.orderId
        },

        async onApprove(data) {
          console.log('[PayPal] onApprove:', data)

          const res = await fetch(`${PAYPAL_API}/payments/paypal/capture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderID,
            }),
          })

          const raw = await res.text()
          console.log('[PayPal] capture raw:', raw)

          if (!res.ok) throw new Error(raw || 'Capture failed')

          const result = JSON.parse(raw)

          console.log('[PayPal] payment success:', result)
          emit('success', result)

          return result
        },

        onCancel() {
          console.log('[PayPal] payment cancelled')
          emit('cancel')
        },

        onError(err) {
          console.error('[PayPal] error:', err)
          emit('error', err)
        },
      })
      .render(btn.value)
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
