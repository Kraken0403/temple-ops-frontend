// utils/timezone.js
import { DateTime } from 'luxon'
import { useSettingsService } from '@/composables/useSettingsService'

let cachedTZ = 'Asia/Kolkata' // default fallback
let initialized = false

/**
 * Load timezone from settings once (call at app start)
 */
export async function loadTimezone() {
  if (initialized) return cachedTZ
  try {
    const { getSettings } = useSettingsService()
    const s = await getSettings()
    cachedTZ = s?.timezone || 'Asia/Kolkata'
  } catch {
    cachedTZ = 'Asia/Kolkata'
  }
  initialized = true
  return cachedTZ
}

/**
 * Internal helper to format
 */
function formatWithTZ(iso, fmt) {
  if (!iso) return ''
  return DateTime.fromISO(iso, { zone: 'utc' }).setZone(cachedTZ).toFormat(fmt)
}

/**
 * Public sync helpers
 */
export function formatDate(iso, fmt = 'yyyy-LL-dd') {
  return formatWithTZ(iso, fmt)
}

export function formatDateTime(iso, fmt = 'yyyy-LL-dd HH:mm') {
  return formatWithTZ(iso, fmt)
}

export function formatTime(iso, fmt = 'HH:mm') {
  return formatWithTZ(iso, fmt)
}

export function normalizeYMDToUTC(ymd) {
  return DateTime.fromISO(ymd, { zone: cachedTZ })
    .startOf('day')
    .toUTC()
    .toISO()
}

