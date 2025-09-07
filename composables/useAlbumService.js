// File: composables/useAlbumService.js
import { useRuntimeConfig, useCookie } from '#app'

export function useAlbumService() {
  const config = useRuntimeConfig().public
  const base   = config.apiBase
  const token  = useCookie('token').value

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}
  const json = { ...authHeader, 'Content-Type': 'application/json' }

  // READ: list albums (public)
  const listAlbums = async (params = {}) => {
    const qs = new URLSearchParams()
    if (params.q) qs.set('q', params.q)
    if (params.page) qs.set('page', String(params.page))
    if (params.pageSize) qs.set('pageSize', String(params.pageSize))

    const res = await fetch(`${base}/albums${qs.toString() ? `?${qs.toString()}` : ''}`)
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to load albums')
    return res.json()
  }

  // READ: by slug (public)
  const getAlbumBySlug = async (slug) => {
    const res = await fetch(`${base}/albums/${encodeURIComponent(slug)}`)
    if (!res.ok) throw new Error((await res.json()).message || 'Album not found')
    return res.json()
  }

  // CREATE
  const createAlbum = async (payload) => {
    const res = await fetch(`${base}/albums`, { method: 'POST', headers: json, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to create album')
    return res.json()
  }

  // UPDATE
  const updateAlbum = async (id, payload) => {
    const res = await fetch(`${base}/albums/${id}`, { method: 'PATCH', headers: json, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to update album')
    return res.json()
  }

  // DELETE
  const deleteAlbum = async (id) => {
    const res = await fetch(`${base}/albums/${id}`, { method: 'DELETE', headers: authHeader })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete album')
    return res.json()
  }

  // ITEMS: add
  const addItems = async (id, mediaIds) => {
    const res = await fetch(`${base}/albums/${id}/items`, {
      method: 'POST', headers: json, body: JSON.stringify({ mediaIds }),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to add items')
    return res.json() // returns updated album
  }

  // ITEMS: reorder
  const reorderItems = async (id, order) => {
    const res = await fetch(`${base}/albums/${id}/items/reorder`, {
      method: 'PATCH', headers: json, body: JSON.stringify({ order }),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to reorder')
    return res.json()
  }

  // ITEMS: remove
  const removeItem = async (id, itemId) => {
    const res = await fetch(`${base}/albums/${id}/items/${itemId}`, { method: 'DELETE', headers: authHeader })
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to remove item')
    return res.json()
  }

  return { listAlbums, getAlbumBySlug, createAlbum, updateAlbum, deleteAlbum, addItems, reorderItems, removeItem }
}
