<template>
    <section class="p-6 max-w-full mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Sponsorship Bookings</h1>
        <div class="flex gap-3">
          <select v-model="selectedEvent" class="border px-3 py-2 rounded">
            <option value="">All Events</option>
            <option v-for="event in eventOptions" :key="event" :value="event">
              {{ event }}
            </option>
          </select>
          <button
            @click="downloadCSV"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>
  
      <div v-if="loading" class="text-gray-500">Loading bookings...</div>
      <div v-else-if="error" class="text-red-600">Failed to load bookings.</div>
  
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full text-sm text-gray-700">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
                <th class="px-4 py-3 text-left">Sponsor Name</th>
                <th class="px-4 py-3 text-left">Email</th>
                <th class="px-4 py-3 text-left">Phone</th>
                <th class="px-4 py-3 text-left">Sponsorship</th>
                <th class="px-4 py-3 text-left">Event</th>
                <th class="px-4 py-3 text-left">Price</th>
                <th class="px-4 py-3 text-left">Booked At</th>
                <th class="px-4 py-3 text-left">Actions</th>
            </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(booking, i) in paginatedBookings"

                    :key="i"
                    class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                    >
                <td class="px-4 py-3">{{ booking.sponsorName }}</td>
                <td class="px-4 py-3">{{ booking.sponsorEmail }}</td>
                <td class="px-4 py-3">{{ booking.sponsorPhone }}</td>
                <td class="px-4 py-3">{{ booking.eventSponsorship.sponsorshipType.name }}</td>
                <td class="px-4 py-3">{{ booking.eventSponsorship.event.name }}</td>
                <td class="px-4 py-3">₹{{ booking.eventSponsorship.price }}</td>
                <td class="px-4 py-3">{{ formatDate(booking.bookedAt) }}</td>
                <td class="px-4 py-3 flex gap-2">
                <button class="text-blue-500 hover:underline text-xs" @click="editBooking(booking)">Edit</button>
                <button class="text-red-500 hover:underline text-xs" @click="deleteBooking(booking.id)">Delete</button>
                </td>
            </tr>
            </tbody>
        </table>
        <div class="flex justify-between items-center p-4 border-t bg-gray-50 text-sm text-gray-600">
            <div>
                Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex gap-2">
                <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                Prev
                </button>
                <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                Next
                </button>
            </div>
            </div>
        </div>

    </section>
  </template>
  
  <script setup>
    definePageMeta({ layout: 'admin', middleware: 'auth' })

    import { ref, onMounted, computed } from 'vue'
    import { useSponsorshipService } from '@/composables/useSponsorshipService'
    
    const { getAllSponsorshipBookings } = useSponsorshipService()
    const bookings = ref([])
    const loading = ref(true)
    const error = ref(false)
    const selectedEvent = ref('')

    const currentPage = ref(1)
    const itemsPerPage = 15

    const paginatedBookings = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredBookings.value.slice(start, end)
    })

    const totalPages = computed(() =>
    Math.ceil(filteredBookings.value.length / itemsPerPage)
    )

    function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
    }
    
    onMounted(async () => {
        try {
        bookings.value = await getAllSponsorshipBookings()
        } catch (err) {
        console.error(err)
        error.value = true
        } finally {
        loading.value = false
        }
    })
    
    const eventOptions = computed(() => [
        ...new Set(bookings.value.map(b => b.eventSponsorship?.event?.name).filter(Boolean))
    ])
    
    const filteredBookings = computed(() => {
        if (!selectedEvent.value) return bookings.value
        return bookings.value.filter(
        b => b.eventSponsorship?.event?.name === selectedEvent.value
        )
    })
    
    function formatDate(date) {
        return new Date(date).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }
    
    function downloadCSV() {
        const rows = filteredBookings.value.map(b => [
        b.id,
        b.sponsorName,
        b.sponsorEmail,
        b.sponsorPhone,
        b.eventSponsorship?.sponsorshipType?.name || '-',
        b.eventSponsorship?.event?.name || '-',
        formatDate(b.bookedAt)
        ])
        const csv = [
        ['ID', 'Name', 'Email', 'Phone', 'Type', 'Event', 'Booked At'],
        ...rows
        ].map(e => e.join(',')).join('\n')
    
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'sponsorship-bookings.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
    
    async function deleteBooking(id) {
        if (!confirm('Are you sure you want to delete this booking?')) return
        // Replace this with actual delete logic if API is implemented
        bookings.value = bookings.value.filter(b => b.id !== id)
    }
  </script>
  