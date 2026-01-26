// composables/useEventOccurrences.ts
import { computed } from 'vue'

export function useNextOccurrence(eventRef: any) {
  return computed(() => {
    const occurrences = eventRef?.value?.occurrences
    if (!Array.isArray(occurrences) || !occurrences.length) return null

    const now = new Date()

    return (
      occurrences
        .map(o => ({
          ...o,
          _date: new Date(o.occurrenceDate),
        }))
        .filter(o => o._date > now)
        .sort((a, b) => a._date - b._date)[0] || null
    )
  })
}
