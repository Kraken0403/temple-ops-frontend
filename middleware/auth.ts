// middleware/auth.ts
import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized) => {
  // 1) Try cookie first
  const tokenCookie = useCookie<string | null>('token')
  let token = tokenCookie.value

  // 2) Fallback to localStorage on the client
  if (process.client && !token) {
    token = localStorage.getItem('token')
  }

  // Debug logging
  console.log('[auth] token:', token)

  // 3) If no token, redirect to the login page
  if (!token) {
    return navigateTo('/login')
  }
})
