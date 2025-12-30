// middleware/auth.ts
import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.')
    const decoded = JSON.parse(atob(payload))
    if (!decoded.exp) return true
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}

export default defineNuxtRouteMiddleware(() => {
  const tokenCookie = useCookie<string | null>('token')
  let token = tokenCookie.value

  if (process.client && !token) {
    token = localStorage.getItem('token')
  }

  // ❌ No token → kick out
  if (!token) {
    return navigateTo('/login')
  }

  // ❌ Expired token → HARD logout
  if (isTokenExpired(token)) {
    tokenCookie.value = null
    if (process.client) localStorage.removeItem('token')
    return navigateTo('/login')
  }
})
