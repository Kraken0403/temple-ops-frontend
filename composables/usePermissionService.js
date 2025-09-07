// ~/composables/usePermissionService.js
import { useRuntimeConfig, useCookie } from '#app'

export const usePermissionService = () => {
  const config = useRuntimeConfig().public
  const token  = useCookie('token').value

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  // Fetch all Permission records from your API
  const fetchModules = async () => {
    const res = await fetch(`${config.apiBase}/permissions`, { headers })
    if (!res.ok) throw new Error('Failed to load permissions')
    return await res.json()
  }

  // Fetch existing permissions for a role
  const fetchRolePermissions = async (roleId) => {
    const res = await fetch(
      `${config.apiBase}/roles/${roleId}/permissions`,
      { headers }
    )
    if (!res.ok) throw new Error('Failed to load role permissions')
    const rels = await res.json()   // [{ roleId, permissionId }, …]
    // return only the IDs
    console.log('rels', rels)

    return rels.map(r => r.id)
  }


  // Assign a set of permission-IDs to a role
  const assignRolePermissions = async (roleId, permissionIds) => {
    console.log('📤 assignRolePermissions payload:', { permissionIds })
    const res = await fetch(
      `${config.apiBase}/roles/${roleId}/permissions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ permissionIds })
      }
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to save permissions: ${text}`)
    }
    return await res.json()
  }

  return {
    fetchModules,
    fetchRolePermissions,
    assignRolePermissions
  }
}
