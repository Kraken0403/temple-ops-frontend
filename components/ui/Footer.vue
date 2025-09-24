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
                <a href="mailto:info@sanatantemple.org" class="hover:underline">info@sanatantemple.org</a>
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
          <NuxtLink to="/terms" class="hover:underline">Terms &amp; Conditions</NuxtLink>
          <span aria-hidden="true">|</span>
          <NuxtLink to="/privacy" class="hover:underline">Privacy Policy</NuxtLink>
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
