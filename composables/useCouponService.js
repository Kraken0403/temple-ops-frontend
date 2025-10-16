// composables/useCouponService.js
import { useRuntimeConfig, useCookie } from '#app'

export const useCouponService = () => {
  const cfg = useRuntimeConfig().public
  const base = (cfg.apiBase || '').replace(/\/+$/, '') // trim trailing slash
  const tokenRef = useCookie('token') // <-- ref; read per request

  const makeHeaders = () => {
    const t = tokenRef.value
    return {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    }
  }

  const qs = (obj = {}) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null || v === '') continue
      params.append(k, String(v))
    }
    const s = params.toString()
    return s ? `?${s}` : ''
  }

  const errorFrom = async (res) => {
    try {
      const data = await res.json()
      const msg =
        (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) ||
        data?.error ||
        res.statusText ||
        `HTTP ${res.status}`
      const err = new Error(msg)
      err.status = res.status
      err.payload = data
      return err
    } catch {
      const err = new Error(res.statusText || `HTTP ${res.status}`)
      err.status = res.status
      return err
    }
  }

  // ---------- Normalizer to make backend happy ----------
  const toNumOrNull = (v) => {
    if (v === '' || v === null || v === undefined) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const toISOOrNull = (v) => {
    if (!v && v !== 0) return null
    try {
      // accept Date, ISO, or 'YYYY-MM-DDTHH:mm' from <input type="datetime-local">
      const d = typeof v === 'string' && v.length === 16 && v.includes('T')
        ? new Date(v) // local -> convert to Date; backend expects UTC—your service converts
        : new Date(v)
      return isNaN(+d) ? null : d.toISOString()
    } catch {
      return null
    }
  }
  const asIntArray = (arr) => {
    if (!Array.isArray(arr)) return []
    return arr
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n))
  }

  const cleanCouponPayload = (p = {}) => {
    const type = String(p.type || '').toUpperCase()
    const isPercent = type === 'PERCENT'

    const payload = {
      // requireds
      code: String(p.code || '').trim().toUpperCase(),
      type,
      value: toNumOrNull(p.value),

      // optional numeric
      maxDiscount: isPercent ? toNumOrNull(p.maxDiscount) : null,
      minOrderAmount: toNumOrNull(p.minOrderAmount),

      // window
      startsAt: p.startsAt === '' ? null : toISOOrNull(p.startsAt),
      endsAt: p.endsAt === '' ? null : toISOOrNull(p.endsAt),

      // flags / limits
      isActive: !!p.isActive,
      stackable: !!p.stackable,
      usageLimit: toNumOrNull(p.usageLimit),
      usageLimitPerUser: toNumOrNull(p.usageLimitPerUser),

      // text
      description: p.description?.toString().trim() || null,

      // scopes (arrays)
      eventIds: asIntArray(p.eventIds || p.events),
      poojaIds: asIntArray(p.poojaIds || p.poojas),
      poojaCategoryIds: asIntArray(p.poojaCategoryIds || p.poojaCats),
    }

    // remove undefined keys (keep nulls—they mean "clear")
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k]
    })
    return payload
  }

  /* ───────────── Admin CRUD ───────────── */
  async function listCoupons({ page = 1, pageSize = 20, search = '', active } = {}) {
    const url = `${base}/coupons${qs({ page, pageSize, search, active })}`
    const res = await fetch(url, { headers: makeHeaders() })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }

  async function getCoupon(id) {
    const res = await fetch(`${base}/coupons/${id}`, { headers: makeHeaders() })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }

  async function createCoupon(payload) {
    const body = JSON.stringify(cleanCouponPayload(payload))
    const res = await fetch(`${base}/coupons`, {
      method: 'POST',
      headers: makeHeaders(),
      body,
    })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }

  async function updateCoupon(id, payload) {
    const body = JSON.stringify(cleanCouponPayload(payload))
    const res = await fetch(`${base}/coupons/${id}`, {
      method: 'PATCH',
      headers: makeHeaders(),
      body,
    })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }

  async function deleteCoupon(id) {
    const res = await fetch(`${base}/coupons/${id}`, {
      method: 'DELETE',
      headers: makeHeaders(),
    })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }

  /* ───────────── Public validate (for checkout UIs) ───────────── */
  async function validateCoupon(code, params) {
    const url = `${base}/coupons/validate/${encodeURIComponent(code)}${qs(params)}`
    const res = await fetch(url, { headers: makeHeaders() })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }

  /* ───────────── Option helpers (for checkbox pickers) ───────────── */
  // These expect you added the lite endpoints:
  // GET /admin/options/events-lite, /poojas-lite, /pooja-categories-lite
  async function listEventOptions() {
    const res = await fetch(`${base}/admin/options/events-lite`, { headers: makeHeaders() })
    if (!res.ok) throw await errorFrom(res)
    return res.json() // [{id, name}]
  }
  async function listPoojaOptions() {
    const res = await fetch(`${base}/admin/options/poojas-lite`, { headers: makeHeaders() })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }
  async function listPoojaCategoryOptions() {
    const res = await fetch(`${base}/admin/options/pooja-categories-lite`, { headers: makeHeaders() })
    if (!res.ok) throw await errorFrom(res)
    return res.json()
  }

  return {
    listCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    // options
    listEventOptions,
    listPoojaOptions,
    listPoojaCategoryOptions,
  }
}
