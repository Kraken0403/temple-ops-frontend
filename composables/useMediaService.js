// composables/useMediaService.js
import { useRuntimeConfig, useCookie } from '#app'

export function useMediaService() {
  const config = useRuntimeConfig().public
  const apiBase = config.apiBase                       // e.g. http://localhost:3000/api/v1
  const origin = apiBase.replace(/\/api\/v1\/?$/, '')  // e.g. http://localhost:3000

  // read a fresh token every call (prevents stale auth after login/logout)
  const authHeaders = () => {
    const token = useCookie('token').value
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const isHttpUrl = (p) => typeof p === 'string' && /^https?:\/\//i.test(p)

  async function parse(res) {
    try { return await res.json() } catch { return null }
  }
  async function handle(res, fallbackMsg = 'Request failed') {
    if (!res.ok) {
      const j = await parse(res)
      const msg = j?.message || j?.error || fallbackMsg
      throw new Error(Array.isArray(msg) ? msg[0] : msg)
    }
    return parse(res)
  }

  // Build absolute URL to a media file served from the backend.
  // Accepts:
  //   - "uploads/abc.jpg"
  //   - "/uploads/abc.jpg"
  //   - "/api/v1/uploads/abc.jpg"
  //   - "http(s)://.../whatever.jpg"
  const fullUrl = (p) => {
    if (!p) return ''
    if (isHttpUrl(p)) return p

    let rel = String(p)

    // Normalize any /api/v1/uploads to /uploads (in case API returns it that way)
    rel = rel.replace(/\/api\/v1\/uploads/gi, '/uploads')

    // Ensure single leading slash
    if (!rel.startsWith('/')) rel = `/${rel}`

    return `${origin}${rel}`
  }

  // Given a string path or an asset-like object { url, updatedAt, createdAt, sizeBytes }
  // return an absolute URL with cache-busting ?v= param.
  const previewUrl = (pOrAsset) => {
    if (!pOrAsset) return ''
    if (typeof pOrAsset === 'string') {
      const base = fullUrl(pOrAsset)
      return base
    }

    const url = pOrAsset.url || ''
    const base = fullUrl(url)
    // choose a stable-ish version for cache-busting
    const ver = pOrAsset.updatedAt || pOrAsset.updated_at || pOrAsset.createdAt || pOrAsset.sizeBytes || Date.now()
    if (!base) return ''
    return `${base}${base.includes('?') ? '&' : '?'}v=${encodeURIComponent(ver)}`
  }

  // List/paginate/search media
  const listMedia = async ({ q = '', page = 1, pageSize = 40, rescan = false } = {}) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (page) qs.set('page', String(page))
    if (pageSize) qs.set('pageSize', String(pageSize))
    if (rescan) qs.set('rescan', '1')

    const res = await fetch(
      `${apiBase}/media${qs.toString() ? `?${qs.toString()}` : ''}`,
      { headers: authHeaders() }
    )
    return handle(res, 'Failed to load media')
  }

  // Upload a file -> returns created MediaAsset (id, url, filename, ...)
  const uploadMedia = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${apiBase}/media/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd
    })
    return handle(res, 'Upload failed')
  }

  // Fetch specific assets by IDs (array)
  const getByIds = async (ids = []) => {
    if (!ids.length) return []
    const qs = new URLSearchParams({ ids: ids.join(',') })
    const res = await fetch(`${apiBase}/media/by-ids?${qs.toString()}`, {
      headers: authHeaders()
    })
    return handle(res, 'Failed to fetch media by ids')
  }

  // Delete a media asset (server should block if it's in use)
  const deleteMedia = async (id) => {
    const res = await fetch(`${apiBase}/media/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return handle(res, 'Failed to delete media')
  }

  // Where is this media used? (featured/gallery counts)
  const getUsage = async (id) => {
    const res = await fetch(`${apiBase}/media/${id}/usage`, {
      headers: authHeaders()
    })
    return handle(res, 'Failed to fetch usage')
  }

  // Lightweight normalizer if you need to coerce random shapes to an asset shape
  const asAsset = (x) => {
    if (!x) return null
    if (typeof x === 'string') return { id: undefined, url: x, filename: x.split('/').pop() }
    const { id, url, filename } = x
    return { id, url, filename }
  }

  return {
    listMedia,
    uploadMedia,
    getByIds,
    deleteMedia,
    getUsage,
    fullUrl,
    previewUrl,
    asAsset,
  }
}
