// composables/useSettingsService.js
import { useRuntimeConfig, useCookie } from '#app'

export const useSettingsService = () => {
  const { apiBase } = useRuntimeConfig().public
  const base = `${apiBase}/settings`

  const headers = () => {
    const t = useCookie('token').value
    const h = { 'Content-Type': 'application/json' }
    if (t) h.Authorization = `Bearer ${t}`
    return h
  }

  const safeJson = async (res) => {
    try { return await res.json() } catch { return null }
  }

  const parseOrThrow = async (res, fallbackMsg) => {
    const data = await safeJson(res)
    if (!res.ok) {
      const msg =
        Array.isArray(data?.message)
          ? data.message[0]
          : data?.message || data?.error || fallbackMsg || `HTTP ${res.status}`
      throw new Error(msg)
    }
    return data
  }

  // ✅ Guest-safe (no token required)
  const getSettings = async () => {
    const res = await fetch(base, { headers: headers() })
    return parseOrThrow(res, 'Failed to fetch settings')
  }

  // ✅ Admin-only typically (token required)
  const updateSettings = async (payload) => {
    const res = await fetch(base, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    })
    return parseOrThrow(res, 'Failed to update settings')
  }

  return { getSettings, updateSettings }
}
