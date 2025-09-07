<template>
  <section class="max-w-full mx-auto">
    <!-- Header -->
    <!-- <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <h2 class="text-2xl font-bold text-gray-800">Edit Home Page</h2>

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
      <!-- ========== HERO SLIDER ========== -->
      <div class="bg-white shadow overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-300 bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Hero Slider</h3>
          <p class="text-sm text-gray-500">Slides displayed in the homepage hero carousel.</p>
        </div>

        <div class="p-5 space-y-6">
          <div
            v-for="(slide, i) in form.heroSlider.slides"
            :key="slide.id ?? i"
            :ref="el => (sectionRefs.hero[i] = el)"
            class="border   p-4 space-y-4"
            :class="hasHeroErrors(i) ? 'border-red-300 bg-red-50/20' : 'border-gray-200'"
          >
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-800">Slide #{{ i + 1 }}</h4>
              <div class="flex gap-2">
                <button
                  class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
                  :disabled="i === 0"
                  @click="moveSlide(i, -1)"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
                  :disabled="i === form.heroSlider.slides.length - 1"
                  @click="moveSlide(i, +1)"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  class="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded text-sm text-red-600"
                  @click="removeSlide(i)"
                >
                  Remove
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  v-model.trim="slide.title"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="Welcome to Sanatan Temple"
                />
                <p v-if="errors[`hero.${i}.title`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`hero.${i}.title`] }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input
                  v-model.trim="slide.caption"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="Peace & devotion"
                />
                <p v-if="errors[`hero.${i}.caption`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`hero.${i}.caption`] }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  v-model.trim="slide.buttonText"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="Book Pooja"
                />
                <p v-if="errors[`hero.${i}.buttonText`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`hero.${i}.buttonText`] }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                <input
                  v-model.trim="slide.buttonLink"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="/about"
                />
                <p v-if="errors[`hero.${i}.buttonLink`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`hero.${i}.buttonLink`] }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Slide Image</label>
              <div class="flex items-end space-x-4">
                <div class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                  <span v-if="!previews.heroSlides[i]" class="text-gray-400">No image</span>
                  <img v-else :src="previews.heroSlides[i]" class="object-cover w-full h-full" />
                </div>
                <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                  Browse…
                  <input type="file" accept="image/*" @change="handleSlideImageUpload($event, i)" class="hidden" />
                </label>
              </div>
              <p v-if="errors[`hero.${i}.image`]" class="text-xs text-red-600 mt-1">
                {{ errors[`hero.${i}.image`] }}
              </p>
              <p v-else-if="form.heroSlider.slides[i].image" class="text-xs text-gray-500 mt-1">
                Saved Path: {{ form.heroSlider.slides[i].image }}
              </p>
            </div>
          </div>

          <button
            class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
            @click="addSlide"
            type="button"
          >
            + Add Slide
          </button>
        </div>
      </div>

      <!-- ========== MARQUEE ========== -->
      <div class="bg-white shadow   overflow-hidden">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Marquee Section</h3>
          <p class="text-sm text-gray-500">Scrolling text bar under the hero slider.</p>
        </div>

        <div class="p-5 grid md:grid-cols-3 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Items <span class="text-gray-400">(add at least one non-empty item)</span>
            </label>
            <div class="space-y-2">
              <div
                v-for="(item, i) in form.marquee.items"
                :key="'mq-' + i"
                class="grid grid-cols-12 gap-3 items-center"
              >
                <input
                  v-model.trim="form.marquee.items[i]"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded col-span-11"
                  placeholder="Consectetur adipiscing elit"
                />
                <button
                  class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800 col-span-1"
                  type="button"
                  @click="removeMarqueeItem(i)"
                >
                  ✕
                </button>
              </div>

              <button
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800"
                type="button"
                @click="addMarqueeItem"
              >
                + Add Item
              </button>
            </div>
            <p v-if="errors['marquee.items']" class="text-xs text-red-600 mt-1">
              {{ errors['marquee.items'] }}
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input v-model="form.marquee.bgColor" required type="color" class="w-24 h-10 border border-gray-300 rounded" />
              <p v-if="errors['marquee.bgColor']" class="text-xs text-red-600 mt-1">
                {{ errors['marquee.bgColor'] }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Speed (seconds)</label>
              <input
                v-model.number="form.marquee.speed"
                required
                min="1"
                type="number"
                class="w-28 p-2 border border-gray-300 rounded"
              />
              <p v-if="errors['marquee.speed']" class="text-xs text-red-600 mt-1">
                {{ errors['marquee.speed'] }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== ABOUT HOME ========== -->
      <div class="bg-white shadow   overflow-hidden">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">About Section</h3>
          <p class="text-sm text-gray-500">Right-hand content and image in the About section.</p>
        </div>

        <div class="p-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model.trim="form.about.title"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="About Sanatan Mandir, Tampa"
              />
              <p v-if="errors['about.title']" class="text-xs text-red-600 mt-1">{{ errors['about.title'] }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Years</label>
              <input
                v-model.number="form.about.stats.years"
                required
                min="0"
                type="number"
                class="w-full p-2 border border-gray-300 rounded"
              />
              <p v-if="errors['about.stats.years']" class="text-xs text-red-600 mt-1">
                {{ errors['about.stats.years'] }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Devotees (e.g., 1.2m)</label>
              <input
                v-model.trim="form.about.stats.devotees"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
              />
              <p v-if="errors['about.stats.devotees']" class="text-xs text-red-600 mt-1">
                {{ errors['about.stats.devotees'] }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priests</label>
              <input
                v-model.number="form.about.stats.priests"
                required
                min="0"
                type="number"
                class="w-full p-2 border border-gray-300 rounded"
              />
              <p v-if="errors['about.stats.priests']" class="text-xs text-red-600 mt-1">
                {{ errors['about.stats.priests'] }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model.trim="form.about.description"
              required
              rows="4"
              class="w-full p-2 border border-gray-300 rounded"
            />
            <p v-if="errors['about.description']" class="text-xs text-red-600 mt-1">
              {{ errors['about.description'] }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">About Image</label>
              <div class="flex items-end space-x-4">
                <div class="w-32 h-32 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                  <span v-if="!previews.aboutImage" class="text-gray-400">No image</span>
                  <img v-else :src="previews.aboutImage" class="object-cover w-full h-full" />
                </div>
                <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                  Browse…
                  <input type="file" accept="image/*" @change="handleAboutImageUpload" class="hidden" />
                </label>
              </div>
              <p v-if="errors['about.image']" class="text-xs text-red-600 mt-1">{{ errors['about.image'] }}</p>
              <p v-else-if="form.about.image" class="text-xs text-gray-500 mt-1">Saved Path: {{ form.about.image }}</p>
            </div>

            <!-- Links -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Know More Link</label>
                <input
                  v-model.trim="form.about.links.about"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="/about"
                />
                <p v-if="errors['about.links.about']" class="text-xs text-red-600 mt-1">
                  {{ errors['about.links.about'] }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gallery Link</label>
                <input
                  v-model.trim="form.about.links.gallery"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="/gallery"
                />
                <p v-if="errors['about.links.gallery']" class="text-xs text-red-600 mt-1">
                  {{ errors['about.links.gallery'] }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== EXPERIENCE ========== -->
      <div class="bg-white shadow   overflow-hidden">
        <div class="px-5 py-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">Experience Section</h3>
          <p class="text-sm text-gray-500">Three cards grid with CTA buttons.</p>
        </div>

        <div class="p-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Heading</label>
              <input
                v-model.trim="form.experience.heading"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
                placeholder="Join us in improving the overall experience"
              />
              <p v-if="errors['experience.heading']" class="text-xs text-red-600 mt-1">
                {{ errors['experience.heading'] }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Intro</label>
              <input
                v-model.trim="form.experience.intro"
                required
                type="text"
                class="w-full p-2 border border-gray-300 rounded"
              />
              <p v-if="errors['experience.intro']" class="text-xs text-red-600 mt-1">
                {{ errors['experience.intro'] }}
              </p>
            </div>
          </div>

          <div
            v-for="(card, i) in form.experience.cards"
            :key="'card-' + i"
            :ref="el => (sectionRefs.experience[i] = el)"
            class="border   p-4 space-y-4"
            :class="hasExperienceErrors(i) ? 'border-red-300 bg-red-50/20' : 'border-gray-200'"
          >
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-800">Card #{{ i + 1 }}</h4>
              <button
                class="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 rounded text-sm text-red-600"
                type="button"
                @click="removeExperienceCard(i)"
              >
                Remove
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  v-model.trim="card.title"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                />
                <p v-if="errors[`experience.${i}.title`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`experience.${i}.title`] }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Material Icon</label>
                <input
                  v-model.trim="card.icon"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="attach_money / volunteer_activism / contact_page"
                />
                <p v-if="errors[`experience.${i}.icon`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`experience.${i}.icon`] }}
                </p>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model.trim="card.description"
                  required
                  rows="2"
                  class="w-full p-2 border border-gray-300 rounded"
                />
                <p v-if="errors[`experience.${i}.description`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`experience.${i}.description`] }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                <input
                  v-model.trim="card.link"
                  required
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded"
                  placeholder="/donations"
                />
                <p v-if="errors[`experience.${i}.link`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`experience.${i}.link`] }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                <select
                  v-model="card.variant"
                  required
                  class="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="light">Light (flat color)</option>
                  <option value="image">Image (with overlay)</option>
                </select>
                <p v-if="errors[`experience.${i}.variant`]" class="text-xs text-red-600 mt-1">
                  {{ errors[`experience.${i}.variant`] }}
                </p>
              </div>
            </div>

            <div v-if="card.variant === 'image'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
              <div class="flex items-end space-x-4">
                <div class="w-32 h-24 bg-[#f5f5f5] border border-[#ccc] rounded flex items-center justify-center overflow-hidden">
                  <span v-if="!previews.experienceBgs[i]" class="text-gray-400">No image</span>
                  <img v-else :src="previews.experienceBgs[i]" class="object-cover w-full h-full" />
                </div>
                <label class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                  Browse…
                  <input type="file" accept="image/*" @change="handleExperienceBgUpload($event, i)" class="hidden" />
                </label>
              </div>
              <p v-if="errors[`experience.${i}.bgImage`]" class="text-xs text-red-600 mt-1">
                {{ errors[`experience.${i}.bgImage`] }}
              </p>
              <p v-else-if="card.bgImage" class="text-xs text-gray-500 mt-1">
                Saved Path: {{ card.bgImage }}
              </p>
            </div>
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
  slug: { type: String, required: true },
  content: { type: Object, default: null }
})
const emit = defineEmits(['saved'])

const { updatePage, uploadPhoto } = useStaticPages()
const config = useRuntimeConfig().public

const form = ref(null)
const previews = ref({
  heroSlides: [],
  aboutImage: '',
  experienceBgs: []
})
const errors = ref({})
const saving = ref(false)

/* For scroll-to-first-error */
const sectionRefs = {
  hero: [],
  experience: []
}
const marqueeRef = ref(null)
const aboutRef = ref(null)

/* Helpers */
function fullUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${config.apiBase}${path}`
}

/* ---------- INIT ---------- */
watch(
  () => props.content,
  (c) => {
    if (!c) return
    form.value = {
      heroSlider: {
        slides: Array.isArray(c?.heroSlider?.slides)
          ? c.heroSlider.slides
          : [
              { id: 1, title: 'Welcome to Sanatan Temple', caption: 'Peace & devotion', image: '', buttonText: 'Book Pooja', buttonLink: '/about' },
              { id: 2, title: 'Spiritual', caption: 'Daily rituals', image: '', buttonText: 'Explore Services', buttonLink: '/services' },
              { id: 3, title: 'Join Events', caption: 'Be part…', image: '', buttonText: 'View Events', buttonLink: '/events' },
              { id: 4, title: 'Give Back', caption: 'Support our mission', image: '', buttonText: 'Donate Now', buttonLink: '/donations' }
            ]
      },
      marquee: {
        items: c?.marquee?.items ?? [
          'Lorem Ipsum Dolor sit amet',
          'Consectetur adipiscing elit',
          'Sed do eiusmod tempor',
          'Incididunt ut labore et dolore'
        ],
        bgColor: c?.marquee?.bgColor ?? '#660000',
        speed:   c?.marquee?.speed   ?? 20
      },
      about: {
        title:       c?.about?.title       ?? 'About Sanatan Mandir, Tampa',
        description: c?.about?.description ?? '',
        image:       c?.about?.image       ?? '',
        stats: {
          years:     Number(c?.about?.stats?.years ?? 27),
          devotees:  c?.about?.stats?.devotees ?? '1.2m',
          priests:   Number(c?.about?.stats?.priests ?? 14)
        },
        links: {
          about:   c?.about?.links?.about   ?? '/about',
          gallery: c?.about?.links?.gallery ?? '/gallery'
        }
      },
      experience: {
        heading: c?.experience?.heading ?? 'Join us in improving the overall experience',
        intro:   c?.experience?.intro   ?? 'We are a Hindu Temple located in Tampa, conceived as place of worship and cultural growth for our community; A place to educate our children',
        cards:   Array.isArray(c?.experience?.cards)
          ? c.experience.cards
          : [
              { title: 'Donate',    icon: 'attach_money',        description: 'Lorem ipsum dolor sit amet...', link: '/donations', variant: 'light', bgImage: '' },
              { title: 'Volunteer', icon: 'volunteer_activism',  description: 'Lorem ipsum dolor sit amet...', link: '/donations', variant: 'light', bgImage: '' },
              { title: 'Contact Us',icon: 'contact_page',        description: 'Lorem ipsum dolor sit amet...', link: '/contact',   variant: 'image', bgImage: '' }
            ]
      }
    }

    // Build previews
    previews.value.heroSlides    = form.value.heroSlider.slides.map(s => fullUrl(s.image))
    previews.value.aboutImage    = fullUrl(form.value.about.image)
    previews.value.experienceBgs = form.value.experience.cards.map(c => fullUrl(c.bgImage))

    validateAll()
  },
  { immediate: true }
)

/* ---------- VALIDATION ---------- */
function setError(key, msg) {
  if (msg) errors.value[key] = msg
  else delete errors.value[key]
}

function validateAll() {
  if (!form.value) return
  const f = form.value
  errors.value = {}

  // Hero slides
  f.heroSlider.slides.forEach((s, i) => {
    setError(`hero.${i}.title`,       s.title?.trim() ? '' : 'Title is required')
    setError(`hero.${i}.caption`,     s.caption?.trim() ? '' : 'Caption is required')
    setError(`hero.${i}.buttonText`,  s.buttonText?.trim() ? '' : 'Button text is required')
    setError(`hero.${i}.buttonLink`,  s.buttonLink?.trim() ? '' : 'Button link is required')
    setError(`hero.${i}.image`,       s.image ? '' : 'Image is required')
  })

  // Marquee
  const hasAnyItem = f.marquee.items.some(it => (it || '').trim())
  setError('marquee.items',   hasAnyItem ? '' : 'At least one item is required')
  setError('marquee.bgColor', f.marquee.bgColor ? '' : 'Background color is required')
  setError('marquee.speed',   Number(f.marquee.speed) > 0 ? '' : 'Speed must be > 0')

  // About
  setError('about.title',          f.about.title?.trim() ? '' : 'Title is required')
  setError('about.description',    f.about.description?.trim() ? '' : 'Description is required')
  setError('about.image',          f.about.image ? '' : 'Image is required')
  setError('about.stats.years',    Number.isFinite(Number(f.about.stats.years)) ? '' : 'Years is required')
  setError('about.stats.devotees', f.about.stats.devotees?.trim() ? '' : 'Devotees is required')
  setError('about.stats.priests',  Number.isFinite(Number(f.about.stats.priests)) ? '' : 'Priests is required')
  setError('about.links.about',    f.about.links.about?.trim() ? '' : 'Know more link is required')
  setError('about.links.gallery',  f.about.links.gallery?.trim() ? '' : 'Gallery link is required')

  // Experience
  setError('experience.heading', f.experience.heading?.trim() ? '' : 'Heading is required')
  setError('experience.intro',   f.experience.intro?.trim() ? '' : 'Intro is required')

  f.experience.cards.forEach((c, i) => {
    setError(`experience.${i}.title`,       c.title?.trim() ? '' : 'Title is required')
    setError(`experience.${i}.icon`,        c.icon?.trim() ? '' : 'Material icon is required')
    setError(`experience.${i}.description`, c.description?.trim() ? '' : 'Description is required')
    setError(`experience.${i}.link`,        c.link?.trim() ? '' : 'CTA link is required')
    setError(`experience.${i}.variant`,     c.variant ? '' : 'Variant is required')
    if (c.variant === 'image') {
      setError(`experience.${i}.bgImage`, c.bgImage ? '' : 'Background image is required for image variant')
    } else {
      setError(`experience.${i}.bgImage`, '')
    }
  })
}

const hasErrors = computed(() => Object.keys(errors.value).length > 0)
const isValid   = computed(() => !hasErrors.value)

/* Watch and re-validate */
watch(form, validateAll, { deep: true })

/* ---------- UI STATE HELPERS ---------- */
function hasHeroErrors(i) {
  return Boolean(
    errors.value[`hero.${i}.title`] ||
    errors.value[`hero.${i}.caption`] ||
    errors.value[`hero.${i}.buttonText`] ||
    errors.value[`hero.${i}.buttonLink`] ||
    errors.value[`hero.${i}.image`]
  )
}
function hasExperienceErrors(i) {
  return Boolean(
    errors.value[`experience.${i}.title`] ||
    errors.value[`experience.${i}.icon`] ||
    errors.value[`experience.${i}.description`] ||
    errors.value[`experience.${i}.link`] ||
    errors.value[`experience.${i}.variant`] ||
    errors.value[`experience.${i}.bgImage`]
  )
}

/* ---------- HERO SLIDER HELPERS ---------- */
function addSlide() {
  const nextId = (form.value.heroSlider.slides.reduce((m, s) => Math.max(m, Number(s.id ?? 0)), 0) || 0) + 1
  form.value.heroSlider.slides.push({
    id: nextId, title: '', caption: '', image: '', buttonText: '', buttonLink: ''
  })
  previews.value.heroSlides.push('')
}
function removeSlide(i) {
  form.value.heroSlider.slides.splice(i, 1)
  previews.value.heroSlides.splice(i, 1)
  validateAll()
}
function moveSlide(i, delta) {
  const j = i + delta
  const arr = form.value.heroSlider.slides
  const pvw = previews.value.heroSlides
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
  ;[pvw[i], pvw[j]] = [pvw[j], pvw[i]]
}

async function handleSlideImageUpload(e, index) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadPhoto(file)
    form.value.heroSlider.slides[index].image = url
    previews.value.heroSlides[index] = fullUrl(url)
    validateAll()
  } catch (err) {
    console.error('Slide upload error:', err)
    alert('Upload failed')
  }
}

/* ---------- MARQUEE ---------- */
function addMarqueeItem() {
  form.value.marquee.items.push('')
  validateAll()
}
function removeMarqueeItem(i) {
  form.value.marquee.items.splice(i, 1)
  validateAll()
}

/* ---------- ABOUT ---------- */
async function handleAboutImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadPhoto(file)
    form.value.about.image = url
    previews.value.aboutImage = fullUrl(url)
    validateAll()
  } catch (err) {
    console.error('About image upload error:', err)
    alert('Upload failed')
  }
}

/* ---------- EXPERIENCE ---------- */
function addExperienceCard() {
  form.value.experience.cards.push({
    title: '', icon: '', description: '', link: '', variant: 'light', bgImage: ''
  })
  previews.value.experienceBgs.push('')
  validateAll()
}
function removeExperienceCard(i) {
  form.value.experience.cards.splice(i, 1)
  previews.value.experienceBgs.splice(i, 1)
  validateAll()
}
async function handleExperienceBgUpload(e, i) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadPhoto(file)
    form.value.experience.cards[i].bgImage = url
    previews.value.experienceBgs[i] = fullUrl(url)
    validateAll()
  } catch (err) {
    console.error('Experience bg upload error:', err)
    alert('Upload failed')
  }
}

/* ---------- SAVE ---------- */
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
    alert('Page updated!')
    emit('saved')
  } catch (err) {
    console.error(err)
    alert('Failed to save page')
  } finally {
    saving.value = false
  }
}

/* Scroll to first visible error block */
function scrollToFirstError() {
  const keys = Object.keys(errors.value)
  if (!keys.length) return
  const first = keys[0]

  if (first.startsWith('hero.')) {
    const idx = Number(first.split('.')[1] || 0)
    sectionRefs.hero[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else if (first.startsWith('marquee.')) {
    marqueeRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else if (first.startsWith('about.')) {
    aboutRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else if (first.startsWith('experience.')) {
    const idx = Number(first.split('.')[1] || 0)
    sectionRefs.experience[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>
