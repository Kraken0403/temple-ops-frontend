<template>
    <footer class="bg-[#570000] text-white pt-16 pb-8">
      <div class="mx-auto px-4 max-w-[1190px]">
        <div class="flex flex-col lg:flex-row lg:justify-between gap-12">
          <!-- Logo & Blurb -->
          <div class="lg:w-1/4">
            <img src="@/assets/images/logo.png" alt="Sanatan Mandir Logo" class="h-24 object-contain mb-6" />
            <p class="mb-6">
              Lorem ipsum dolor sit amet<br />
              consectetur adipiscing elit aliquam
            </p>
            <div class="flex space-x-4 text-xl">
              <a href="#" aria-label="Facebook" class="hover:opacity-80">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Twitter" class="hover:opacity-80">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Instagram" class="hover:opacity-80">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="LinkedIn" class="hover:opacity-80">
                <i class="fab fa-linkedin-in"></i>
              </a>
              <a href="#" aria-label="YouTube" class="hover:opacity-80">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>
  
          <!-- Link columns -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
            <div>
              <h3 class="font-semibold mb-4">Product</h3>
              <ul class="space-y-2 text-sm">
                <li><NuxtLink to="/features" class="hover:underline">Features</NuxtLink></li>
                <li><NuxtLink to="/pricing" class="hover:underline">Pricing</NuxtLink></li>
                <li><NuxtLink to="/case-studies" class="hover:underline">Case studies</NuxtLink></li>
                <li><NuxtLink to="/reviews" class="hover:underline">Reviews</NuxtLink></li>
                <li><NuxtLink to="/updates" class="hover:underline">Updates</NuxtLink></li>
              </ul>
            </div>
  
            <div>
              <h3 class="font-semibold mb-4">Company</h3>
              <ul class="space-y-2 text-sm">
                <li><NuxtLink to="/about" class="hover:underline">About</NuxtLink></li>
                <li><NuxtLink to="/contact" class="hover:underline">Contact us</NuxtLink></li>
                <li><NuxtLink to="/careers" class="hover:underline">Careers</NuxtLink></li>
                <li><NuxtLink to="/culture" class="hover:underline">Culture</NuxtLink></li>
                <li><NuxtLink to="/blog" class="hover:underline">Blog</NuxtLink></li>
              </ul>
            </div>
  
            <div>
              <h3 class="font-semibold mb-4">Support</h3>
              <ul class="space-y-2 text-sm">
                <li><NuxtLink to="/getting-started" class="hover:underline">Getting started</NuxtLink></li>
                <li><NuxtLink to="/help-center" class="hover:underline">Help center</NuxtLink></li>
                <li><NuxtLink to="/server-status" class="hover:underline">Server status</NuxtLink></li>
                <li><NuxtLink to="/report-bug" class="hover:underline">Report a bug</NuxtLink></li>
                <li><NuxtLink to="/chat-support" class="hover:underline">Chat support</NuxtLink></li>
              </ul>
            </div>
  
            <div>
              <h3 class="font-semibold mb-4">Contacts us</h3>
              <ul class="space-y-4 text-sm">
                <li class="flex items-center">
                  <i class="material-icons mr-2">email</i>
                  <a href="mailto:contact@company.com" class="hover:underline">contact@company.com</a>
                </li>
                <li class="flex items-center">
                  <i class="material-icons mr-2">phone</i>
                  <a href="tel:+14146875892" class="hover:underline">(414) 687-5892</a>
                </li>
                <li class="flex items-start">
                  <i class="material-icons mr-2">location_on</i>
                  <div>
                    794 Mcallister St<br />
                    San Francisco, 94102
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
  
        <!-- Divider -->
        <div class="border-t border-white opacity-50 my-8"></div>
  
        <!-- Bottom copyright & policies -->
        <div class="flex flex-col md:flex-row justify-between text-sm text-white/80">
          <div class="mb-2 md:mb-0">
            © 2025 Sanatan Mandir
          </div>
          <div class="space-x-4">
            <NuxtLink to="/terms" class="hover:underline">Terms and Conditions</NuxtLink>
            <span>|</span>
            <NuxtLink to="/privacy" class="hover:underline">Privacy Policy</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  // No JS needed for static links—just import your footer-logo asset above
  </script>
  
  <style scoped>
  .material-icons {
    font-size: 20px;
    vertical-align: middle;
  }
  </style>
  