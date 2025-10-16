// composables/useBookingService.js
import { useRuntimeConfig, useCookie } from '#app'

export const useBookingService = () => {
  const { apiBase } = useRuntimeConfig().public
  const base = `${apiBase}/booking`

  const headers = () => {
    const t = useCookie('token').value
    const h = { 'Content-Type': 'application/json' }
    if (t) h.Authorization = `Bearer ${t}`
    return h
  }

  const safeJson = async (res) => { try { return await res.json() } catch { return null } }
  const parseOrThrow = async (res, fallbackMsg) => {
    const data = await safeJson(res)
    if (!res.ok) throw new Error(data?.message || data?.error || fallbackMsg || `HTTP ${res.status}`)
    return data
  }

  // CREATE
  const submitBooking = async (payload) => {
    const res = await fetch(base, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    })
    return parseOrThrow(res, 'Booking failed')
  }

  // READ (single)
  const getBookingById = async (id) => {
    const res = await fetch(`${base}/${id}`, { headers: headers() })
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
    const res = await fetch(`${base}${qs}`, { headers: headers() })
    return parseOrThrow(res, 'Failed to fetch bookings')
  }

  // UPDATE (partial)
  const updateBooking = async (id, patch) => {
    const res = await fetch(`${base}/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(patch),
    })
    return parseOrThrow(res, 'Failed to update booking')
  }

  // UPDATE (status only)
  const updateBookingStatus = async (id, status) => {
    const res = await fetch(`${base}/${id}/status/${encodeURIComponent(status)}`, {
      method: 'PATCH',
      headers: headers(),
    })
    return parseOrThrow(res, 'Failed to update booking status')
  }

  // DELETE
  const deleteBooking = async (id) => {
    const res = await fetch(`${base}/${id}`, { method: 'DELETE', headers: headers() })
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
