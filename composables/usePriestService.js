import { useRuntimeConfig, useCookie } from '#app'

export const usePriestService = () => {
  const { apiBase } = useRuntimeConfig().public

  const getHeaders = () => {
    const t = useCookie('token').value
    return {
      Authorization: t ? `Bearer ${t}` : '',
      'Content-Type': 'application/json'
    }
  }

  const safeJson = async (res) => { try { return await res.json() } catch { return null } }
  const handle = async (res, msg) => {
    if (!res.ok) {
      const j = await safeJson(res)
      throw new Error(j?.message?.[0] || j?.message || msg || 'Request failed')
    }
    // always parse once
    return safeJson(res)
  }

  /* ───────── Media helpers ───────── */
  const uploadAsset = async (file) => {
    const t = useCookie('token').value
    const headers = t ? { Authorization: `Bearer ${t}` } : {}
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${apiBase}/media/upload`, { method: 'POST', headers, body: fd })
    return handle(res, 'Photo upload failed') // -> { id, url, filename, ... }
  }

  /* ───────── Priests ───────── */
  const fetchPriests = async () => {
    const res = await fetch(`${apiBase}/priest`, { headers: getHeaders() })
    return handle(res, 'Failed to load priests')
  }

  const fetchPriest = async (id) => {
    const res = await fetch(`${apiBase}/priest/${id}`, { headers: getHeaders() })
    return handle(res, `Failed to load priest with ID ${id}`)
  }

  // Create: include featuredMediaId directly in body (backend supports it)
  const createPriest = async (form, file) => {
    let uploaded = null
    if (file) uploaded = await uploadAsset(file)

    const body = {
      name: String(form.name || '').trim(),
      specialty: form.specialty?.trim?.() || null,
      email: form.email?.trim?.() || null,
      contactNo: form.contactNo?.trim?.() || null,
      address: form.address?.trim?.() || null,
      qualifications: Array.isArray(form.qualifications)
        ? form.qualifications
        : (form.qualifications || '').split(',').map(q => q.trim()).filter(Boolean),
      languages: Array.isArray(form.languages)
        ? form.languages
        : (form.languages || '').split(',').map(l => l.trim()).filter(Boolean),
      featuredMediaId: form.featuredMediaId ?? uploaded?.id ?? undefined,
      clearFeaturedMedia: form.clearFeaturedMedia ?? false,
    }

    const res = await fetch(`${apiBase}/priest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    return handle(res, 'Failed to create priest')
  }

  // Update: same idea
  const updatePriest = async (id, form, file) => {
    let uploaded = null
    if (file) uploaded = await uploadAsset(file)

    const body = {
      name: form.name?.trim?.(),
      specialty: form.specialty?.trim?.(),
      email: form.email?.trim?.(),
      contactNo: form.contactNo?.trim?.(),
      address: form.address?.trim?.(),
      qualifications: Array.isArray(form.qualifications)
        ? form.qualifications
        : (form.qualifications || '').split(',').map(q => q.trim()).filter(Boolean),
      languages: Array.isArray(form.languages)
        ? form.languages
        : (form.languages || '').split(',').map(l => l.trim()).filter(Boolean),
      featuredMediaId: form.featuredMediaId ?? uploaded?.id ?? undefined,
      clearFeaturedMedia: form.clearFeaturedMedia ?? false,
    }

    const res = await fetch(`${apiBase}/priest/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    })
    return handle(res, 'Failed to update priest')
  }

  /* ───────── Slots ───────── */
  const fetchSlots = async (priestId) => {
    const res = await fetch(`${apiBase}/priest/${priestId}/slots`, { headers: getHeaders() })
    return handle(res, 'Failed to load slots')
  }

  const createSlot = async (data) => {
    const res = await fetch(`${apiBase}/priest/slot`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handle(res, 'Slot creation failed')
  }

  const getSlotsByPriest = async (priestId) => {
    const res = await fetch(`${apiBase}/priest/${priestId}/slots`, { headers: getHeaders() })
    return handle(res, 'Failed to fetch slots')
  }

  const deleteSlot = async (slotId) => {
    const res = await fetch(`${apiBase}/priest/slot/${slotId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handle(res, 'Failed to delete slot')
  }

  const getAvailabilityForMultiplePriests = async (priestIds = []) => {
    const all = []
    for (const id of priestIds) {
      try {
        const res = await fetch(`${apiBase}/priest/${id}/slots`, { headers: getHeaders() })
        if (res.ok) {
          const slots = await res.json()
          all.push(...slots.filter(s => !s.disabled))
        }
      } catch {}
    }
    return all
  }

  const getAvailableChunks = async (priestId, bookingDate /* 'YYYY-MM-DD' */, totalMinutes) => {
    const url = new URL(`${apiBase}/priest/${encodeURIComponent(priestId)}/available-chunks`)
    url.searchParams.set('date', bookingDate)
    url.searchParams.set('duration', String(totalMinutes))
    const res = await fetch(url.toString(), { headers: getHeaders() })
    if (!res.ok) throw new Error(`Failed to load available chunks (${res.status})`)
    return res.json().catch(() => [])
  }

  return {
    // media
    uploadAsset,
    // priests
    fetchPriests,
    fetchPriest,
    createPriest,
    updatePriest,
    // slots
    fetchSlots,
    createSlot,
    getSlotsByPriest,
    deleteSlot,
    getAvailabilityForMultiplePriests,
    getAvailableChunks,
  }
}
