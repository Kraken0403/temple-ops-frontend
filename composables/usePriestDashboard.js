// composables/usePriestDashboard.js
import { useRuntimeConfig, useCookie } from '#app'

export const usePriestDashboard = () => {
  const { apiBase } = useRuntimeConfig().public

  const authHeaders = () => {
    const t = useCookie('token').value
    const h = { 'Content-Type': 'application/json' }
    if (t) h.Authorization = `Bearer ${t}`
    return h
  }

  const safeJson = async (res) => {
    try { return await res.json() } catch { return null }
  }

  const handle = async (res, fallbackMsg) => {
    if (!res.ok) {
      const j = await safeJson(res)
      throw new Error(j?.message || j?.error || fallbackMsg || `HTTP ${res.status}`)
    }
    return await safeJson(res)
  }

  /**
   * Fetch bookings for the currently logged-in priest.
   * Backend endpoint expected: GET /booking/my
   */
  const fetchMyBookings = async () => {
    const res = await fetch(`${apiBase}/booking/my`, {
      method: 'GET',
      headers: authHeaders(),
    })
    return handle(res, 'Failed to load your bookings')
  }

  /**
   * Update booking status (pending | confirmed | canceled | completed)
   * Uses the general booking update route.
   * Backend endpoint expected: PATCH /booking/:id with { status }
   */
  const updateMyBookingStatus = async (bookingId, status) => {
    const res = await fetch(`${apiBase}/booking/${bookingId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    })
    return handle(res, 'Failed to update status')
  }

  /**
   * (Optional) Reassign booking to another priest (if you enable this later)
   * Backend should still validate priest ↔ pooja pairing.
   */
  const reassignMyBooking = async (bookingId, priestId) => {
    const res = await fetch(`${apiBase}/booking/${bookingId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ priestId: Number(priestId) }),
    })
    return handle(res, 'Failed to reassign booking')
  }

  return {
    fetchMyBookings,
    updateMyBookingStatus,
    reassignMyBooking,
  }
}
