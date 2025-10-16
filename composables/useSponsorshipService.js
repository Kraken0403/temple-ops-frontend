// ~/composables/useSponsorshipService.js
import { useRuntimeConfig } from '#app'

export const useSponsorshipService = () => {
  const config = useRuntimeConfig().public
  const base   = config.apiBase

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  }

  /**
   * Parse response safely:
   * - Prefer JSON when content-type says so
   * - Fallback to text; if it's a number, wrap into an object
   * - Throw helpful errors for non-OK responses
   */
  const parseSmart = async (res, fallbackMessage) => {
    const contentType = (res.headers.get('content-type') || '').toLowerCase()

    // Try JSON first when advertised
    if (contentType.includes('application/json')) {
      try {
        const data = await res.json()
        if (!res.ok) {
          const msg = data?.message || data?.error || fallbackMessage || `HTTP ${res.status}`
          throw new Error(msg)
        }
        return data
      } catch (e) {
        // If server lied about JSON and body is not JSON
        if (!res.ok) throw new Error(fallbackMessage || e?.message || `HTTP ${res.status}`)
        // else fall through to text parsing
      }
    }

    // Fallback to text
    let text = ''
    try {
      text = await res.text()
    } catch (e) {
      if (!res.ok) throw new Error(fallbackMessage || `HTTP ${res.status}`)
      return { success: res.ok }
    }

    if (!res.ok) {
      // Try parse error JSON embedded in text
      try {
        const maybeJson = JSON.parse(text)
        const msg = maybeJson?.message || maybeJson?.error || fallbackMessage || `HTTP ${res.status}`
        throw new Error(msg)
      } catch {
        const msg = text || fallbackMessage || `HTTP ${res.status}`
        throw new Error(msg)
      }
    }

    // OK response but not JSON → interpret
    const num = Number(text)
    if (!Number.isNaN(num)) {
      return { success: true, id: num, raw: text }
    }

    try {
      const maybeJson = JSON.parse(text)
      return maybeJson
    } catch {
      return { success: true, raw: text }
    }
  }

  // ─────────────────────────────────────────────
  // Sponsorship Types
  // ─────────────────────────────────────────────
  const createSponsorshipType = async (payload) => {
    const res = await fetch(`${base}/sponsorship/type`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    })
    return parseSmart(res, 'Failed to create sponsorship type')
  }

  const fetchSponsorshipTypes = async () => {
    const res = await fetch(`${base}/sponsorship/types`, { headers: defaultHeaders })
    return parseSmart(res, 'Failed to fetch sponsorship types')
  }

  const updateSponsorshipType = async (id, payload) => {
    const res = await fetch(`${base}/sponsorship/type/${id}`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    })
    return parseSmart(res, 'Failed to update sponsorship type')
  }

  const deleteSponsorshipType = async (id) => {
    const res = await fetch(`${base}/sponsorship/type/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    })
    return parseSmart(res, 'Failed to delete sponsorship type')
  }

  const forceDeleteSponsorshipType = async (id) => {
    const res = await fetch(`${base}/sponsorship/type/${id}?force=true`, {
      method: 'DELETE',
      headers: defaultHeaders,
    })
    return parseSmart(res, 'Failed to force delete sponsorship type')
  }

  // ─────────────────────────────────────────────
  // Event/Independent Sponsorship rows
  // ─────────────────────────────────────────────
  const assignToEvent = async (payload) => {
    // payload: { eventId, sponsorshipTypeId, maxSlots, price? }
    const res = await fetch(`${base}/sponsorship/event`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    })
    return parseSmart(res, 'Failed to assign sponsorship')
  }

  const createStandaloneSponsorship = async (payload) => {
    // payload: { sponsorshipTypeId, maxSlots, price?, startsAt?, endsAt?, isActive? }
    const res = await fetch(`${base}/sponsorship/independent`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    })
    return parseSmart(res, 'Failed to create standalone sponsorship')
  }

  const updateEventSponsorship = async (eventSponsorshipId, payload) => {
    const res = await fetch(`${base}/sponsorship/event/${eventSponsorshipId}`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    })
    return parseSmart(res, 'Failed to update sponsorship')
  }

  const deleteSponsorshipAssignment = async (eventId, sponsorshipTypeId) => {
    const res = await fetch(`${base}/sponsorship/event/${eventId}/${sponsorshipTypeId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    })
    return parseSmart(res, 'Failed to delete sponsorship assignment')
  }

  const deleteEventSponsorshipById = async (id) => {
    const res = await fetch(`${base}/sponsorship/event/by-id/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    })
    return parseSmart(res, 'Failed to delete event sponsorship')
  }

  const getAllEventSponsorships = async () => {
    const res = await fetch(`${base}/sponsorship/events`, { headers: defaultHeaders })
    return parseSmart(res, 'Failed to fetch sponsorships')
  }

  const getEventSponsorshipById = async (id) => {
    const res = await fetch(`${base}/sponsorship/${id}`, { headers: defaultHeaders })
    return parseSmart(res, 'Failed to fetch sponsorship')
  }

  const getSponsorshipsForEvent = async (eventId) => {
    try {
      const res = await fetch(`${base}/sponsorship/event/${eventId}`, { headers: defaultHeaders })
      if (res.status === 404) return []
      return parseSmart(res, 'Failed to fetch sponsorships')
    } catch (e) {
      console.warn('No sponsorships or fetch failed:', e)
      return []
    }
  }

  const listIndependentSponsorships = async (availableOnly = false) => {
    const url = new URL(`${base}/sponsorship/independent/list`)
    if (availableOnly) url.searchParams.set('availableOnly', 'true')
    const res = await fetch(url.toString(), { headers: defaultHeaders })
    return parseSmart(res, 'Failed to fetch independent sponsorships')
  }

  // ─────────────────────────────────────────────
  // Bookings
  // ─────────────────────────────────────────────
  /**
   * Flexible usage:
   *  - bookSponsorship(id, payload) → POST /sponsorship/book with { ...payload, eventSponsorshipId: id }
   *  - bookSponsorship(payload)     → POST /sponsorship/book with payload as-is
   */
  const bookSponsorship = async (idOrPayload, maybePayload) => {
    let payload
    if (typeof idOrPayload === 'number') {
      payload = { ...(maybePayload || {}), eventSponsorshipId: idOrPayload }
    } else {
      payload = idOrPayload
    }

    const res = await fetch(`${base}/sponsorship/book`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    })
    return parseSmart(res, 'Booking failed')
  }

  const getAllSponsorshipBookings = async () => {
    const res = await fetch(`${base}/sponsorship/bookings`, { headers: defaultHeaders })
    return parseSmart(res, 'Failed to fetch bookings')
  }

  const updateBooking = async (id, payload) => {
    const res = await fetch(`${base}/sponsorship/booking/${id}`, {
      method: 'PATCH',
      headers: defaultHeaders,
      body: JSON.stringify(payload),
    })
    return parseSmart(res, 'Failed to update booking')
  }

  const deleteBooking = async (id) => {
    const res = await fetch(`${base}/sponsorship/booking/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    })
    return parseSmart(res, 'Failed to delete booking')
  }

  // Legacy alias
  const getAllSponsorships = async () => {
    const res = await fetch(`${base}/sponsorship/bookings`, { headers: defaultHeaders })
    return parseSmart(res, 'Failed to fetch sponsorships')
  }

  return {
    // Types
    createSponsorshipType,
    fetchSponsorshipTypes,
    updateSponsorshipType,
    deleteSponsorshipType,
    forceDeleteSponsorshipType,

    // Event/Independent rows
    assignToEvent,
    createStandaloneSponsorship,
    updateEventSponsorship,
    deleteSponsorshipAssignment,
    deleteEventSponsorshipById,
    getAllEventSponsorships,
    getEventSponsorshipById,
    getSponsorshipsForEvent,
    listIndependentSponsorships,

    // Bookings
    bookSponsorship,
    getAllSponsorshipBookings,
    updateBooking,
    deleteBooking,

    // Legacy alias
    getAllSponsorships,
  }
}
