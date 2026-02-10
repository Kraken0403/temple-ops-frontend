export default defineNuxtPlugin(async () => {
  if (process.server) return
  if (window.paypal) return

  const config = useRuntimeConfig()

  // 🔑 Fetch settings BEFORE loading PayPal
  const { getSettings } = useSettingsService()
  const settings = await getSettings()

  const currencyCode = settings?.currency_code || 'USD'

  const script = document.createElement('script')
  script.src =
    `https://www.paypal.com/sdk/js` +
    `?client-id=${config.public.paypalClientId}` +
    `&currency=${currencyCode}` +
    `&components=buttons` +
    `&enable-funding=card`

  script.async = true
  script.defer = true

  document.body.appendChild(script)
})
