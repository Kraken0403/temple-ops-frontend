<template>
  <header class="w-full">
    <!-- Top Bar -->
    <div class="bg-black text-white flex justify-between items-center px-[80px] py-2 text-sm">
      <div class="flex space-x-4">
        <a href="tel:+18132214482" class="hover:underline">+1 813 221 4482</a>
        <a href="mailto:info@sanatantemple.org" class="hover:underline">info@sanatantemple.org</a>
      </div>

      <!-- Right cluster: socials (always) + auth -->
      <div class="flex items-center space-x-4">
        <!-- Socials (inline SVGs, inherit currentColor) -->
        <div class="flex items-center gap-5">
          <!-- Facebook -->
          <a
            href="https://www.facebook.com/159711827452044"
            target="_blank" rel="noopener"
            aria-label="Facebook" title="Facebook"
            class="hover:text-amber-300 flex items-center"
          >
            <svg
              class="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M22.675 0h-21.35C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24h11.49v-9.294H9.691V11.03h3.125V8.41c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.676h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
            </svg>
          </a>

          <!-- Instagram -->
          <a
            href="https://www.instagram.com/sanatanmandirtampa"
            target="_blank" rel="noopener"
            aria-label="Instagram" title="Instagram"
            class="hover:text-amber-300 flex items-center"
          >
            <svg
              class="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <!-- rounded square -->
              <rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect>
              <!-- camera lens -->
              <circle cx="12" cy="12" r="4"></circle>
              <!-- small top-right dot -->
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"></circle>
            </svg>
          </a>


          <!-- YouTube -->
          <a
            href="https://www.youtube.com/user/sanatanmandir"
            target="_blank" rel="noopener"
            aria-label="YouTube" title="YouTube"
            class="hover:text-amber-300 flex items-center"
          >
            <svg
              class="w-[18px] h-[18px]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23.498 6.186a2.966 2.966 0 0 0-2.088-2.1C19.691 3.5 12 3.5 12 3.5s-7.691 0-9.41.586a2.966 2.966 0 0 0-2.088 2.1A31.533 31.533 0 0 0 .5 12a31.533 31.533 0 0 0 .002 5.814 2.966 2.966 0 0 0 2.088 2.1C4.309 20.5 12 20.5 12 20.5s7.691 0 9.41-.586a2.966 2.966 0 0 0 2.088-2.1A31.533 31.533 0 0 0 23.5 12a31.533 31.533 0 0 0-.002-5.814zM9.75 15.568V8.432L15.5 12l-5.75 3.568z"/>
            </svg>
          </a>
        </div>

        <!-- Auth -->
        <NuxtLink
          v-if="!isLoggedIn"
          to="/login"
          class="hover:underline"
        >
          Sign In
        </NuxtLink>
        <NuxtLink
          v-else
          to="/admin/bookings"
          class="hover:underline"
          title="Go to Admin"
        >
          Hello {{ displayName }}
        </NuxtLink>
      </div>
    </div>

    <!-- Main Navbar -->
    <nav class="bg-[#f5f5f5] px-[80px] py-3 shadow-sm relative">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center">
          <img src="@/assets/images/logo.png" alt="Sanatan Mandir Logo" class="h-22 w-auto" />
        </NuxtLink>

        <!-- Desktop Nav Links -->
        <ul class="hidden lg:flex space-x-8 font-semibold text-black uppercase text-sm">
          <li><NuxtLink to="/" exact-active-class="text-green-800">Home</NuxtLink></li>
          <li><NuxtLink to="/services" active-class="text-green-800">Services</NuxtLink></li>
          <li><NuxtLink to="/gallery" active-class="text-green-800">Gallery</NuxtLink></li>
          <li><NuxtLink to="/priests" active-class="text-green-800">Priests</NuxtLink></li>
          <li><NuxtLink to="/events" active-class="text-green-800">Events</NuxtLink></li>
          <li><NuxtLink to="/sponsorships" active-class="text-green-800">Sponsorships</NuxtLink></li>
          <li><NuxtLink to="/donations" active-class="text-green-800">Donations</NuxtLink></li>
          <li><NuxtLink to="/about" active-class="text-green-800">About Us</NuxtLink></li>
        </ul>

        <!-- Book Pooja Button -->
        <NuxtLink
          to="/services"
          class="hidden lg:inline-block bg-green-800 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-900 transition"
        >
          Book Pooja
        </NuxtLink>

        <!-- Hamburger Menu Button -->
        <button @click="isOpen = !isOpen" class="lg:hidden focus:outline-none">
          <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="!isOpen" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="isOpen"
        class="lg:hidden mt-4 flex flex-col space-y-3 text-sm font-semibold uppercase text-black"
      >
        <NuxtLink to="/" exact-active-class="text-green-800 underline" @click="isOpen = false">Home</NuxtLink>
        <NuxtLink to="/services" @click="isOpen = false">Services</NuxtLink>
        <NuxtLink to="/events" @click="isOpen = false">Events</NuxtLink>
        <NuxtLink to="/donations" @click="isOpen = false">Donations</NuxtLink>
        <NuxtLink to="/about" @click="isOpen = false">About Us</NuxtLink>

        <!-- Auth (mobile) -->
        <NuxtLink
          v-if="isLoggedIn"
          to="/admin/bookings"
          class="underline"
          @click="isOpen = false"
        >
          Hello {{ displayName }}
        </NuxtLink>
        <NuxtLink
          v-else
          to="/login"
          class="underline"
          @click="isOpen = false"
        >
          Sign In
        </NuxtLink>

        <NuxtLink
          to="/services"
          class="mt-2 bg-green-800 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-900 transition w-fit"
          @click="isOpen = false"
        >
          Book Pooja
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

const isOpen = ref(false)

const auth = useAuth()
const isLoggedIn = computed(() => !!auth.user.value)
const displayName = computed(() => {
  const u = auth.user.value
  if (!u) return ''
  return (u.name?.split(' ')[0]) || u.username || (u.email ? u.email.split('@')[0] : 'User')
})
</script>
