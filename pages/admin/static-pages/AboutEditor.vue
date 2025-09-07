<template>
  <section class="max-w-full mx-auto">
    <!-- Header -->
    <!-- <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <h2 class="text-2xl font-bold text-gray-800">Edit About Page</h2>

      <div class="flex items-center gap-3">
        <span
          v-if="hasErrors"
          class="px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200"
        >
          Please fix the highlighted fields
        </span>
        <button
          @click="save"
          :disabled="saving || !isValid || !form"
          class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div> -->

    <div v-if="!form" class="text-gray-500">Loading editor…</div>

    <div v-else class="space-y-8">
      <!-- ========== PAGE HERO ========== -->
      <div class="bg-white shadow overflow-hidden" ref="heroRef">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Page Hero</h3>
          <p class="text-sm text-gray-500">Shown at the top via PageHero component.</p>
        </div>

        <div class="p-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model.trim="form.hero.title"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="About Us"
              />
              <p v-if="errors['hero.title']" class="text-xs text-red-600 mt-1">{{ errors['hero.title'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <input
                v-model.trim="form.hero.caption"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder=""
              />
              <p v-if="errors['hero.caption']" class="text-xs text-red-600 mt-1">{{ errors['hero.caption'] }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
            <div class="flex items-end space-x-4">
              <div class="w-40 h-28 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                <span v-if="!previews.heroImage" class="text-gray-400">No image</span>
                <img v-else :src="previews.heroImage" class="object-cover w-full h-full" />
              </div>
              <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                Browse…
                <input type="file" accept="image/*" @change="handleHeroImageUpload" class="hidden" />
              </label>
            </div>
            <p v-if="errors['hero.image']" class="text-xs text-red-600 mt-1">{{ errors['hero.image'] }}</p>
            <p v-else-if="form.hero.image" class="text-xs text-gray-500 mt-1">Saved Path: {{ form.hero.image }}</p>
          </div>
        </div>
      </div>

      <!-- ========== INTRO ========== -->
      <div class="bg-white shadow    overflow-hidden" ref="introRef">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Intro Section</h3>
          <p class="text-sm text-gray-500">Headline and two paragraphs (shloka + translation).</p>
        </div>

        <div class="p-5 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              v-model.trim="form.intro.headline"
              required
              type="text"
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="Namaste Devotees, Sanatan Mandir Tampa welcomes you to our community."
            />
            <p v-if="errors['intro.headline']" class="text-xs text-red-600 mt-1">{{ errors['intro.headline'] }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Shloka / Verse</label>
              <textarea
                v-model.trim="form.intro.verse"
                required
                rows="5"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="Om sarve bhavantu sukhinaha…"
              />
              <p v-if="errors['intro.verse']" class="text-xs text-red-600 mt-1">{{ errors['intro.verse'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Translation</label>
              <textarea
                v-model.trim="form.intro.translation"
                required
                rows="5"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="May all be happy…"
              />
              <p v-if="errors['intro.translation']" class="text-xs text-red-600 mt-1">{{ errors['intro.translation'] }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== FEATURE BANNER ========== -->
      <div class="bg-white shadow    overflow-hidden" ref="bannerRef">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Wide Banner Image</h3>
          <p class="text-sm text-gray-500">Full-width image under the intro section.</p>
        </div>

        <div class="p-5">
          <label class="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
          <div class="flex items-end space-x-4">
            <div class="w-64 h-36 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
              <span v-if="!previews.bannerImage" class="text-gray-400">No image</span>
              <img v-else :src="previews.bannerImage" class="object-cover w-full h-full" />
            </div>
            <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
              Browse…
              <input type="file" accept="image/*" @change="handleBannerImageUpload" class="hidden" />
            </label>
          </div>
          <p v-if="errors['banner.image']" class="text-xs text-red-600 mt-1">{{ errors['banner.image'] }}</p>
          <p v-else-if="form.banner.image" class="text-xs text-gray-500 mt-1">Saved Path: {{ form.banner.image }}</p>
        </div>
      </div>

      <!-- ========== OUR VISION ========== -->
      <div class="bg-white shadow    overflow-hidden" ref="visionRef">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Our Vision</h3>
          <p class="text-sm text-gray-500">Image (left) and text (right).</p>
        </div>

        <div class="p-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model.trim="form.vision.title"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="Our Vision"
              />
              <p v-if="errors['vision.title']" class="text-xs text-red-600 mt-1">{{ errors['vision.title'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div class="flex items-end space-x-4">
                <div class="w-40 h-28 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                  <span v-if="!previews.visionImage" class="text-gray-400">No image</span>
                  <img v-else :src="previews.visionImage" class="object-cover w-full h-full" />
                </div>
                <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                  Browse…
                  <input type="file" accept="image/*" @change="handleVisionImageUpload" class="hidden" />
                </label>
              </div>
              <p v-if="errors['vision.image']" class="text-xs text-red-600 mt-1">{{ errors['vision.image'] }}</p>
              <p v-else-if="form.vision.image" class="text-xs text-gray-500 mt-1">Saved Path: {{ form.vision.image }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              v-model.trim="form.vision.body"
              required
              rows="6"
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="We are a Hindu Temple located in Tampa…"
            />
            <p v-if="errors['vision.body']" class="text-xs text-red-600 mt-1">{{ errors['vision.body'] }}</p>
          </div>
        </div>
      </div>

      <!-- ========== OUR MISSION ========== -->
      <div class="bg-white shadow    overflow-hidden" ref="missionRef">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Our Mission</h3>
          <p class="text-sm text-gray-500">Image (right), paragraph + bullets (left).</p>
        </div>

        <div class="p-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model.trim="form.mission.title"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="Our Mission"
              />
              <p v-if="errors['mission.title']" class="text-xs text-red-600 mt-1">{{ errors['mission.title'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div class="flex items-end space-x-4">
                <div class="w-40 h-28 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                  <span v-if="!previews.missionImage" class="text-gray-400">No image</span>
                  <img v-else :src="previews.missionImage" class="object-cover w-full h-full" />
                </div>
                <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                  Browse…
                  <input type="file" accept="image/*" @change="handleMissionImageUpload" class="hidden" />
                </label>
              </div>
              <p v-if="errors['mission.image']" class="text-xs text-red-600 mt-1">{{ errors['mission.image'] }}</p>
              <p v-else-if="form.mission.image" class="text-xs text-gray-500 mt-1">Saved Path: {{ form.mission.image }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Intro Paragraph</label>
            <textarea
              v-model.trim="form.mission.body"
              required
              rows="6"
              class="w-full p-2 border border-gray-300 rounded"
              placeholder="The idea of establishing a place of worship was conceived in 1989…"
            />
            <p v-if="errors['mission.body']" class="text-xs text-red-600 mt-1">{{ errors['mission.body'] }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bullets</label>
            <div class="space-y-2">
              <div
                v-for="(item, i) in form.mission.bullets"
                :key="'b-' + i"
                class="grid grid-cols-12 gap-3 items-center"
              >
                <input
                  v-model.trim="form.mission.bullets[i]"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded col-span-11"
                  placeholder="Bullet point…"
                />
                <button
                  type="button"
                  @click="removeBullet(i)"
                  class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800 col-span-1"
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                @click="addBullet"
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
              >
                + Add Bullet
              </button>
            </div>
            <p v-if="errors['mission.bullets']" class="text-xs text-red-600 mt-1">{{ errors['mission.bullets'] }}</p>
          </div>
        </div>
      </div>

      <!-- SAVE -->
      <div class="flex justify-end pt-2">
        <button
          @click="save"
          :disabled="saving || !isValid || !form"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, toRaw, computed, nextTick } from 'vue'
import { useRuntimeConfig } from '#app'
import { useStaticPages } from '~/composables/useStaticPages'

const props = defineProps({
  slug: { type: String, required: true },     // e.g. 'about'
  content: { type: Object, default: null }    // existing CMS JSON blob (if any)
})
const emit = defineEmits(['saved'])

const { updatePage, uploadPhoto } = useStaticPages()
const config = useRuntimeConfig().public
const apiBase = config?.apiBase || ''

/* ---------- State ---------- */
const form = ref(null)
const previews = ref({
  heroImage: '',
  bannerImage: '',
  visionImage: '',
  missionImage: ''
})
const errors = ref({})
const saving = ref(false)

/* ---------- Section refs for scroll-to-first-error ---------- */
const heroRef = ref(null)
const introRef = ref(null)
const bannerRef = ref(null)
const visionRef = ref(null)
const missionRef = ref(null)

/* ---------- Helpers ---------- */
function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${apiBase}${path}`
}

/* ---------- Init from props.content ---------- */
watch(
  () => props.content,
  (c) => {
    if (!c) return
    form.value = {
      hero: {
        title:   c?.hero?.title   ?? 'About Us',
        caption: c?.hero?.caption ?? '',
        image:   c?.hero?.image   ?? ''
      },
      intro: {
        headline:     c?.intro?.headline     ?? 'Namaste Devotees, Sanatan Mandir Tampa welcomes you to our community.',
        verse:        c?.intro?.verse        ?? 'Om sarve bhavantu sukhinaha\nSarve santu niraamayaah\nSarve bhadraani pashyantu\nMaa kaschit dukkha bhaag bhavet\nOm shaanti shaanti shaanti',
        translation:  c?.intro?.translation  ?? 'May all be happy.\nMay all be free from disabilities.\nMay all see the good of others.\nMay none be in misery.\nOm, peace, peace, peace!'
      },
      banner: {
        image: c?.banner?.image ?? ''        // wide banner under intro
      },
      vision: {
        title: c?.vision?.title ?? 'Our Vision',
        body:  c?.vision?.body  ?? 'We are a Hindu Temple located in Tampa, conceived as place of worship and cultural growth for our community…',
        image: c?.vision?.image ?? ''
      },
      mission: {
        title:   c?.mission?.title   ?? 'Our Mission',
        body:    c?.mission?.body    ?? 'The idea of establishing a place of worship was conceived in 1989 and Hindu Samaj Inc…',
        bullets: Array.isArray(c?.mission?.bullets) && c.mission.bullets.length
          ? c.mission.bullets
          : [
              'To provide a place of worship to Hindu community in Tampa Bay area',
              'To keep our children in touch with religion and culture.',
              'To educate our children about our religious and cultural values.',
              'To provide a place to our community which they can use at the time of their need…',
              'To acquaint the community at large with our culture.',
              'To create better understanding among community members…'
            ],
        image: c?.mission?.image ?? ''
      }
    }

    // Build previews
    previews.value.heroImage   = fullUrl(form.value.hero.image)
    previews.value.bannerImage = fullUrl(form.value.banner.image)
    previews.value.visionImage = fullUrl(form.value.vision.image)
    previews.value.missionImage= fullUrl(form.value.mission.image)

    validateAll()
  },
  { immediate: true }
)

/* ---------- Validation ---------- */
function setError(key, msg) {
  if (msg) errors.value[key] = msg
  else delete errors.value[key]
}

function validateAll() {
  if (!form.value) return
  const f = form.value
  errors.value = {}

  // Hero
  setError('hero.title',   f.hero.title?.trim() ? '' : 'Title is required')
  setError('hero.caption', f.hero.caption?.trim() ? '' : 'Caption is required')
  setError('hero.image',   f.hero.image ? '' : 'Hero image is required')

  // Intro
  setError('intro.headline',    f.intro.headline?.trim() ? '' : 'Headline is required')
  setError('intro.verse',       f.intro.verse?.trim() ? '' : 'Verse is required')
  setError('intro.translation', f.intro.translation?.trim() ? '' : 'Translation is required')

  // Banner
  setError('banner.image', f.banner.image ? '' : 'Banner image is required')

  // Vision
  setError('vision.title', f.vision.title?.trim() ? '' : 'Title is required')
  setError('vision.body',  f.vision.body?.trim() ? '' : 'Body is required')
  setError('vision.image', f.vision.image ? '' : 'Image is required')

  // Mission
  setError('mission.title',   f.mission.title?.trim() ? '' : 'Title is required')
  setError('mission.body',    f.mission.body?.trim() ? '' : 'Body is required')
  const cleaned = (f.mission.bullets || []).map(s => (s || '').trim()).filter(Boolean)
  setError('mission.bullets', cleaned.length ? '' : 'At least one bullet is required')
  setError('mission.image',   f.mission.image ? '' : 'Image is required')
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)
const isValid   = computed(() => !hasErrors.value)
watch(form, validateAll, { deep: true })

/* ---------- Upload handlers ---------- */
async function handleHeroImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadPhoto(file)
    form.value.hero.image = url
    previews.value.heroImage = fullUrl(url)
    validateAll()
  } catch (err) {
    console.error('Hero image upload error:', err)
    alert('Upload failed')
  }
}
async function handleBannerImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadPhoto(file)
    form.value.banner.image = url
    previews.value.bannerImage = fullUrl(url)
    validateAll()
  } catch (err) {
    console.error('Banner image upload error:', err)
    alert('Upload failed')
  }
}
async function handleVisionImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadPhoto(file)
    form.value.vision.image = url
    previews.value.visionImage = fullUrl(url)
    validateAll()
  } catch (err) {
    console.error('Vision image upload error:', err)
    alert('Upload failed')
  }
}
async function handleMissionImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadPhoto(file)
    form.value.mission.image = url
    previews.value.missionImage = fullUrl(url)
    validateAll()
  } catch (err) {
    console.error('Mission image upload error:', err)
    alert('Upload failed')
  }
}

/* ---------- Bullets ---------- */
function addBullet() {
  form.value.mission.bullets.push('')
  validateAll()
}
function removeBullet(i) {
  form.value.mission.bullets.splice(i, 1)
  validateAll()
}

/* ---------- Save ---------- */
async function save() {
  validateAll()
  if (!isValid.value) {
    await nextTick()
    scrollToFirstError()
    return
  }
  try {
    saving.value = true
    await updatePage(props.slug, toRaw(form.value))
    alert('About page updated!')
    emit('saved')
  } catch (err) {
    console.error(err)
    alert('Failed to save page')
  } finally {
    saving.value = false
  }
}

/* ---------- Scroll to first error ---------- */
function scrollToFirstError() {
  const keys = Object.keys(errors.value)
  if (!keys.length) return
  const first = keys[0]
  if (first.startsWith('hero.'))      heroRef.value?.scrollIntoView({ behavior: 'smooth' })
  else if (first.startsWith('intro.'))   introRef.value?.scrollIntoView({ behavior: 'smooth' })
  else if (first.startsWith('banner.'))  bannerRef.value?.scrollIntoView({ behavior: 'smooth' })
  else if (first.startsWith('vision.'))  visionRef.value?.scrollIntoView({ behavior: 'smooth' })
  else if (first.startsWith('mission.')) missionRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* Use the same clean, table-like input styling you use elsewhere */
</style>
