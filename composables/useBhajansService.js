// /composables/useBhajansService.js
import { useRuntimeConfig, useCookie } from '#app'

export const useBhajansService = () => {
  const { apiBase } = useRuntimeConfig().public
  const token = useCookie('token').value

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const safeJson = async (res) => { try { return await res.json() } catch { return null } }
  const handle = async (res, fallback) => {
    if (!res.ok) {
      const j = await safeJson(res)
      const msg = j?.message || j?.error || fallback || `HTTP ${res.status}`
      throw new Error(msg)
    }
    return safeJson(res)
  }

  const list = async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== ''))
    ).toString()
    const res = await fetch(`${apiBase}/bhajans${qs ? `?${qs}` : ''}`, { headers })
    return handle(res, 'Failed to load bhajans')
  }

  const bySlug = async (slug) => {
    const res = await fetch(`${apiBase}/bhajans/${encodeURIComponent(slug)}`, { headers })
    return handle(res, 'Bhajan not found')
  }

  // Admin
  const create = async (payload) => {
    const res = await fetch(`${apiBase}/bhajans`, { method: 'POST', headers, body: JSON.stringify(payload) })
    return handle(res, 'Failed to create bhajan')
  }
  const update = async (id, payload) => {
    const res = await fetch(`${apiBase}/bhajans/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
    return handle(res, 'Failed to update bhajan')
  }
  const remove = async (id) => {
    const res = await fetch(`${apiBase}/bhajans/${id}`, { method: 'DELETE', headers })
    return handle(res, 'Failed to delete bhajan')
  }

  return { list, bySlug, create, update, remove }
}
