// /composables/useMediaUrl.js
import { useRuntimeConfig } from '#app'

export const useMediaUrl = () => {
  const cfg = useRuntimeConfig()
  const apiBase = cfg?.public?.apiBase || ''
  let origin = ''
  try {
    origin = new URL(apiBase).origin // e.g. http://localhost:3000
  } catch {
    origin = ''
  }

  const normalizeUploads = (p) => {
    // collapse duplicate slashes around /uploads/
    return String(p).replace(/(\/)+uploads\//g, '/uploads/')
  }

  // Make absolute URL and prevent /uploads/uploads
  const toAbs = (u) => {
    if (!u) return ''
    if (/^https?:\/\//i.test(u)) return u // external/CDN
    let p = u.startsWith('/') ? u : `/${u}`
    p = normalizeUploads(p)
    return origin ? `${origin}${p}` : p
  }

  // Save-friendly: if same-origin absolute, strip origin; keep externals absolute
  const toRel = (u) => {
    if (!u) return ''
    if (/^https?:\/\//i.test(u)) {
      if (origin && u.startsWith(origin)) {
        u = u.slice(origin.length)
      } else {
        return u // external absolute → leave as-is
      }
    }
    let p = u.startsWith('/') ? u : `/${u}`
    return normalizeUploads(p)
  }

  return { toAbs, toRel, origin }
}
