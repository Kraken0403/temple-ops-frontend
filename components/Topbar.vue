<template>
    <header class="flex items-center justify-start gap-[10px] bg-transparent px-[10px] h-[50px] m-[7px] rounded-[3px]">
      <!-- Hamburger toggle -->
      <button
        @click="$emit('toggle-sidebar')"
        class="p-2 focus:outline-none hover:bg-gray-200 rounded"
        aria-label="Toggle sidebar"
      >
        <!-- simple 3-bar icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
  
      <!-- Static title (or you could pass via prop if you like) -->
      <div class="text-[12px] font-semibold text-[#585858]">
        Temple Ops Admin
      </div>
  
      <!-- User profile icon -->
      
    </header>
  </template>
  
  <script setup>
  // Emits the toggle-sidebar event when the button is clicked
  const emit = defineEmits(['toggle-sidebar'])
  </script>
  
  <style scoped>
  /* you can scope additional styles here if you want */
  </style>
  