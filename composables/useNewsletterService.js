// composables/useNewsletterService.js
import { useRuntimeConfig, useCookie } from '#app'

export function useNewsletterService() {
  const { apiBase } = useRuntimeConfig().public

  /* ───────────────────────────── Helpers ───────────────────────────── */

  const getHeaders = () => {
    const t = useCookie('token').value
    return {
      Authorization: t ? `Bearer ${t}` : '',
      'Content-Type': 'application/json',
    }
  }

  const safeJson = async (res) => {
    try {
      return await res.json()
    } catch {
      return null
    }
  }

  const handle = async (res, msg) => {
    if (!res.ok) {
      const j = await safeJson(res)
      throw new Error(j?.message || msg || 'Request failed')
    }
    return safeJson(res)
  }

  /* ───────────────────────────── PUBLIC ───────────────────────────── */

  const subscribe = async ({ email, source }) => {
    const res = await fetch(`${apiBase}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // 👈 no auth for public
      body: JSON.stringify({ email, source }),
    })
    return handle(res, 'Failed to subscribe to newsletter')
  }

  /* ───────────────────────────── ADMIN ───────────────────────────── */

  const fetchSubscribers = async () => {
    const res = await fetch(`${apiBase}/newsletter/subscribers`, {
      headers: getHeaders(),
    })
    return handle(res, 'Failed to fetch newsletter subscribers')
  }

  const unsubscribe = async (id) => {
    const res = await fetch(
      `${apiBase}/newsletter/subscribers/${id}/unsubscribe`,
      {
        method: 'PATCH',
        headers: getHeaders(),
      },
    )
    return handle(res, 'Failed to unsubscribe user')
  }

  return {
    subscribe,
    fetchSubscribers,
    unsubscribe,
  }
}
