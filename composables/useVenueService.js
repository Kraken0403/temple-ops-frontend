import { useRuntimeConfig, useCookie } from '#app'

export function useVenueService() {
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
      throw new Error(j?.message || msg || 'Request failed')
    }
    return safeJson(res)
  }

  const fetchVenues = async () => {
    const res = await fetch(`${apiBase}/venues`, { headers: getHeaders() })
    return handle(res, 'Failed to load venues')
  }

  const createVenue = async (payload) => {
    const res = await fetch(`${apiBase}/venues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
    return handle(res, 'Failed to create venue')
  }

  const updateVenue = async (id, payload) => {
    const res = await fetch(`${apiBase}/venues/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
    return handle(res, 'Failed to update venue')
  }

  const deleteVenue = async (id) => {
    const res = await fetch(`${apiBase}/venues/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return handle(res, 'Failed to delete venue')
  }

  return { fetchVenues, createVenue, updateVenue, deleteVenue }
}
