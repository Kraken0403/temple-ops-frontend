// composables/usePoojaService.js
import { useRuntimeConfig, useCookie } from '#app'

export const usePoojaService = () => {
  const { apiBase } = useRuntimeConfig().public

  const getHeaders = () => {
    const t = useCookie('token').value
    return { Authorization: t ? `Bearer ${t}` : '', 'Content-Type': 'application/json' }
  }
  const safeJson = async (res) => { try { return await res.json() } catch { return null } }
  const handle = async (res, msg) => {
    if (!res.ok) {
      const j = await safeJson(res)
      throw new Error(j?.message?.[0] || j?.message || msg || 'Request failed')
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
    return handle(res, 'Photo upload failed') // -> { id, url, ... }
  }

  // Gallery helpers
  const addToGallery = async (poojaId, mediaIds = []) => {
    const res = await fetch(`${apiBase}/pooja/${poojaId}/gallery`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mediaIds }),
    })
    return handle(res, 'Failed to add to gallery')
  }
  const reorderGallery = async (poojaId, orders /* [{mediaId, sortOrder}] */) => {
    const res = await fetch(`${apiBase}/pooja/${poojaId}/gallery`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(orders),
    })
    return handle(res, 'Failed to reorder gallery')
  }
  const removeFromGallery = async (poojaId, mediaId) => {
    const res = await fetch(`${apiBase}/pooja/${poojaId}/gallery/${mediaId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handle(res, 'Failed to remove from gallery')
  }

  /* ───────── CRUD ───────── */
  const toISO = (d) => (d ? new Date(d).toISOString() : undefined)
  const toISOTime = (dateStr, timeStr) =>
    timeStr ? new Date(`${dateStr}T${timeStr}`).toISOString() : undefined

  const createPooja = async (form, file) => {
    const uploaded = file ? await uploadAsset(file) : null

    const isInVenue = !!form.isInVenue
    const isOutsideVenue = !!form.isOutsideVenue

    const body = {
      name: String(form.name || '').trim(),
      priestIds: (form.priestIds || []).map(Number).filter(Boolean),

      // 🔴 FIX: send categories on CREATE
      categoryIds: (form.categoryIds || []).map(Number).filter(Boolean),

      amount: Number(form.amount),
      durationMin: Number(form.durationMin),
      prepTimeMin: Number(form.prepTimeMin),
      bufferMin: Number(form.bufferMin),

      isInVenue,
      isOutsideVenue,

      date: toISO(form.date),
      time: toISOTime(form.date, form.time),

      venueId: isInVenue ? (form.venueId != null ? Number(form.venueId) : null) : null,
      venueAddress: isOutsideVenue ? (form.venueAddress || null) : null,
      mapLink: isOutsideVenue ? (form.mapLink || null) : null,

      allowedZones: isOutsideVenue
        ? (Array.isArray(form.allowedZones)
            ? form.allowedZones
            : (form.allowedZones
                ? String(form.allowedZones).split(',').map(z => z.trim()).filter(Boolean)
                : undefined))
        : undefined,

      includeFood: Boolean(form.includeFood),
      includeHall: Boolean(form.includeHall),
      materials: form.materials || null,
      notes: form.notes || null,
      description: form.description || null,

      featuredMediaId: form.featuredMediaId ?? uploaded?.id ?? undefined,
      clearFeaturedMedia: form.clearFeaturedMedia ?? false,
    }

    const res = await fetch(`${apiBase}/pooja`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    return handle(res, 'Failed to create pooja')
  }

  const getPoojaById = async (id) => {
    const res = await fetch(`${apiBase}/pooja/${id}`, { headers: getHeaders() })
    return handle(res, `Failed to fetch pooja with ID ${id}`)
  }

  const updatePooja = async (id, form, file) => {
    const uploaded = file ? await uploadAsset(file) : null

    // If you want to **replace** categories on every save, always send array.
    // If you want to leave categories unchanged unless user touched them,
    // gate it behind some flag. Here we send what’s in the form.
    const categoryIds =
      Array.isArray(form.categoryIds)
        ? form.categoryIds.map(Number).filter(Boolean)
        : undefined

    const body = {
      name: form.name?.trim?.(),
      priestIds: Array.isArray(form.priestIds) ? form.priestIds.map(Number).filter(Boolean) : undefined,

      // 🔴 FIX: send categories on UPDATE (replace set server-side)
      categoryIds,

      amount: form.amount != null ? Number(form.amount) : undefined,
      durationMin: form.durationMin != null ? Number(form.durationMin) : undefined,
      prepTimeMin: form.prepTimeMin != null ? Number(form.prepTimeMin) : undefined,
      bufferMin: form.bufferMin != null ? Number(form.bufferMin) : undefined,

      isInVenue: typeof form.isInVenue === 'boolean' ? form.isInVenue : undefined,
      isOutsideVenue: typeof form.isOutsideVenue === 'boolean' ? form.isOutsideVenue : undefined,

      date: toISO(form.date),
      time: toISOTime(form.date, form.time),

      venueId:
        (typeof form.isInVenue === 'boolean' && form.isInVenue)
          ? (form.venueId != null ? Number(form.venueId) : null)
          : (typeof form.venueId !== 'undefined' ? null : undefined),

      venueAddress:
        (typeof form.isOutsideVenue === 'boolean' && form.isOutsideVenue)
          ? (form.venueAddress ?? null)
          : (typeof form.venueAddress !== 'undefined' ? null : undefined),

      mapLink:
        (typeof form.isOutsideVenue === 'boolean' && form.isOutsideVenue)
          ? (form.mapLink ?? null)
          : (typeof form.mapLink !== 'undefined' ? null : undefined),

      allowedZones:
        (typeof form.isOutsideVenue === 'boolean' && form.isOutsideVenue)
          ? (Array.isArray(form.allowedZones)
              ? form.allowedZones
              : (form.allowedZones
                  ? String(form.allowedZones).split(',').map(z => z.trim()).filter(Boolean)
                  : []))
          : undefined,

      includeFood: typeof form.includeFood === 'boolean' ? form.includeFood : undefined,
      includeHall: typeof form.includeHall === 'boolean' ? form.includeHall : undefined,
      materials: form.materials ?? undefined,
      notes: form.notes ?? undefined,
      description: form.description ?? undefined,

      featuredMediaId: form.featuredMediaId ?? uploaded?.id ?? undefined,
      clearFeaturedMedia: form.clearFeaturedMedia ?? false,
    }

    const res = await fetch(`${apiBase}/pooja/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    return handle(res, 'Failed to update pooja')
  }

  const fetchPoojas = async () => {
    const res = await fetch(`${apiBase}/pooja`, { headers: getHeaders() })
    return handle(res, 'Failed to load poojas')
  }

  const deletePooja = async (id) => {
    const res = await fetch(`${apiBase}/pooja/${id}`, { method: 'DELETE', headers: getHeaders() })
    await handle(res, 'Failed to delete pooja')
    return true
  }

  return {
    // media
    uploadAsset,
    addToGallery,
    reorderGallery,
    removeFromGallery,
    // pooja
    fetchPoojas,
    getPoojaById,
    createPooja,
    updatePooja,
    deletePooja,
  }
}
