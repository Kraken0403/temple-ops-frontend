import { useRuntimeConfig } from '#app'

export const useSponsorshipService = () => {
  const config = useRuntimeConfig().public
  const base   = config.apiBase
  const json   = { 'Content-Type': 'application/json' }

  // ─────────────────────────────────────────────
  // Sponsorship Type
  // ─────────────────────────────────────────────

  // Create
  const createSponsorshipType = async (payload) => {
    const res = await fetch(`${base}/sponsorship/type`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to create sponsorship type')
    return res.json()
  }

  // List
  const fetchSponsorshipTypes = async () => {
    const res = await fetch(`${base}/sponsorship/types`)
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch sponsorship types')
    return res.json()
  }

  // Update (EDIT)
  const updateSponsorshipType = async (id, payload) => {
    const res = await fetch(`${base}/sponsorship/type/${id}`, {
      method: 'PATCH',
      headers: json,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to update sponsorship type')
    return res.json()
  }

  // Delete (safe by default)
  const deleteSponsorshipType = async (id) => {
    const res = await fetch(`${base}/sponsorship/type/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete sponsorship type')
    return res.json()
  }

  // Force delete (cascade eventSponsorships + bookings)
  const forceDeleteSponsorshipType = async (id) => {
    const res = await fetch(`${base}/sponsorship/type/${id}?force=true`, { method: 'DELETE' })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to force delete sponsorship type')
    return res.json()
  }

  // ─────────────────────────────────────────────
  // Event Sponsorship (assignment rows)
  // ─────────────────────────────────────────────

  // Assign type to event (create/upssert)
  const assignToEvent = async (payload) => {
    const res = await fetch(`${base}/sponsorship/event`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to assign sponsorship')
    return res.json()
  }

  // Update (EDIT) by EventSponsorship ID
  const updateEventSponsorship = async (eventSponsorshipId, payload) => {
    const res = await fetch(`${base}/sponsorship/event/${eventSponsorshipId}`, {
      method: 'PATCH',
      headers: json,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to update event sponsorship')
    return res.json()
  }

  // Delete by composite key (eventId + sponsorshipTypeId)
  const deleteSponsorshipAssignment = async (eventId, sponsorshipTypeId) => {
    const res = await fetch(`${base}/sponsorship/event/${eventId}/${sponsorshipTypeId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete sponsorship assignment')
    return res.json()
  }

  // Delete by EventSponsorship ID (cascades its bookings)
  const deleteEventSponsorshipById = async (id) => {
    const res = await fetch(`${base}/sponsorship/event/by-id/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete event sponsorship')
    return res.json()
  }

  // List all event sponsorship rows
  const getAllEventSponsorships = async () => {
    const res = await fetch(`${base}/sponsorship/events`)
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch sponsorships')
    return res.json()
  }

  // Get single event sponsorship by its ID
  const getEventSponsorshipById = async (id) => {
    const res = await fetch(`${base}/sponsorship/${id}`)
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch sponsorship')
    return res.json()
  }

  // List sponsorships for a given event
  const getSponsorshipsForEvent = async (eventId) => {
    try {
      const res = await fetch(`${base}/sponsorship/event/${eventId}`)
      if (res.status === 404) return []
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch sponsorships')
      return res.json()
    } catch (e) {
      console.warn('No sponsorships or fetch failed:', e)
      return []
    }
  }

  // ─────────────────────────────────────────────
  // Bookings
  // ─────────────────────────────────────────────

  // Book a slot
  const bookSponsorship = async (payload) => {
    const res = await fetch(`${base}/sponsorship/book`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Booking failed')
    return res.json()
  }

  // List bookings
  const getAllSponsorshipBookings = async () => {
    const res = await fetch(`${base}/sponsorship/bookings`)
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch bookings')
    return res.json()
  }

  // Update (EDIT) booking
  const updateBooking = async (id, payload) => {
    const res = await fetch(`${base}/sponsorship/booking/${id}`, {
      method: 'PATCH',
      headers: json,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to update booking')
    return res.json()
  }

  // Delete booking
  const deleteBooking = async (id) => {
    const res = await fetch(`${base}/sponsorship/booking/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete booking')
    return res.json()
  }

  // ─────────────────────────────────────────────
  // Backward-compat list alias (you had this already)
  // ─────────────────────────────────────────────
  const getAllSponsorships = async () => {
    const res = await fetch(`${base}/sponsorship/bookings`)
    if (!res.ok) throw new Error('Failed to fetch sponsorships')
    return res.json()
  }

  return {
    // Types
    createSponsorshipType,
    fetchSponsorshipTypes,
    updateSponsorshipType,
    deleteSponsorshipType,
    forceDeleteSponsorshipType,

    // Event sponsorships
    assignToEvent,
    updateEventSponsorship,
    deleteSponsorshipAssignment,
    deleteEventSponsorshipById,
    getAllEventSponsorships,
    getEventSponsorshipById,
    getSponsorshipsForEvent,

    // Bookings
    bookSponsorship,
    getAllSponsorshipBookings,
    updateBooking,
    deleteBooking,

    // Legacy alias
    getAllSponsorships,
  }
}
