// composables/useStaticPages.js
import { useRuntimeConfig, useCookie } from '#app'

export const useStaticPages = () => {
  const config = useRuntimeConfig().public
  const token  = useCookie('token').value

  // Build headers dynamically
  const buildHeaders = () => {
    const h = {}
    if (token) h.Authorization = `Bearer ${token}`
    return h
  }

  // --- Fetch single page
  const fetchPage = async (slug) => {
    const res = await fetch(`${config.apiBase}/static-pages/${slug}`, {
      method: 'GET',
      headers: buildHeaders()
    })
    if (!res.ok) throw new Error(`Failed to fetch page: ${slug}`)
    return await res.json()
  }

  // --- Fetch all (only if backend supports it)
  const fetchAllPages = async () => {
    const res = await fetch(`${config.apiBase}/static-pages`, {
      method: 'GET',
      headers: buildHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch all static pages')
    return await res.json()
  }

  // --- Create (only if backend supports it)
  const createPage = async (slug, content) => {
    const res = await fetch(`${config.apiBase}/static-pages`, {
      method: 'POST',
      headers: {
        ...buildHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ slug, content })
    })
    if (!res.ok) throw new Error('Failed to create page')
    return await res.json()
  }

  // --- Update
  const updatePage = async (slug, content) => {
    const res = await fetch(`${config.apiBase}/static-pages/${slug}`, {
      method: 'PUT',
      headers: {
        ...buildHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    })
    if (!res.ok) throw new Error(`Failed to update page: ${slug}`)
    return await res.json()
  }

  // --- ✅ Upload photo (new helper)
  const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${config.apiBase}/static-pages/upload-photo`, {
      method: 'POST',
      headers: buildHeaders(), // don't set Content-Type manually → browser will add boundary
      body: formData
    })
    if (!res.ok) throw new Error('Failed to upload photo')
    return await res.json() // { url: "/uploads/..." }
  }

  return {
    fetchPage,
    fetchAllPages,
    createPage,
    updatePage,
    uploadPhoto // <--- now available to all editors
  }
}
