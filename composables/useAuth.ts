// composables/useAuth.ts
import { computed } from 'vue'
import { useCookie, useRuntimeConfig, navigateTo } from '#app'

/**
 * Decode a JWT and return its payload, or null on error.
 */
function decodeJwt<T>(token: string): T | null {
  try {
    const [, payloadBase64] = token.split('.')
    const json = atob(
      payloadBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(payloadBase64.length + (4 - (payloadBase64.length % 4)) % 4, '=')
    )
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

export function useAuth() {
  const config      = useRuntimeConfig().public
  const tokenCookie = useCookie<string | null>('token', {
    path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7
  })

  // Reactive token getter
  const token = computed<string | null>(() => {
    if (tokenCookie.value) return tokenCookie.value
    if (process.client) return localStorage.getItem('token')
    return null
  })

  // Decode the JWT payload into a `user` object or null
  interface JwtPayload {
    sub:    number
    email:  string
    roles:  string[]
    iat?:   number
    exp?:   number
  }

  
  const user = computed< { id: number; email: string; roles: string[] } | null>(() => {
    if (!token.value) return null
    const payload = decodeJwt<JwtPayload>(token.value)
    if (!payload || !payload.sub || !payload.email || !Array.isArray(payload.roles)) {
      return null
    }
    return {
      id:    payload.sub,
      email: payload.email,
      roles: payload.roles
    }
  })

  /** Login: unchanged, but keep your existing logic */
  async function login(payload: { email: string; password: string }) {
    const url = `${config.apiBase}/auth/login`
  
    const res = await $fetch<{ access_token: string }>(url, {
      method: 'POST',
      body: payload
    })
  
    // If backend didn't return token → treat as failure
    if (!res?.access_token) {
      throw new Error('Invalid email or password')
    }
  
    tokenCookie.value = res.access_token
    if (process.client) localStorage.setItem('token', res.access_token)
  
    return res.access_token
  }
  

  /** Logout: unchanged */
  function logout() {
    tokenCookie.value = null
    if (process.client) localStorage.removeItem('token')
    return navigateTo('/login')
  }

  /** fetchWithAuth: unchanged */
  function fetchWithAuth<T>(path: string, opts: any = {}) {
    return useFetch<T>(`${config.apiBase}${path}`, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: token.value ? `Bearer ${token.value}` : ''
      },
      pick: ['data','error','status'],
      onResponseError({ response }) {
        if (response.status === 401) {
          tokenCookie.value = null
          if (process.client) localStorage.removeItem('token')
          return navigateTo('/login')
        }
      }
    })
  }

  return { token, user, login, logout, fetchWithAuth }
}
