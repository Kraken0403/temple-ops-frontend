import { useRuntimeConfig, useCookie } from '#app'

/** Deeply remove disallowed keys and strip null/undefined values. */
function sanitizeDeep(input, disallowedKeys = new Set(['imageUrl', 'imageURL', 'image_url'])) {
  if (input === null || input === undefined) return undefined
  if (typeof input !== 'object') return input
  if (Array.isArray(input)) {
    return input.map(v => sanitizeDeep(v, disallowedKeys)).filter(v => v !== undefined)
  }
  const out = {}
  for (const [k, v] of Object.entries(input)) {
    if (disallowedKeys.has(k)) continue
    const sv = sanitizeDeep(v, disallowedKeys)
    if (sv !== undefined) out[k] = sv
  }
  return out
}

/** Helpers to build minimal API payloads (no accidental spreads). */
const toISO = (d) => (d ? new Date(d).toISOString() : undefined)
const toISOTime = (dateStr, timeStr) => (timeStr ? new Date(`${dateStr}T${timeStr}`).toISOString() : undefined)

function buildCreatePayload(form, uploaded) {
  // normalize in-venue vs outside-venue
  const isInVenue = !!form.isInVenue
  const isOutsideVenue = !!form.isOutsideVenue

  const body = {
    name: String(form.name || '').trim(),
    description: form.description || null,

    // flags
    isInVenue,
    isOutsideVenue,

    // venue fields
    venueId: isInVenue ? (form.venueId != null ? Number(form.venueId) : null) : null,
    venue:   isOutsideVenue ? String(form.venue || '').trim() : '',
    mapLink: isOutsideVenue ? (form.mapLink || null) : null,

    // times
    date: toISO(form.date),
    endDate: toISO(form.endDate),
    startTime: toISOTime(form.date, form.startTime),
    endTime: toISOTime(form.date, form.endTime),

    // misc
    tags: form.tags,
    capacity: form.capacity != null ? Number(form.capacity) : undefined,
    price: form.price != null ? Number(form.price) : undefined,
    organizer: form.organizer || null,
    contactInfo: form.contactInfo || null,
    isPublic: typeof form.isPublic === 'boolean' ? form.isPublic : undefined,

    // unified featured
    featuredMediaId: form.featuredMediaId ?? (uploaded && uploaded.id) ?? undefined,
    clearFeaturedMedia: form.clearFeaturedMedia ?? false,
  }
  return sanitizeDeep(body)
}

function buildUpdatePayload(form, uploaded) {
  const has = (v) => v !== undefined
  const isInVenue = form.isInVenue === true || (form.isInVenue !== false && form.venueId != null)
  const isOutsideVenue = form.isOutsideVenue === true || (form.isOutsideVenue !== false && (form.venue || form.mapLink))

  const body = {
    name: form.name && form.name.trim ? form.name.trim() : form.name,
    description: has(form.description) ? form.description : undefined,

    // flags (only send when provided to avoid overwriting unintentionally)
    isInVenue: typeof form.isInVenue === 'boolean' ? form.isInVenue : undefined,
    isOutsideVenue: typeof form.isOutsideVenue === 'boolean' ? form.isOutsideVenue : undefined,

    // venue (normalize according to current flags if provided)
    venueId: (typeof form.isInVenue === 'boolean' && form.isInVenue)
      ? (form.venueId != null ? Number(form.venueId) : null)
      : (typeof form.venueId !== 'undefined' ? null : undefined),

    venue: (typeof form.isOutsideVenue === 'boolean' && form.isOutsideVenue)
      ? (form.venue && form.venue.trim ? form.venue.trim() : (form.venue ?? ''))
      : (typeof form.venue !== 'undefined' ? '' : undefined),

    mapLink: (typeof form.isOutsideVenue === 'boolean' && form.isOutsideVenue)
      ? (has(form.mapLink) ? form.mapLink : undefined)
      : (has(form.mapLink) ? null : undefined),

    // times
    date: toISO(form.date),
    endDate: toISO(form.endDate),
    startTime: toISOTime(form.date, form.startTime),
    endTime: toISOTime(form.date, form.endTime),

    // misc
    tags: has(form.tags) ? form.tags : undefined,
    capacity: form.capacity != null ? Number(form.capacity) : undefined,
    price: form.price != null ? Number(form.price) : undefined,
    organizer: has(form.organizer) ? form.organizer : undefined,
    contactInfo: has(form.contactInfo) ? form.contactInfo : undefined,
    isPublic: typeof form.isPublic === 'boolean' ? form.isPublic : undefined,

    featuredMediaId: form.featuredMediaId ?? (uploaded && uploaded.id) ?? undefined,
    clearFeaturedMedia: form.clearFeaturedMedia ?? false,
  }

  return sanitizeDeep(body)
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

  /* ───────── Media (central library) ───────── */
  const uploadAsset = async (file) => {
    const t = useCookie('token').value
    const headers = t ? { Authorization: `Bearer ${t}` } : {}
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${apiBase}/media/upload`, { method: 'POST', headers, body: fd })
    return handle(res, 'Event image upload failed') // -> { id, url, ... }
  }

  // Gallery (controller uses 'event' singular)
  const addToGallery = async (eventId, mediaIds = []) => {
    const res = await fetch(`${apiBase}/events/${eventId}/gallery`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sanitizeDeep({ mediaIds })),
    })
    return handle(res, 'Failed to add to gallery')
  }
  const reorderGallery = async (eventId, orders /* [{mediaId, sortOrder}] */) => {
    const res = await fetch(`${apiBase}/events/${eventId}/gallery`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(sanitizeDeep(orders)),
    })
    return handle(res, 'Failed to reorder gallery')
  }
  const removeFromGallery = async (eventId, mediaId) => {
    const res = await fetch(`${apiBase}/events/${eventId}/gallery/${mediaId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handle(res, 'Failed to remove from gallery')
  }

  /* ───────── CRUD ───────── */
  const createEvent = async (form, file) => {
    const uploaded = file ? await uploadAsset(file) : null
    const body = buildCreatePayload(form, uploaded)
    const res = await fetch(`${apiBase}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    return handle(res, 'Failed to create event')
  }

  const updateEvent = async (id, form, file) => {
    const uploaded = file ? await uploadAsset(file) : null
    const body = buildUpdatePayload(form, uploaded)
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
    const res = await fetch(`${apiBase}/events/${id}`, { method: 'DELETE', headers: getHeaders() })
    await handle(res, `Failed to delete event ${id}`)
    return true
  }

  return {
    // media
    uploadAsset,
    addToGallery,
    reorderGallery,
    removeFromGallery,
    // events
    createEvent,
    updateEvent,
    fetchEvents,
    getEventById,
    deleteEvent,
  }
}
