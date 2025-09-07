import { useRuntimeConfig, useCookie } from '#app'

export const useSettingsService = () => {
  const config = useRuntimeConfig().public
  const token = useCookie('token').value

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const getSettings = async () => {
    const res = await fetch(`${config.apiBase}/settings`, { headers })
    if (!res.ok) throw new Error('Failed to fetch settings')
    return await res.json()
  }

  const updateSettings = async (payload) => {
    const res = await fetch(`${config.apiBase}/settings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to update settings')
    }

    return await res.json()
  }

  return {
    getSettings,
    updateSettings
  }
}
