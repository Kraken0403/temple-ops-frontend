<template>
    <section class="py-[100px] bg-[#F5f5f5] w-full mx-auto">
      <div class="mx-auto px-4 max-w-[1190px]">
        <!-- Heading + View All -->
        <div class="flex justify-between items-center mb-[50px]">
          <h2 class="text-[32px] font-bold">Our Events</h2>
          <NuxtLink
            to="/events"
            class="
              bg-[#570000] text-white
              px-[30px] py-[10px]
              rounded-[30px]
              text-sm font-semibold uppercase
              hover:bg-opacity-90
            "
          >
            View All
          </NuxtLink>
        </div>
  
        <!-- Swiper carousel -->
        <Swiper
          :slides-per-view="1"
          :space-between="20"
          :breakpoints="{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }"
          class="pb-4"
        >
          <SwiperSlide v-for="evt in events" :key="evt.id">
            <!-- Card -->
            <div class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col">
              <!-- Image -->
         
            <template v-if="evt.featuredMedia?.url">
              <img
                :src="fullImageUrl(evt.featuredMedia.url)"
                :alt="evt.name"
                class="w-full h-48 object-cover"
              />
            </template>
            <div
              v-else
              class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400"
            >
              No Image
            </div>
  
              <!-- Content -->
              <div class="p-4 flex-1 flex flex-col">
                <!-- Title -->
                <h3 class="text-[20px] font-semibold mb-4">{{ evt.name }}</h3>
  
                <!-- Detail grid -->
                <div class="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mb-4">
                  <div class="flex items-center gap-2">
                    <i class="material-icons text-[#570000]">temple_hindu</i>
                    <span>{{ evt.isInTemple ? 'In-Temple' : 'Custom Venue' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="material-icons text-[#570000]">schedule</i>
                    <span>{{ formatTime(evt.startTime) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="material-icons text-[#570000]">calendar_today</i>
                    <span>{{ formatDate(evt.date) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="material-icons text-[#570000]">location_on</i>
                    <span>{{ evt.venue }}</span>
                  </div>
                </div>
  
                <!-- Notes -->
                <p class="text-sm text-gray-700 flex-1">
                  {{ evt.notes }}
                </p>
  
                <!-- Attend button -->
                <NuxtLink
                  :to="`/events/${evt.id}`"
                  class="mt-4 self-end bg-[#004B21] text-white px-6 py-2 rounded-[30px] text-sm font-medium hover:bg-green-700"
                >
                  Attend
                </NuxtLink>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
  
        <div v-if="error" class="text-red-600 mt-4 text-center">
          Error loading events.
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import 'swiper/css'
  import { useEventsService } from '@/composables/useEventsService'
  import { useRuntimeConfig } from '#app'
  
  const events = ref([])
  const error = ref(false)
  const { fetchEvents } = useEventsService()
  const config = useRuntimeConfig().public
  
  function fullImageUrl(path) {
    if (!path) return ''
    return String(path).startsWith('http') ? path : `${config.apiBase}${path}`
  }

  
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
  
  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }
  
  onMounted(async () => {
    try {
      events.value = await fetchEvents()
    } catch (e) {
      console.error(e)
      error.value = true
    }
  })
  </script>
  
  <style scoped>
  .material-icons {
    font-size: 20px;
    vertical-align: middle;
  }
  </style>
  