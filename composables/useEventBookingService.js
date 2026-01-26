// File: composables/useEventBookingService.js
import { useRuntimeConfig, useCookie } from '#app'

export const useEventBookingService = () => {
  const config = useRuntimeConfig().public
  const token  = useCookie('token').value

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${token}`,
  }

  /* ============================
     ADMIN — EVENT LEVEL BOOKINGS
  ============================ */
  const fetchBookings = async (eventId) => {
    const res = await fetch(
      `${config.apiBase}/events/${eventId}/bookings`,
      { headers: adminHeaders },
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to fetch event bookings')
    }

    return res.json()
  }

  /* ============================
     ADMIN — OCCURRENCE BOOKINGS
  ============================ */
  const fetchBookingsByOccurrence = async (occurrenceId) => {
    const res = await fetch(
      `${config.apiBase}/event-occurrences/${occurrenceId}/bookings`,
      { headers: adminHeaders },
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(
        err.message || 'Failed to fetch occurrence bookings',
      )
    }

    return res.json()
  }

  /* ============================
     PUBLIC — BOOK EVENT
  ============================ */
  const bookOccurrence = async (occurrenceId, payload) => {
    const res = await fetch(
      `${config.apiBase}/events/occurrences/${occurrenceId}/book`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Event booking failed')
    }

    return res.json()
  }

  return {
    fetchBookings,
    fetchBookingsByOccurrence,
    bookOccurrence,
  }
}
