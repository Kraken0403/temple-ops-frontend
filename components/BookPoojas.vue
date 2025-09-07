<template>
  <section class="relative py-[100px] bg-[#F8F9FA] overflow-hidden w-full mx-auto">
    <!-- Decorative background SVG -->
    <div class="absolute inset-0 flex justify-center pointer-events-none">
      <img
        :src="bg"
        alt=""
        class="opacity-100 max-w-4xl w-full object-contain h-full"
      />
    </div>

    <div class="relative z-10 mx-auto px-4 max-w-[1190px]">
      <h2 class="text-[32px] font-bold text-center mb-[15px]">Book Pujas</h2>
      <span class="w-[35px] h-[2px] rounded block bg-[#570000] mx-auto mb-[50px]"></span>

      <div v-if="error" class="text-center text-red-600 mb-6">
        Error loading poojas.
      </div>
      <div v-else-if="!poojas.length" class="text-center text-gray-500 mb-6">
        No poojas found.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          v-for="p in poojas"
          :key="p.id"
          :to="`/services/${p.id}`"
          class="flex bg-white justify-between border-[1px] border-[#8c8c8c] rounded-[12px] p-6 shadow hover:shadow-md transition hover:bg-amber-50"
        >
        <div class="flex-col w-full">
          <h3 class="text-[20px] font-semibold mb-[30px]">{{ p.name }}</h3>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-[15px]">
              <div class="flex gap-[5px] items-center text-[#8c8c8c] font-semibold">
                <i class="material-icons mr-1 text-[#570000]">temple_hindu</i>
                <span>
                  <span v-if="p.isInVenue">In-Temple</span>
                  <span v-if="p.isInVenue && p.isOutsideVenue"> / </span>
                  <span v-if="p.isOutsideVenue">Custom Venue</span>
                </span>
              </div>

              <div class="flex items-center text-[#8c8c8c] font-semibold">
                <i class="material-icons mr-1 text-[#570000]">schedule</i>
                <span>Duration: {{ formatDuration(p.durationMin) }}</span>
              </div>
            </div>
            
            <div class="arrow bg-[#570000] rounded-full flex items-center p-[5px]">
              <span class="material-icons text-2xl text-[#fff]">arrow_forward</span>
            </div>

          </div>
          
        </div>

        </NuxtLink>
      </div>

      <NuxtLink
      to="/services"
      class="
        bg-[#570000]
        border-2 border-[#570000]
        text-white
        px-[40px] py-[12px]
        rounded-[30px]
        mx-auto block w-fit mt-[50px]
        text-[16px]
        transition-colors duration-200
        hover:bg-transparent hover:text-[#570000]
      "
    >
      View All
    </NuxtLink>

    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { usePoojaService } from '@/composables/usePoojaService'
  import bg from '@/assets/images/bg-pooja.png'

  const poojas = ref([])
  const error = ref(false)
  const { fetchPoojas } = usePoojaService()

  onMounted(async () => {
    try {
      poojas.value = await fetchPoojas()
    } catch (e) {
      console.error(e)
      error.value = true
    }
  })

  function formatDuration(minutes) {
    if (minutes % 60 === 0) {
      const h = minutes / 60
      return `${h} hour${h > 1 ? 's' : ''}`
    }
    return `${minutes} min`
  }
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
