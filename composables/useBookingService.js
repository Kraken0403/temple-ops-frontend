// composables/useBookingService.js
import { useRuntimeConfig, useCookie } from '#app'

export const useBookingService = () => {
  const { apiBase } = useRuntimeConfig().public
  const base = `${apiBase}/booking`

  /* ───────────────────────── Headers ───────────────────────── */
  const headers = () => {
    const t = useCookie('token').value
    const h = { 'Content-Type': 'application/json' }
    if (t) h.Authorization = `Bearer ${t}`
    return h
  }

  const safeJson = async (res) => {
    try {
      return await res.json()
    } catch {
      return null
    }
  }

  const parseOrThrow = async (res, fallbackMsg) => {
    const data = await safeJson(res)
    if (!res.ok) {
      const msg =
        Array.isArray(data?.message)
          ? data.message[0]
          : data?.message || data?.error || fallbackMsg || `HTTP ${res.status}`
      throw new Error(msg)
    }
    return data
  }

  /* ───────────────────────── PUBLIC (GUEST SAFE) ───────────────────────── */

  /**
   * Quote booking price
   * Backend returns:
   * - baseAmount
   * - travelDistanceUnits
   * - travelRateApplied
   * - freeUnits
   * - travelUnit ("mile" | "km")
   * - travelCost
   * - subtotal
   * - discount
   * - total
   */
  const quoteBooking = async (payload) => {
    const res = await fetch(`${base}/quote`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        poojaId: Number(payload.poojaId),

        // Optional — only for outside venue
        venueLat: payload.venueLat ?? undefined,
        venueLng: payload.venueLng ?? undefined,

        couponCode: payload.couponCode?.trim() || undefined,
      }),
    })

    return parseOrThrow(res, 'Failed to calculate price')
  }

  /**
   * Create booking
   * Pricing is recalculated & snapshotted server-side
   */
  const submitBooking = async (payload) => {
    const res = await fetch(base, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        poojaId: Number(payload.poojaId),
        priestId: Number(payload.priestId),

        bookingDate: payload.bookingDate,
        start: payload.start,
        end: payload.end,

        userName: payload.userName || null,
        userEmail: payload.userEmail || null,
        userPhone: payload.userPhone || null,

        venueAddress: payload.venueAddress || null,
        venueState: payload.venueState || null,
        venueZip: payload.venueZip || null,

        // Only present for outside venue
        venueLat: payload.venueLat ?? undefined,
        venueLng: payload.venueLng ?? undefined,

        couponCode: payload.couponCode?.trim() || undefined,
      }),
    })

    return parseOrThrow(res, 'Booking failed')
  }

  /* ───────────────────────── ADMIN / STAFF ───────────────────────── */

  const getBookingById = async (id) => {
    const res = await fetch(`${base}/${id}`, {
      headers: headers(),
    })
    return parseOrThrow(res, 'Failed to fetch booking')
  }

  const getAllBookings = async (params) => {
    const qs = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(
              ([, v]) => v !== undefined && v !== null && v !== '',
            ),
          ),
        ).toString()
      : ''

    const res = await fetch(`${base}${qs}`, {
      headers: headers(),
    })

    return parseOrThrow(res, 'Failed to fetch bookings')
  }

  const updateBooking = async (id, patch) => {
    // 🧼 HARD FILTER — DTO SAFE
    const payload = {
      // relations
      poojaId: patch.poojaId ?? undefined,
      priestId: patch.priestId ?? undefined,
  
      // dates
      bookingDate: patch.bookingDate ?? undefined,
      start: patch.start ?? undefined,
      end: patch.end ?? undefined,
  
      // user snapshot
      userName: patch.userName ?? undefined,
      userEmail: patch.userEmail ?? undefined,
      userPhone: patch.userPhone ?? undefined,
  
      // venue
      venueAddress: patch.venueAddress ?? undefined,
      venueState: patch.venueState ?? undefined,
      venueZip: patch.venueZip ?? undefined,
      venueLat: patch.venueLat ?? undefined,
      venueLng: patch.venueLng ?? undefined,
  
      // status / coupon
      status: patch.status ?? undefined,
      couponCode: patch.couponCode?.trim() || undefined,
    }
  
    // remove undefined keys (important for PATCH)
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    )
  
    const res = await fetch(`${base}/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(payload),
    })
  
    return parseOrThrow(res, 'Failed to update booking')
  }
  

  const updateBookingStatus = async (id, status) => {
    const res = await fetch(
      `${base}/${id}/status/${encodeURIComponent(status)}`,
      {
        method: 'PATCH',
        headers: headers(),
      },
    )

    return parseOrThrow(res, 'Failed to update booking status')
  }

  const deleteBooking = async (id) => {
    const res = await fetch(`${base}/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })

    await parseOrThrow(res, 'Failed to delete booking')
    return { ok: true }
  }

  /* ───────────────────────── Exports ───────────────────────── */

  return {
    // public
    quoteBooking,
    submitBooking,

    // admin / staff
    getBookingById,
    getAllBookings,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
  }
}
