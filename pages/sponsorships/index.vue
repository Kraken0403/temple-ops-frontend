<!-- File: pages/sponsorships/index.vue -->
<template>
  <section class="w-full mx-auto">
    <PageHero
      title="Sponsorships"
      caption="Support our events by sponsoring key activities. Choose from available sponsorships below."
      :imageUrl="heroBg"
    />

    <div class="mx-auto py-[100px] px-4 max-w-[1190px]">
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <!-- Left: Type + Event -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Type filter -->
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-2">Type:</label>
            <select v-model="typeFilter" class="border rounded-lg px-3 py-2 text-sm">
              <option value="all">All Sponsorships</option>
              <option value="event">Event Sponsorships</option>
              <option value="general">General Sponsorships</option>
            </select>
          </div>

          <!-- Event filter (only when Event or All) -->
          <div class="flex items-center" v-if="typeFilter !== 'general'">
            <label class="text-sm font-medium text-gray-700 mr-2">Filter by Event:</label>
            <select v-model="selectedEvent" class="border rounded-lg px-3 py-2 text-sm">
              <option value="">All Events</option>
              <option v-for="ev in uniqueEvents" :key="ev" :value="ev">{{ ev }}</option>
            </select>
          </div>
        </div>

        <!-- Right: Available only -->
        <label class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" v-model="showAvailableOnly" class="rounded border-gray-300" />
          Show only currently available
        </label>
      </div>

      <!-- Grid of sponsorship cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="s in filteredSponsorships"
          :key="s.id"
          class="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col"
        >
          <!-- Top stripe -->
          <div class="w-full h-2 bg-[#004B21]"></div>

          <!-- Content -->
          <div class="p-4 flex-1 flex flex-col">
            <!-- Title + badges -->
            <div class="flex items-start justify-between gap-3 mb-1">
              <h3 class="text-[18px] font-semibold">{{ s.sponsorshipType?.name }}</h3>

              <div class="flex items-center gap-1">
                <!-- Closed pill for event-based & past events -->
                <span
                  v-if="s.event && !isEventOpen(s.event)"
                  class="inline-flex items-center rounded-full bg-gray-200 text-gray-700 text-xs px-3 py-1"
                  title="Event is over"
                >
                  Closed
                </span>

                <!-- Event / General badge -->
                <span
                  class="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                  :class="s.event ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'"
                >
                  {{ s.event ? 'Event' : 'General' }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-600 mb-2">
              {{ s.sponsorshipType?.description }}
            </p>

            <!-- Event (or General) -->
            <p class="text-sm text-gray-700 mb-2 font-medium">
              <template v-if="s.event?.name">
                Event: <span class="text-black">{{ s.event.name }}</span>
              </template>
              <template v-else>
                Applies to: <span class="text-black">General Sponsorship</span>
              </template>
            </p>

            <!-- Availability (from Type) -->
            <p v-if="s.sponsorshipType?.startsAt || s.sponsorshipType?.endsAt" class="text-xs text-gray-500 mb-2">
              <template v-if="s.sponsorshipType?.startsAt">
                Starts: {{ fmtDateTime(s.sponsorshipType.startsAt) }}
              </template>
              <template v-if="s.sponsorshipType?.startsAt && s.sponsorshipType?.endsAt">
                &nbsp;•&nbsp;
              </template>
              <template v-if="s.sponsorshipType?.endsAt">
                Ends: {{ fmtDateTime(s.sponsorshipType.endsAt) }}
              </template>
            </p>

            <!-- Slots info -->
            <p class="text-sm text-gray-700 mb-2">
              Slots:
              <span class="font-semibold">
                {{ (s.bookings?.length ?? 0) }} / {{ s.maxSlots }}
              </span>
            </p>

            <!-- Price -->
            <p class="text-sm text-gray-700 mb-2">
              Price:
              <span class="font-semibold">
                {{ formatMoney(s.price ?? s.sponsorshipType?.price ?? 0, settingsCurrency) }}
              </span>
            </p>

            <!-- Book button -->
            <div class="mt-auto flex justify-end">
              <!-- Disabled when: event is closed OR not available now (time window inactive / sold out / inactive) -->
              <button
                v-if="(s.event && !isEventOpen(s.event)) || !isAvailableNow(s)"
                disabled
                class="bg-gray-300 text-gray-600 px-6 py-2 rounded-[30px] text-sm font-medium cursor-not-allowed"
                :title="s.event && !isEventOpen(s.event) ? 'Event is over' : 'Unavailable'"
              >
                {{ s.event && !isEventOpen(s.event) ? 'Event Closed' : 'Unavailable' }}
              </button>

              <NuxtLink
                v-else
                :to="`/sponsorships/checkout?sponsorshipId=${s.id}`"
                class="bg-[#004B21] text-white px-6 py-2 rounded-[30px] text-sm font-medium hover:bg-green-700"
              >
                Book Now
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-red-600 mt-4 text-center">
        Error loading sponsorships.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSponsorshipService } from '@/composables/useSponsorshipService'
