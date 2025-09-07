// File: composables/useEventBookingService.js
import { useRuntimeConfig } from '#app'

export const useEventBookingService = () => {
  const config = useRuntimeConfig().public

  // Fetch all bookings for a given event
  const fetchBookings = async (eventId) => {
    const res = await fetch(`${config.apiBase}/events/${eventId}/bookings`)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to fetch event bookings')
    }
    return res.json()
  }

  // (existing) bookEvent…
  const bookEvent = async (eventId, payload) => {
    const res = await fetch(`${config.apiBase}/events/${eventId}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Event booking failed')
    }
    return res.json()
  }

  return { fetchBookings, bookEvent }
}
