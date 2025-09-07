// File: composables/useDonationService.js
import { useRuntimeConfig, useCookie } from '#app'

export function useDonationService() {
  const config = useRuntimeConfig().public
  const token  = useCookie('token').value
  const base   = config.apiBase

  const jsonHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // ─── Donation Items ────────────────────────────────────────────────────────────

  /** GET /donation-items */
  const listItems = async () => {
    const res = await fetch(`${base}/donation-items`, { headers: jsonHeaders })
    if (!res.ok) throw new Error('Failed to fetch donation items')
    return res.json()
  }

  /** GET /donation-items/:id */
  const getItemById = async (id) => {
    const res = await fetch(`${base}/donation-items/${id}`, { headers: jsonHeaders })
    if (!res.ok) throw new Error(`Failed to fetch donation item ${id}`)
    return res.json()
  }

  /** POST /donation-items */
  const createItem = async (data) => {
    const res = await fetch(`${base}/donation-items`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err.message || 'Failed to create donation item')
    }
    return res.json()
  }

  /** PATCH /donation-items/:id */
  const updateItem = async (id, data) => {
    const res = await fetch(`${base}/donation-items/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err.message || `Failed to update donation item ${id}`)
    }
    return res.json()
  }

  /** DELETE /donation-items/:id */
  const removeItem = async (id) => {
    const res = await fetch(`${base}/donation-items/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders,
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err.message || `Failed to delete donation item ${id}`)
    }
    // some backends return 200 with JSON; others 204 no content
    return tryJsonOrTrue(res)
  }

  // ─── Donation Records ──────────────────────────────────────────────────────────

  /** GET /donations */
  const listRecords = async () => {
    const res = await fetch(`${base}/donations`, { headers: jsonHeaders })
    if (!res.ok) throw new Error('Failed to fetch donations')
    return res.json()
  }

  /** GET /donations/:id */
  const getRecordById = async (id) => {
    const res = await fetch(`${base}/donations/${id}`, { headers: jsonHeaders })
    if (!res.ok) throw new Error(`Failed to fetch donation ${id}`)
    return res.json()
  }

  /** POST /donations */
  const createRecord = async (data) => {
    const res = await fetch(`${base}/donations`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err.message || 'Failed to record donation')
    }
    return res.json()
  }

  /** PATCH /donations/:id */
  const updateRecord = async (id, data) => {
    const res = await fetch(`${base}/donations/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err.message || `Failed to update donation ${id}`)
    }
    return res.json()
  }

  /** DELETE /donations/:id */
  const removeRecord = async (id) => {
    const res = await fetch(`${base}/donations/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders,
    })
    if (!res.ok) {
      const err = await safeJson(res)
      throw new Error(err.message || `Failed to delete donation ${id}`)
    }
    return tryJsonOrTrue(res)
  }

  // ─── helpers ───────────────────────────────────────────────────────────────────
  async function safeJson(res) {
    try {
      return await res.json()
    } catch {
      return {}
    }
  }
  async function tryJsonOrTrue(res) {
    try {
      return await res.json()
    } catch {
      return true
    }
  }

  return {
    // Donation Items
    listItems,
    getItemById,
    createItem,
    updateItem,
    removeItem,

    // Donation Records
    listRecords,
    getRecordById,
    createRecord,
    updateRecord,
    removeRecord,
  }
}
