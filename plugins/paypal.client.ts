export default defineNuxtPlugin(() => {
    const script = document.createElement('script')
    script.src =
      'https://www.paypal.com/sdk/js?client-id=AfyJU3W9WaT8TbPhdIIK9yjOQF7PSGQfcCTGtx-WYsXrlVwpIB0_l00YGz9SF0FUFA1hY6PWt6PNlhk-&currency=USD'
    script.async = true
    document.body.appendChild(script)
  })
  