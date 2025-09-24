// ~/composables/usePoojaCategoryService.js
import { useRuntimeConfig, useCookie } from '#app'

export const usePoojaCategoryService = () => {
  const config = useRuntimeConfig().public
  const base   = config.apiBase

  const buildHeaders = () => {
    const token = useCookie('token').value
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }

  const safeJson = async (res) => {
    if (res.status === 204) return null // No Content
    try { return await res.json() } catch { return null }
  }
  const handle = async (res, fallbackMsg) => {
    if (!res.ok) {
      const j = await safeJson(res)
      const msg = j?.message || fallbackMsg || 'Request failed'
      throw new Error(Array.isArray(msg) ? msg[0] : msg)
    }
    return safeJson(res)
  }

  // ─────────────────────────────────────────────
  // Categories CRUD
  // ─────────────────────────────────────────────

  const fetchCategories = async () => {
    const res = await fetch(`${base}/pooja-category`, { headers: buildHeaders() })
    return handle(res, 'Failed to load categories')
  }

  const getCategoryById = async (id) => {
    const res = await fetch(`${base}/pooja-category/${id}`, { headers: buildHeaders() })
    return handle(res, `Failed to load category ${id}`)
  }

  const createCategory = async (payload /* { name, slug?, description?, isActive? } */) => {
    const res = await fetch(`${base}/pooja-category`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    })
    return handle(res, 'Failed to create category')
  }

  const updateCategory = async (id, payload /* { name?, slug?, description?, isActive? } */) => {
    const res = await fetch(`${base}/pooja-category/${id}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    })
    return handle(res, `Failed to update category ${id}`)
  }

  const deleteCategory = async (id) => {
    const res = await fetch(`${base}/pooja-category/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })
    await handle(res, `Failed to delete category ${id}`)
    return true
  }

  // Optional (only if you add a slug route in your controller)
  const getCategoryBySlug = async (slug) => {
    const res = await fetch(`${base}/pooja-category/slug/${encodeURIComponent(slug)}`, {
      headers: buildHeaders(),
    })
    return handle(res, `Failed to load category ${slug}`)
  }

  // ─────────────────────────────────────────────
  // Pooja <-> Categories helper (PATCH /pooja/:id { categoryIds })
  // ─────────────────────────────────────────────
  const assignCategoriesToPooja = async (poojaId, categoryIds = []) => {
    const ids = (categoryIds || []).map(Number).filter((n) => Number.isFinite(n))
    const res = await fetch(`${base}/pooja/${poojaId}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ categoryIds: ids }),
    })
    return handle(res, 'Failed to assign categories to pooja')
  }

  return {
    fetchCategories,
    getCategoryById,
    getCategoryBySlug, // only if backend route exists
    createCategory,
    updateCategory,
    deleteCategory,
    assignCategoriesToPooja,
  }
}
