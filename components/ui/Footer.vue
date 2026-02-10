<template>
  <footer class="bg-[#570000] text-white pt-16 pb-8">
    <div class="mx-auto px-4 max-w-[1190px]">
      <div class="flex flex-col lg:flex-row lg:justify-between gap-12">
        <!-- Logo & About -->
        <div class="lg:w-1/3">
          <img src="@/assets/images/logo.png" alt="Sanatan Mandir Logo" class="h-24 object-contain mb-6" />
          <p class="mb-6 leading-relaxed">
            Sanatan Mandir Tampa is a Hindu temple serving the Tampa Bay community with
            daily worship, festivals, and spiritual services.
          </p>

          <!-- Socials -->
          <div class="flex items-center gap-4 text-xl">
            <!-- Facebook -->
            <a
              href="https://www.facebook.com/159711827452044"
              target="_blank" rel="noopener"
              aria-label="Facebook" title="Facebook"
              class="hover:opacity-80"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.675 0h-21.35C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24h11.49v-9.294H9.691V11.03h3.125V8.41c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.676h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
              </svg>
            </a>

            <!-- Instagram -->
            <a
              href="https://www.instagram.com/sanatanmandirtampa"
              target="_blank" rel="noopener"
              aria-label="Instagram" title="Instagram"
              class="hover:opacity-80"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.325.975.975 1.262 2.242 1.324 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.324 3.608-.975.975-2.242 1.262-3.608 1.324-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.324-.975-.975-1.262-2.242-1.324-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.324-3.608.975-.975 2.242-1.262 3.608-1.324C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.773.13 4.645.428 3.678 1.395 2.711 2.362 2.413 3.49 2.355 4.769 2.297 6.049 2.283 6.458 2.283 9.717v4.566c0 3.259.014 3.668.072 4.948.058 1.279.356 2.407 1.323 3.374.967.967 2.095 1.265 3.374 1.323 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c1.279-.058 2.407-.356 3.374-1.323.967-.967 1.265-2.095 1.323-3.374.058-1.28.072-1.689.072-4.948V9.717c0-3.259-.014-3.668-.072-4.948-.058-1.279-.356-2.407-1.323-3.374C19.355.428 18.227.13 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0-2.879 1.44 1.44 0 0 0 0 2.879z"/>
              </svg>
            </a>

            <!-- YouTube -->
            <a
              href="https://www.youtube.com/user/sanatanmandir"
              target="_blank" rel="noopener"
              aria-label="YouTube" title="YouTube"
              class="hover:opacity-80"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a2.966 2.966 0 0 0-2.088-2.1C19.691 3.5 12 3.5 12 3.5s-7.691 0-9.41.586a2.966 2.966 0 0 0-2.088 2.1A31.533 31.533 0 0 0 .5 12a31.533 31.533 0 0 0 .002 5.814 2.966 2.966 0 0 0 2.088 2.1C4.309 20.5 12 20.5 12 20.5s7.691 0 9.41-.586a2.966 2.966 0 0 0 2.088-2.1A31.533 31.533 0 0 0 23.5 12a31.533 31.533 0 0 0-.002-5.814zM9.75 15.568V8.432L15.5 12l-5.75 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Link columns (only existing site pages) -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
          <div>
            <h3 class="font-semibold mb-4">Explore</h3>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/" class="hover:underline">Home</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:underline">About Us</NuxtLink></li>
              <li><NuxtLink to="/gallery" class="hover:underline">Gallery</NuxtLink></li>
              <li><NuxtLink to="/priests" class="hover:underline">Priests</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:underline">Contact Us</NuxtLink></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">Participate</h3>
            <ul class="space-y-2 text-sm">
              <li><NuxtLink to="/services" class="hover:underline">Services</NuxtLink></li>
              <li><NuxtLink to="/events" class="hover:underline">Events</NuxtLink></li>
              <li><NuxtLink to="/sponsorships" class="hover:underline">Sponsorships</NuxtLink></li>
              <li><NuxtLink to="/donations" class="hover:underline">Donations</NuxtLink></li>
              <li><NuxtLink to="/bhajans" class="hover:underline">Bhajans</NuxtLink></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">Contact</h3>
            <ul class="space-y-4 text-sm">
              <li class="flex items-center">
                <i class="material-icons mr-2">email</i>
                <a href="mailto:info@sanatantemple.org" class="hover:underline">info@sanatanmandirtampa.org</a>
              </li>
              <li class="flex items-center">
                <i class="material-icons mr-2">phone</i>
                <a href="tel:+18132214482" class="hover:underline">+1 813 221 4482</a>
              </li>
              <!-- If/when you want to add address, drop it here with 'location_on' icon -->
            </ul>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-white opacity-50 my-8"></div>

      <!-- Bottom copyright & policies -->
      <div class="flex flex-col md:flex-row justify-between text-sm text-white/80">
        <div class="mb-2 md:mb-0">
          © {{ new Date().getFullYear() }} Sanatan Mandir, Tampa
        </div>
        <div class="space-x-4">
          <NuxtLink to="/terms-and-conditions" class="hover:underline">Terms &amp; Conditions</NuxtLink>
          <span aria-hidden="true">|</span>
          <NuxtLink to="/privacy-policy" class="hover:underline">Privacy Policy</NuxtLink>
        </div>

        <div class="logos">
          <ul class="flex gap-[10px]" role="list"><li class="list-payment__item">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-visa"><title id="pi-visa">Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"></path></svg>
            </li>
            <li class="list-payment__item">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-master"><title id="pi-master">Mastercard</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><circle fill="#EB001B" cx="15" cy="12" r="7"></circle><circle fill="#F79E1B" cx="23" cy="12" r="7"></circle><path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"></path></svg>
            </li>
            <li class="list-payment__item">
              <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="pi-american_express" viewBox="0 0 38 24" width="38" height="24"><title id="pi-american_express">American Express</title><path fill="#000" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z" opacity=".07"></path><path fill="#006FCF" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32Z"></path><path fill="#FFF" d="M22.012 19.936v-8.421L37 11.528v2.326l-1.732 1.852L37 17.573v2.375h-2.766l-1.47-1.622-1.46 1.628-9.292-.02Z"></path><path fill="#006FCF" d="M23.013 19.012v-6.57h5.572v1.513h-3.768v1.028h3.678v1.488h-3.678v1.01h3.768v1.531h-5.572Z"></path><path fill="#006FCF" d="m28.557 19.012 3.083-3.289-3.083-3.282h2.386l1.884 2.083 1.89-2.082H37v.051l-3.017 3.23L37 18.92v.093h-2.307l-1.917-2.103-1.898 2.104h-2.321Z"></path><path fill="#FFF" d="M22.71 4.04h3.614l1.269 2.881V4.04h4.46l.77 2.159.771-2.159H37v8.421H19l3.71-8.421Z"></path><path fill="#006FCF" d="m23.395 4.955-2.916 6.566h2l.55-1.315h2.98l.55 1.315h2.05l-2.904-6.566h-2.31Zm.25 3.777.875-2.09.873 2.09h-1.748Z"></path><path fill="#006FCF" d="M28.581 11.52V4.953l2.811.01L32.84 9l1.456-4.046H37v6.565l-1.74.016v-4.51l-1.644 4.494h-1.59L30.35 7.01v4.51h-1.768Z"></path></svg>
            </li>
            <li class="list-payment__item">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" width="38" height="24" role="img" aria-labelledby="pi-paypal"><title id="pi-paypal">PayPal</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path fill="#003087" d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"></path><path fill="#3086C8" d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"></path><path fill="#012169" d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"></path></svg>
            </li>
           </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// purely presentational
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
