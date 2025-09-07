import { useRuntimeConfig, useCookie } from '#app'

export const usePriestService = () => {
  const config = useRuntimeConfig().public
  const token = useCookie('token').value

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  // Fetch all priests
  const fetchPriests = async () => {
    const res = await fetch(`${config.apiBase}/priest`, { headers })
    if (!res.ok) throw new Error('Failed to load priests')
    return await res.json()
  }

  // Fetch single priest by ID
  const fetchPriest = async (id) => {
    const res = await fetch(`${config.apiBase}/priest/${id}`, { headers })
    if (!res.ok) throw new Error(`Failed to load priest with ID ${id}`)
    return await res.json()
  }

  // Upload priest photo
  const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${config.apiBase}/priest/upload-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    })

    if (!res.ok) throw new Error('Photo upload failed')
    const data = await res.json()
    return data.url
  }

  // Create new priest
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
  
    const res = await fetch(`${config.apiBase}/priest`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
  
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message?.[0] || 'Failed to create priest')
    }
  
    return await res.json()
  }
  

  // Update priest
  const updatePriest = async (id, form, file) => {
    let photo = form.photo || null
    if (file) photo = await uploadPhoto(file)

    const body = {
      ...form,
      photo: photo,
      qualifications: form.qualifications?.split(',').map(q => q.trim()) || [],
      languages: form.languages?.split(',').map(l => l.trim()) || []
    }

    const res = await fetch(`${config.apiBase}/priest/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message?.[0] || 'Failed to update priest')
    }

    return await res.json()
  }

  // Fetch slots
  const fetchSlots = async (priestId) => {
    const res = await fetch(`${config.apiBase}/priest/${priestId}/slots`, { headers })
    if (!res.ok) throw new Error('Failed to load slots')
    return await res.json()
  }

  // Create slot
  const createSlot = async (data) => {
    const res = await fetch(`${config.apiBase}/priest/slot`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
  
    if (!res.ok) {
      // grab whatever the server sent back
      let errorText
      try {
        const errJson = await res.json()
        errorText = errJson.message || JSON.stringify(errJson)
      } catch {
        errorText = await res.text()
      }
      console.error('❌ Slot creation failed:', res.status, errorText)
      throw new Error(errorText || 'Slot creation failed')
    }
  
    return await res.json()
  }
  
    // ✅ Get slots by priest
    const getSlotsByPriest = async (priestId) => {
      const res = await fetch(`${config.apiBase}/priest/${priestId}/slots`, {
        headers
      })
  
      if (!res.ok) throw new Error('Failed to fetch slots')
      return await res.json()
    }
  
    // ✅ Delete slot
    const deleteSlot = async (slotId) => {
      const res = await fetch(`${config.apiBase}/priest/slot/${slotId}`, {
        method: 'DELETE',
        headers
      })
  
      if (!res.ok) throw new Error('Failed to delete slot')
      return await res.json()
    }

    // Get merged available slots from multiple priests
    const getAvailabilityForMultiplePriests = async (priestIds = []) => {
      const allSlots = []

      for (const id of priestIds) {
        try {
          const res = await fetch(`${config.apiBase}/priest/${id}/slots`, { headers })
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

    const getAvailableChunks = async (priestId, date, duration) => {
      const res = await fetch(
        `${config.apiBase}/priest/${priestId}/available-chunks?date=${date}&duration=${duration}`
      )
  
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Failed to fetch available chunks:', errorText)
        throw new Error('Failed to fetch available chunks')
      }
  
      return await res.json()
    }
    
    


  return {
    fetchPriests,
    fetchPriest,
    uploadPhoto,
    createPriest,
    updatePriest,
    createSlot,
    getSlotsByPriest,
    deleteSlot,
    fetchSlots,
    getAvailabilityForMultiplePriests,
    getAvailableChunks
  }
}