import { useSettingsService } from '@/composables/useSettingsService'
import PageHero from '@/components/PageHero.vue'
import heroBg from '@/assets/images/sample-2.png'

const sponsorships = ref([])          // union of event + general rows
const error = ref(false)
const settingsCurrency = ref('INR')

// filters
const typeFilter = ref('all')          // 'all' | 'event' | 'general'
const selectedEvent = ref('')
const showAvailableOnly = ref(true)    // default ON for public view

const { getAllEventSponsorships, listIndependentSponsorships } = useSponsorshipService()
const { getSettings } = useSettingsService()

/** Build an event "start at" timestamp using date + optional startTime (same idea as events page) */
function buildEventStartAt(evt) {
  const d = evt?.date ? new Date(evt.date) : null
  if (!d) return null
  if (evt?.startTime) {
    const t = new Date(evt.startTime)
    return new Date(
      d.getFullYear(), d.getMonth(), d.getDate(),
      t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds()
    )
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/** Event is open for sponsorship bookings if now < event start */
function isEventOpen(evt) {
  const startAt = buildEventStartAt(evt)
  if (!startAt) return false
  return Date.now() < startAt.getTime()
}

/** Availability check for a row (type window, active flag, slots) */
function isAvailableNow(row) {
  const t = row?.sponsorshipType || {}
  const active = t.isActive !== false
  const now = Date.now()
  const startsOk = !t.startsAt || new Date(t.startsAt).getTime() <= now
  const endsOk   = !t.endsAt   || new Date(t.endsAt).getTime()   >= now
  const maxSlots = row?.maxSlots ?? 0
  const booked   = row?.bookings?.length ?? 0
  const slotsOk  = booked < maxSlots
  return active && startsOk && endsOk && slotsOk
}

// unique Event names for dropdown
const uniqueEvents = computed(() => {
  const names = sponsorships.value
    .filter(s => !!s.event?.name)
    .map(s => s.event.name)
  return [...new Set(names)]
})

// filtered list for the grid
const filteredSponsorships = computed(() => {
  let list = sponsorships.value

  if (typeFilter.value === 'event') {
    list = list.filter(s => !!s.event)
  } else if (typeFilter.value === 'general') {
    list = list.filter(s => !s.event)
  }

  if (selectedEvent.value && typeFilter.value !== 'general') {
    list = list.filter(s => s.event?.name === selectedEvent.value)
  }

  if (showAvailableOnly.value) {
    list = list.filter(s => {
      // Event sponsorships must have event open AND be available
      if (s.event) return isEventOpen(s.event) && isAvailableNow(s)
      // General sponsorships: only availability window + slots
      return isAvailableNow(s)
    })
  }

  // Otherwise show all; the button will still disable when closed/unavailable
  return list
})

function currencySymbol(code) {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' }
  return map[code] || '₹'
}
function formatMoney(amount, code) {
  if (amount == null) return currencySymbol(code) + '0'
  try {
    return new Intl.NumberFormat(
      code === 'INR' ? 'en-IN' : 'en-US',
      { style: 'currency', currency: code, maximumFractionDigits: 0 }
    ).format(Number(amount))
  } catch {
    return `${currencySymbol(code)}${Number(amount).toLocaleString()}`
  }
}
function fmtDateTime(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString() } catch { return '' }
}

onMounted(async () => {
  try {
    const s = await getSettings()
    settingsCurrency.value = s?.currency || 'INR'

    // Fetch ALL rows; the UI enforces “available only” when toggled
    const eventRows = await getAllEventSponsorships().catch(() => [])
    const generalRows = typeof listIndependentSponsorships === 'function'
      ? await listIndependentSponsorships(false).catch(() => [])  // fetch all, not just available
      : []

    // Merge by ID, avoid duplicates
    const map = new Map()
    ;[...eventRows, ...generalRows].forEach(r => {
      if (r && r.id != null) map.set(r.id, r)
    })
    sponsorships.value = Array.from(map.values())
  } catch (err) {
    console.error('Failed to load sponsorships', err)
    error.value = true
  }
})
</script>

<style scoped>
.material-icons {
  font-size: 20px;
  vertical-align: middle;
}
</style>
