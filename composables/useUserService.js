// composables/useUserService.js
import { useRuntimeConfig, useCookie } from '#app'

export const useUserService = () => {
  const config = useRuntimeConfig().public
  const token  = useCookie('token').value

  const headers = {
    'Content-Type':  'application/json',
    Authorization:   `Bearer ${token}`,
  }

  const fetchUsers = async () => {
    const res = await fetch(`${config.apiBase}/users`, { headers })
    if (!res.ok) throw new Error('Failed to load users')
    return await res.json()
  }

  const fetchUser = async (id) => {
    const res = await fetch(`${config.apiBase}/users/${id}`, { headers })
    if (!res.ok) throw new Error(`Failed to load user #${id}`)
    return await res.json()
  }

  const createUser = async (payload) => {
    const res = await fetch(`${config.apiBase}/users`, {
      method:  'POST',
      headers,
      body:    JSON.stringify(payload),
    })
    if (!res.ok) {
      let err = 'Failed to create user'
      try { const body = await res.json(); err = body.message || body.error || err } catch {}
      throw new Error(err)
    }
    return await res.json()
  }

  const updateUser = async (id, payload) => {
    const res = await fetch(`${config.apiBase}/users/${id}`, {
      method:  'PATCH',
      headers,
      body:    JSON.stringify(payload),
    })
    if (!res.ok) {
      let err = 'Failed to update user'
      try { const body = await res.json(); err = body.message || body.error || err } catch {}
      throw new Error(err)
    }
    return await res.json()
  }

  const deleteUser = async (id) => {
    const res = await fetch(`${config.apiBase}/users/${id}`, {
      method: 'DELETE',
      headers,
    })
    if (!res.ok) throw new Error('Failed to delete user')
    return await res.json()
  }

  const fetchRoles = async () => {
    const res = await fetch(`${config.apiBase}/roles`, { headers })
    if (!res.ok) throw new Error('Failed to load roles')
    return await res.json()
  }

  const createRole = async (payload) => {
    const res = await fetch(`${config.apiBase}/roles`, {
      method: 'POST',
      headers,
      body:   JSON.stringify(payload),
    })
    if (!res.ok) {
      let err = 'Failed to create role'
      try { const body = await res.json(); err = body.message || body.error || err } catch {}
      throw new Error(err)
    }
    return await res.json()
  }

  // 👇 NEW
  const updateRole = async (id, payload) => {
    const res = await fetch(`${config.apiBase}/roles/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let err = 'Failed to update role'
      try { const body = await res.json(); err = body.message || body.error || err } catch {}
      throw new Error(err)
    }
    return await res.json()
  }

  return {
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    fetchRoles,
    createRole,
    updateRole, // 👈 export
  }
}
