// composables/useMediaService.js
import { useRuntimeConfig, useCookie } from '#app'

export function useMediaService() {
  const config = useRuntimeConfig().public
  const base   = config.apiBase
  const token  = useCookie('token').value
  const auth   = token ? { Authorization: `Bearer ${token}` } : {}

  const listMedia = async ({ q = '', page = 1, pageSize = 40, rescan = false } = {}) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (page) qs.set('page', String(page))
    if (pageSize) qs.set('pageSize', String(pageSize))
    if (rescan) qs.set('rescan', '1')
    const res = await fetch(`${base}/media${qs.toString() ? `?${qs.toString()}` : ''}`, { headers: auth })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to load media')
    return res.json()
  }

  const uploadMedia = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${base}/media/upload`, { method: 'POST', headers: auth, body: fd })
    if (!res.ok) throw new Error((await res.json()).message || 'Upload failed')
    return res.json() // { id, url, filename, ... }
  }

  const fullUrl = (p) => (p?.startsWith?.('http') ? p : `${base}${p || ''}`)

  return { listMedia, uploadMedia, fullUrl }
}
