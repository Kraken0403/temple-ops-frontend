// File: composables/usePageService.js

import { useRuntimeConfig, useCookie } from '#app'

export function usePageService() {
  const config = useRuntimeConfig().public
  const token = useCookie('token').value
  const base  = config.apiBase
  const url   = `${base}/pages`

  const jsonHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Create a new page
  const createPage = async (form) => {
    const res = await fetch(url, {
      method:  'POST',
      headers: jsonHeaders,
      body:    JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to create page')
    }
    return res.json()
  }

  // Update an existing page
  const updatePage = async (id, form) => {
    const res = await fetch(`${url}/${id}`, {
      method:  'PATCH',
      headers: jsonHeaders,
      body:    JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to update page')
    }
    return res.json()
  }

  // List all pages
  const fetchPages = async () => {
    const res = await fetch(url, { headers: jsonHeaders })
    if (!res.ok) throw new Error('Failed to fetch pages')
    return res.json()
  }

  // Get one page by its ID
  const getPageById = async (id) => {
    const res = await fetch(`${url}/${id}`, { headers: jsonHeaders })
    if (!res.ok) throw new Error(`Failed to fetch page ${id}`)
    return res.json()
  }

  // (Optional) Get one page by its slug
  const getPageBySlug = async (slug) => {
    const res = await fetch(`${url}/by-slug/${slug}`, { headers: jsonHeaders })
    if (!res.ok) throw new Error(`Failed to fetch page with slug "${slug}"`)
    return res.json()
  }

  // Delete a page
  const deletePage = async (id) => {
    const res = await fetch(`${url}/${id}`, {
      method:  'DELETE',
      headers: jsonHeaders,
    })
    if (!res.ok) throw new Error(`Failed to delete page ${id}`)
    return true
  }

  return {
    createPage,
    updatePage,
    fetchPages,
    getPageById,
    getPageBySlug,
    deletePage,
  }
}
