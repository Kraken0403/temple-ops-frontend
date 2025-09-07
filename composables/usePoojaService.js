// File: composables/usePoojaService.js
import { useRuntimeConfig, useCookie } from '#app'

export const usePoojaService = () => {
  const config = useRuntimeConfig().public
  const token = useCookie('token').value

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const fetchPoojas = async () => {
    const res = await fetch(config.apiBase + '/pooja', { headers })
    if (!res.ok) throw new Error('Failed to load poojas')
    return await res.json()
  }

  const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(config.apiBase + '/pooja/upload-photo', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) throw new Error('Photo upload failed')
    const data = await res.json()
    return data.url
  }

  const createPooja = async (form, file) => {
    let photoUrl = null
    if (file) photoUrl = await uploadPhoto(file)

    const body = {
      ...form,
      priestIds: form.priestIds.map(Number),
      amount: Number(form.amount),
      durationMin: Number(form.durationMin),
      prepTimeMin: Number(form.prepTimeMin),
      bufferMin: Number(form.bufferMin),
      isInVenue: Boolean(form.isInVenue),
      isOutsideVenue: Boolean(form.isOutsideVenue),
      includeFood: Boolean(form.includeFood),
      includeHall: Boolean(form.includeHall),
      photoUrl: photoUrl ?? null,
      materials: form.materials || null,
      notes: form.notes || null
    }

    if (form.isInVenue) {
      body.date = form.date ? new Date(form.date).toISOString() : null
      body.time = form.time ? new Date(`${form.date}T${form.time}`).toISOString() : null
    }

    if (form.isOutsideVenue && form.allowedZones) {
      body.allowedZones = form.allowedZones
        .split(',')
        .map(z => z.trim())
        .filter(Boolean)
    }

    const res = await fetch(config.apiBase + '/pooja', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message?.[0] || 'Failed to create pooja')
    }
    return await res.json()
  }

  const getPoojaById = async (id) => {
    const res = await fetch(`${config.apiBase}/pooja/${id}`, { headers })
    if (!res.ok) throw new Error(`Failed to fetch pooja with ID ${id}`)
    return await res.json()
  }

  const updatePooja = async (id, form, file) => {
    let photoUrl = form.photoUrl || null
    if (file) photoUrl = await uploadPhoto(file)

    const body = {
      ...form,
      priestIds: form.priestIds.map(Number),
      amount: Number(form.amount),
      durationMin: Number(form.durationMin),
      prepTimeMin: Number(form.prepTimeMin),
      bufferMin: Number(form.bufferMin),
      isInVenue: Boolean(form.isInVenue),
      isOutsideVenue: Boolean(form.isOutsideVenue),
      includeFood: Boolean(form.includeFood),
      includeHall: Boolean(form.includeHall),
      photoUrl: photoUrl ?? null,
      materials: form.materials || null,
      notes: form.notes || null
    }

    if (form.isInVenue) {
      body.date = form.date ? new Date(form.date).toISOString() : null
      body.time = form.time ? new Date(`${form.date}T${form.time}`).toISOString() : null
    }

    if (form.isOutsideVenue && form.allowedZones) {
      body.allowedZones = Array.isArray(form.allowedZones)
        ? form.allowedZones
        : form.allowedZones.split(',').map(z => z.trim()).filter(Boolean)
    }

    const res = await fetch(`${config.apiBase}/pooja/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message?.[0] || 'Failed to update pooja')
    }
    return await res.json()
  }

  // 🆕 Delete pooja (backend blocks if bookings exist)
  const deletePooja = async (id) => {
    const res = await fetch(`${config.apiBase}/pooja/${id}`, {
      method: 'DELETE',
      headers,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to delete pooja')
    }
    return true
  }

  return {
    uploadPhoto,
    createPooja,
    fetchPoojas,
    getPoojaById,
    updatePooja,
    deletePooja,      // ← export it
  }
}
