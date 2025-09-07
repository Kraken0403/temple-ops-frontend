<template>
    <header class="w-full">
      <!-- Top Bar -->
      <div class="bg-black text-white flex justify-between items-center px-[80px] py-2 text-sm ">
        <div class="flex space-x-4">
          <span>+1 813 221 4482</span>
          <span>info@sanatantemple.org</span>
        </div>
        <div class="flex items-center space-x-4">
          <a href="#" aria-label="Facebook">
            <i class="uil uil-facebook-f text-lg"></i>
          </a>
          <a href="#" aria-label="Instagram">
            <i class="uil uil-instagram text-lg"></i>
          </a>
          <NuxtLink to="/login" class="hover:underline">Sign In</NuxtLink>
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
            <!-- <li><NuxtLink to="/sponsors" active-class="text-green-800">Sponsors</NuxtLink></li> -->
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
          <!-- <NuxtLink to="/sponsors" @click="isOpen = false">Sponsors</NuxtLink> -->
          <NuxtLink to="/donations" @click="isOpen = false">Donations</NuxtLink>
          <NuxtLink to="/about" @click="isOpen = false">About Us</NuxtLink>
          <NuxtLink
            to="/book"
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
  import { ref } from 'vue'
  const isOpen = ref(false)
  </script>
  