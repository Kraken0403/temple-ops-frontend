<template>
    <div class="main-default">
      <Navbar />
      <main >
        <NuxtPage/>
      </main>
      <Footer />
    </div>
  </template>

  
<script setup>
  import Navbar from '@/components/ui/Navbar.vue'
  import Footer from '@/components/ui/Footer.vue'
</script>
  <!-- <style scoped src="../assets/css/global.scss"></style> -->
  