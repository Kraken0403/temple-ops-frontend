// composables/useBookingService.js
import { useRuntimeConfig } from '#app'

export const useBookingService = () => {
  const config = useRuntimeConfig().public
  const base = `${config.apiBase}/booking`

  const parseOrThrow = async (res, fallbackMsg) => {
    let data = null
    try { data = await res.json() } catch { /* ignore parse errors */ }
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || fallbackMsg
      throw new Error(msg)
    }
    return data
  }

  // CREATE
  const submitBooking = async (payload) => {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return parseOrThrow(res, 'Booking failed')
  }

  // READ (single)
  const getBookingById = async (id) => {
    const res = await fetch(`${base}/${id}`)
    return parseOrThrow(res, 'Failed to fetch booking')
  }

  // READ (list) with optional query params
  const getAllBookings = async (params) => {
    const qs = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          )
        ).toString()
      : ''
    const res = await fetch(`${base}${qs}`)
    return parseOrThrow(res, 'Failed to fetch bookings')
  }

  // UPDATE (partial)
  const updateBooking = async (id, patch) => {
    const res = await fetch(`${base}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    return parseOrThrow(res, 'Failed to update booking')
  }

  // UPDATE (status only, convenience)
  const updateBookingStatus = async (id, status) => {
    const res = await fetch(`${base}/${id}/status/${encodeURIComponent(status)}`, {
      method: 'PATCH',
    })
    return parseOrThrow(res, 'Failed to update booking status')
  }

  // DELETE
  const deleteBooking = async (id) => {
    const res = await fetch(`${base}/${id}`, { method: 'DELETE' })
    await parseOrThrow(res, 'Failed to delete booking')
    return { ok: true }
  }

  return {
    submitBooking,
    getBookingById,
    getAllBookings,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
  }
}
