// File: composables/useEventsService.js

import { useRuntimeConfig, useCookie } from '#app'

export function useEventsService() {
  const config = useRuntimeConfig().public
  const token = useCookie('token').value
  const base = config.apiBase

  const jsonHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // 1️⃣ Upload image and get back { url }
  const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${base}/events/upload-photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!res.ok) throw new Error('Event image upload failed')
    const { url } = await res.json()
    return url
  }

  // 2️⃣ Create event (with optional image file)
  const createEvent = async (form, file) => {
    let imageUrl = form.imageUrl || null
    if (file) {
      imageUrl = await uploadPhoto(file)
    }

    const body = {
      ...form,
      imageUrl,
      date: new Date(form.date).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      startTime: form.startTime
        ? new Date(`${form.date}T${form.startTime}`).toISOString()
        : undefined,
      endTime: form.endTime
        ? new Date(`${form.date}T${form.endTime}`).toISOString()
        : undefined,
      tags: form.tags,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      price: form.price ? Number(form.price) : undefined,
      currency: form.currency,
      organizer: form.organizer,
      contactInfo: form.contactInfo,
      isPublic: Boolean(form.isPublic),
    }

    const res = await fetch(`${base}/events`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to create event')
    }
    return res.json()
  }

  // 3️⃣ Update event (with optional new image file)
  const updateEvent = async (id, form, file) => {
    let imageUrl = form.imageUrl || null
    if (file) {
      imageUrl = await uploadPhoto(file)
    }

    const body = {
      ...form,
      imageUrl,
      date: new Date(form.date).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      startTime: form.startTime
        ? new Date(`${form.date}T${form.startTime}`).toISOString()
        : undefined,
      endTime: form.endTime
        ? new Date(`${form.date}T${form.endTime}`).toISOString()
        : undefined,
      tags: form.tags,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      price: form.price ? Number(form.price) : undefined,
      currency: form.currency,
      organizer: form.organizer,
      contactInfo: form.contactInfo,
      isPublic: Boolean(form.isPublic),
    }

    const res = await fetch(`${base}/events/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to update event')
    }
    return res.json()
  }

  // 4️⃣ Standard CRUD
  const fetchEvents = async () => {
    const res = await fetch(`${base}/events`, { headers: jsonHeaders })
    if (!res.ok) throw new Error('Failed to fetch events')
    return res.json()
  }

  const getEventById = async (id) => {
    const res = await fetch(`${base}/events/${id}`, { headers: jsonHeaders })
    if (!res.ok) throw new Error(`Failed to fetch event ${id}`)
    return res.json()
  }

  const deleteEvent = async (id) => {
    const res = await fetch(`${base}/events/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders,
    })
    if (!res.ok) throw new Error(`Failed to delete event ${id}`)
    return true
  }

  return {
    uploadPhoto,
    createEvent,
    updateEvent,
    fetchEvents,
    getEventById,
    deleteEvent,
  }
}
