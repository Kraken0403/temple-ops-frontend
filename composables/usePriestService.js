// composables/usePriestService.js
import { useRuntimeConfig, useCookie } from '#app'

export const usePriestService = () => {
  const { apiBase } = useRuntimeConfig().public

  // Always read the cookie when making a request (avoid stale token)
  const getHeaders = () => {
    const t = useCookie('token').value
    return {
      Authorization: t ? `Bearer ${t}` : '',
      'Content-Type': 'application/json'
    }
  }

  const safeJson = async (res) => {
    let data
    try { data = await res.json() } catch { /* noop */ }
    return data
  }

  // ───────── Priests ─────────

  const fetchPriests = async () => {
    const res = await fetch(`${apiBase}/priest`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to load priests')
    return await res.json()
  }

  const fetchPriest = async (id) => {
    const res = await fetch(`${apiBase}/priest/${id}`, { headers: getHeaders() })
    if (!res.ok) throw new Error(`Failed to load priest with ID ${id}`)
    return await res.json()
  }

  const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${apiBase}/priest/upload-photo`, {
      method: 'POST',
      headers: { Authorization: getHeaders().Authorization }, // no content-type for FormData
      body: formData
    })
    if (!res.ok) throw new Error('Photo upload failed')
    const data = await res.json()
    return data.url
  }

  const createPriest = async (form, file) => {
    let photo = null
    if (file) photo = await uploadPhoto(file)
    const body = {
      ...form,
      photo: photo ?? null,
      qualifications: Array.isArray(form.qualifications)
        ? form.qualifications
        : form.qualifications?.split(',').map(q => q.trim()) || [],
      languages: Array.isArray(form.languages)
        ? form.languages
        : form.languages?.split(',').map(l => l.trim()) || []
    }
    const res = await fetch(`${apiBase}/priest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.message?.[0] || 'Failed to create priest')
    }
    return await res.json()
  }

  const updatePriest = async (id, form, file) => {
    let photo = form.photo || null
    if (file) photo = await uploadPhoto(file)
    const body = {
      ...form,
      photo,
      qualifications: Array.isArray(form.qualifications)
        ? form.qualifications
        : form.qualifications?.split(',').map(q => q.trim()) || [],
      languages: Array.isArray(form.languages)
        ? form.languages
        : form.languages?.split(',').map(l => l.trim()) || []
    }
    const res = await fetch(`${apiBase}/priest/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err?.message?.[0] || 'Failed to update priest')
    }
    return await res.json()
  }

  // ───────── Slots ─────────

  const fetchSlots = async (priestId) => {
    const res = await fetch(`${apiBase}/priest/${priestId}/slots`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to load slots')
    return await res.json()
  }

  const createSlot = async (data) => {
    const res = await fetch(`${apiBase}/priest/slot`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      let errorText
      try { errorText = (await res.json())?.message || await res.text() } catch { errorText = await res.text() }
      console.error('❌ Slot creation failed:', res.status, errorText)
      throw new Error(errorText || 'Slot creation failed')
    }
    return await res.json()
  }

  const getSlotsByPriest = async (priestId) => {
    const res = await fetch(`${apiBase}/priest/${priestId}/slots`, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch slots')
    return await res.json()
  }

  const deleteSlot = async (slotId) => {
    const res = await fetch(`${apiBase}/priest/slot/${slotId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    if (!res.ok) throw new Error('Failed to delete slot')
    return await res.json()
  }

  const getAvailabilityForMultiplePriests = async (priestIds = []) => {
    const allSlots = []
    for (const id of priestIds) {
      try {
        const res = await fetch(`${apiBase}/priest/${id}/slots`, { headers: getHeaders() })
        if (res.ok) {
          const slots = await res.json()
          allSlots.push(...slots.filter(s => !s.disabled))
        }
      } catch (err) {
        console.error(`❌ Failed to fetch slots for priest ${id}`, err)
      }
    }
    return allSlots
  }

  // ✅ FIXED: correct param names + auth header
// composables/usePriestService.js
const getAvailableChunks = async (priestId, bookingDate /* 'YYYY-MM-DD' */, totalMinutes) => {
  const { public: { apiBase } } = useRuntimeConfig()
  const token = useCookie('token').value
  const headers = {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  }

  const url = new URL(`${apiBase}/priest/${encodeURIComponent(priestId)}/available-chunks`)
  url.searchParams.set('date', bookingDate)                 // <-- controller expects 'date'
  url.searchParams.set('duration', String(totalMinutes))    // <-- and 'duration'

  console.debug('[chunks] GET', url.toString())

  const res = await fetch(url.toString(), { headers })
  const text = await res.text().catch(() => '')
  if (!res.ok) {
    console.error('[chunks] HTTP', res.status, text)
    throw new Error(`Failed to load available chunks (${res.status})`)
  }

  try { return JSON.parse(text) } catch { return [] }
}

  

  return {
    fetchPriests,
    fetchPriest,
    uploadPhoto,
    createPriest,
    updatePriest,
    fetchSlots,
    createSlot,
    getSlotsByPriest,
    deleteSlot,
    getAvailabilityForMultiplePriests,
    getAvailableChunks
  }
}
