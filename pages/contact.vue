<template>
    <section class="w-full mx-auto">
      <!-- Page Hero -->
      <PageHero
        title="Contact Us"
        caption="We’d love to hear from you—please fill out the form below or find us at the address!"
        :imageUrl="heroBg"
      />
  
      <!-- Contact Form -->
      <section class="bg-white max-w-[992px] mx-auto rounded pt-16">
        <h2 class="text-[32px] font-bold mb-[40px] text-center">Send Us a Message</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block mb-1 font-medium">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full border rounded px-3 py-2"
              placeholder="Your name"
            />
          </div>
          <div>
            <label class="block mb-1 font-medium">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full border rounded px-3 py-2"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label class="block mb-1 font-medium">Message</label>
            <textarea
              v-model="form.message"
              rows="4"
              required
              class="w-full border rounded px-3 py-2"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            class="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Send Message
          </button>
        </form>
      </section>
  
      <!-- Info Columns -->
      <section class="py-16 bg-white mt-12">
        <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <!-- Address -->
          <div>
            <div class="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 text-blue-600">
              <!-- location-pin icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 2a9 9 0 00-9 9c0 2.532 1.331 4.747 3.342 6.049L12 22l5.658-4.951A8.999 8.999 0 0021 11a9 9 0 00-9-9z"/>
              </svg>
            </div>
            <h3 class="font-semibold mb-2">Address</h3>
            <p>123 Temple Rd.<br/>Sanatan City, ST 12345</p>
          </div>
  
          <!-- Hours -->
          <div>
            <div class="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 text-blue-600">
              <!-- clock icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="font-semibold mb-2">Hours</h3>
            <p>Mon – Fri: 9am – 6pm<br/>Sat – Sun: 10am – 4pm</p>
          </div>
  
          <!-- Contact Details -->
          <div>
            <div class="inline-flex items-center justify-center w-12 h-12 mx-auto mb-4 text-blue-600">
              <!-- mail icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.532 5.021a2 2 0 002.936 0L21 8m0 0v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
              </svg>
            </div>
            <h3 class="font-semibold mb-2">Get In Touch</h3>
            <p>Email: info@sanatantemple.org<br/>Phone: +91 98765 43210</p>
          </div>
        </div>
      </section>
  
      <!-- Google Map -->
      <section class="mt-8 mb-16">
        <div class="max-w-4xl mx-auto h-96 overflow-hidden rounded-lg">
          <iframe
            class="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!..."
            frameborder="0"
            allowfullscreen=""
            aria-hidden="false"
            tabindex="0"
          ></iframe>
        </div>
      </section>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import PageHero from '@/components/PageHero.vue'
  import heroBg    from '@/assets/images/sample-2.png'
  
  const form = ref({
    name:    '',
    email:   '',
    message: ''
  })
  
  async function submitForm() {
    const body = { ...form.value }
  
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Submission failed')
      alert('Message sent!')
      form.value = { name: '', email: '', message: '' }
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }
  </script>
  
  <style scoped>
  /* nothing additional */
  </style>
  