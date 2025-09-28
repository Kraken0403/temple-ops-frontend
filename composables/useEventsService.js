// composables/useEventsService.js
import { useRuntimeConfig, useCookie } from '#app'
import { DateTime } from 'luxon'

/** Sanitize deep objects */
function sanitizeDeep(input) {
  if (input === null || input === undefined) return undefined
  if (typeof input !== 'object') return input
  if (Array.isArray(input)) return input.map(v => sanitizeDeep(v)).filter(v => v !== undefined)
  const out = {}
  for (const [k, v] of Object.entries(input)) {
    const sv = sanitizeDeep(v)
    if (sv !== undefined) out[k] = sv
  }
  return out
}

function buildDateTime(dateStr, timeStr, tz) {
  if (!dateStr) return undefined
  const dt = timeStr
    ? DateTime.fromFormat(`${dateStr} ${timeStr}`, 'yyyy-LL-dd HH:mm', { zone: tz })
    : DateTime.fromFormat(dateStr, 'yyyy-LL-dd', { zone: tz })
  return dt.toUTC().toISO()
}

export function useEventsService() {
  const { apiBase } = useRuntimeConfig().public

  const getHeaders = () => {
    const t = useCookie('token').value
    return { Authorization: t ? `Bearer ${t}` : '', 'Content-Type': 'application/json' }
  }
  const safeJson = async (res) => { try { return await res.json() } catch { return null } }
  const handle = async (res, msg) => {
    if (!res.ok) {
      const j = await safeJson(res)
      throw new Error(j?.message || msg || 'Request failed')
    }
    return safeJson(res)
  }

  /* ───────────────────────────── Helpers ───────────────────────────── */
  function buildPayload(form, tz) {
    const inVenue = !!form.venueId
    const outsideVenue = !inVenue

    return sanitizeDeep({
      name: String(form.name || '').trim(),
      description: form.description || null,

      // venue fields
      venueId: inVenue ? Number(form.venueId) : null,
      venue: outsideVenue ? form.venue || null : null,
      mapLink: outsideVenue ? form.mapLink || null : null,

      isInVenue: inVenue,
      isOutsideVenue: outsideVenue,

      date: buildDateTime(form.date, null, tz),
      endDate: buildDateTime(form.endDate, null, tz),
      startTime: buildDateTime(form.date, form.startTime, tz),
      endTime: buildDateTime(form.date, form.endTime, tz),

      tags: form.tags,
      capacity: form.capacity != null ? Number(form.capacity) : undefined,
      price: form.price != null ? Number(form.price) : undefined,
      organizer: form.organizer || null,
      contactInfo: form.contactInfo || null,
      isPublic: typeof form.isPublic === 'boolean' ? form.isPublic : true,

      featuredMediaId: form.featuredMediaId ?? undefined,
      clearFeaturedMedia: form.clearFeaturedMedia ?? false,
    })
  }

  /* ───────────────────────────── API ───────────────────────────── */

  const createEvent = async (form, file, tz) => {
    const body = buildPayload(form, tz)
    const res = await fetch(`${apiBase}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    return handle(res, 'Failed to create event')
  }

  const updateEvent = async (id, form, file, tz) => {
    const body = buildPayload(form, tz)
    const res = await fetch(`${apiBase}/events/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    return handle(res, 'Failed to update event')
  }

  const fetchEvents = async () => {
    const res = await fetch(`${apiBase}/events`, { headers: getHeaders() })
    return handle(res, 'Failed to fetch events')
  }
  const getEventById = async (id) => {
    const res = await fetch(`${apiBase}/events/${id}`, { headers: getHeaders() })
    return handle(res, `Failed to fetch event ${id}`)
  }
  const deleteEvent = async (id) => {
    console.log('Calling DELETE', `${apiBase}/events/${id}`)
    const res = await fetch(`${apiBase}/events/${id}`, { method: 'DELETE', headers: getHeaders() })
    const text = await res.text()   // 👈 capture raw response
    console.log('Delete response raw:', text)
    if (!res.ok) {
      throw new Error(text || `Failed to delete event ${id}`)
    }
    return true
  }

  return { createEvent, updateEvent, fetchEvents, getEventById, deleteEvent }
}
