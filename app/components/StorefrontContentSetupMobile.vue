<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Storefront Content" subtitle="Edit your public storefront home page copy" />

    <div v-if="store.loading" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate size="36" />
    </div>

    <template v-else>
      <div class="pa-4" style="padding-bottom: 96px">
        <!-- Hero -->
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-2 font-weight-bold mb-3">Hero</h2>
          <v-text-field v-model="form.heroTag" label="Tag line" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.heroHeadline" label="Headline" variant="outlined" class="mb-2" />
          <v-textarea v-model="form.heroSubtext" label="Subtext" variant="outlined" rows="2" class="mb-2" />
          <v-file-input label="Hero image (optional)" variant="outlined" accept="image/*" :loading="uploadingHero"
            prepend-icon="mdi-image" @change="onHeroImageChange" />
          <v-img v-if="form.heroImageUrl" :src="form.heroImageUrl" height="120" cover class="rounded-lg mt-2" />
        </div>

        <!-- Promise -->
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-2 font-weight-bold mb-3">Our Promise</h2>
          <v-text-field v-model="form.promiseTitle" label="Section title" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.promiseSubtitle" label="Section subtitle" variant="outlined" class="mb-2" />
          <div v-for="(item, i) in form.promiseItems" :key="i" class="d-flex align-center ga-2 mb-2">
            <v-text-field v-model="form.promiseItems[i]" label="Promise item" variant="outlined" density="comfortable" hide-details />
            <v-btn icon="mdi-close" size="small" variant="text" @click="form.promiseItems.splice(i, 1)" />
          </div>
          <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" @click="form.promiseItems.push('')">Add item</v-btn>
        </div>

        <!-- Story -->
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-2 font-weight-bold mb-3">Our Story</h2>
          <v-text-field v-model="form.storyTitle" label="Section title" variant="outlined" class="mb-2" />
          <v-textarea v-model="form.storyBody" label="Story" variant="outlined" rows="4" class="mb-2" />
          <div v-for="(pillar, i) in form.storyPillars" :key="i" class="d-flex align-center ga-2 mb-2">
            <v-text-field v-model="form.storyPillars[i]" label="Pillar" variant="outlined" density="comfortable" hide-details />
            <v-btn icon="mdi-close" size="small" variant="text" @click="form.storyPillars.splice(i, 1)" />
          </div>
          <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" @click="form.storyPillars.push('')">Add pillar</v-btn>
        </div>

        <!-- Why Choose Us -->
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-2 font-weight-bold mb-3">Why Choose Us</h2>
          <v-text-field v-model="form.whyChooseTitle" label="Section title" variant="outlined" class="mb-2" />
          <div v-for="(reason, i) in form.whyChooseItems" :key="i" class="mobile-why-row mb-3">
            <v-select v-model="reason.icon" :items="iconOptions" item-title="label" item-value="value" label="Icon" variant="outlined" density="comfortable" hide-details />
            <v-text-field v-model="reason.title" label="Title" variant="outlined" density="comfortable" hide-details />
            <v-text-field v-model="reason.body" label="Description" variant="outlined" density="comfortable" hide-details />
            <v-btn icon="mdi-close" size="small" variant="text" @click="form.whyChooseItems.splice(i, 1)" />
          </div>
          <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" @click="form.whyChooseItems.push({ icon: 'mdi-star-outline', title: '', body: '' })">
            Add reason
          </v-btn>
        </div>

        <!-- Philosophy -->
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-2 font-weight-bold mb-3">Our Philosophy</h2>
          <v-text-field v-model="form.philosophyTitle" label="Section title" variant="outlined" class="mb-2" />
          <div v-for="(line, i) in form.philosophyLines" :key="i" class="d-flex align-center ga-2 mb-2">
            <v-text-field v-model="form.philosophyLines[i]" label="Line" variant="outlined" density="comfortable" hide-details />
            <v-btn icon="mdi-close" size="small" variant="text" @click="form.philosophyLines.splice(i, 1)" />
          </div>
          <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" @click="form.philosophyLines.push('')">Add line</v-btn>
        </div>

        <!-- Testimonials -->
        <div class="app-card pa-4 mb-4">
          <h2 class="text-subtitle-2 font-weight-bold mb-3">Testimonials</h2>
          <v-text-field v-model="form.testimonialsTitle" label="Section title" variant="outlined" class="mb-2" />
          <div v-for="(t, i) in form.testimonials" :key="i" class="mobile-testimonial-row mb-3">
            <v-textarea v-model="t.quote" label="Quote" variant="outlined" rows="2" density="comfortable" hide-details />
            <v-text-field v-model="t.author" label="Author (optional)" variant="outlined" density="comfortable" hide-details />
            <v-btn icon="mdi-close" size="small" variant="text" @click="form.testimonials.splice(i, 1)" />
          </div>
          <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" @click="form.testimonials.push({ quote: '', author: '' })">
            Add testimonial
          </v-btn>
        </div>
      </div>

      <MobileActionBar>
        <v-btn block size="large" color="primary" prepend-icon="mdi-content-save" class="font-weight-bold"
          :loading="store.saving" @click="submit">
          Save Changes
        </v-btn>
      </MobileActionBar>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useStorefrontContentStore } from '@/stores/storefrontContent'

const store = useStorefrontContentStore()
const uploadingHero = ref(false)

const iconOptions = [
  { label: 'Fire (freshly prepared)', value: 'mdi-fire' },
  { label: 'Leaf (quality/organic)', value: 'mdi-leaf' },
  { label: 'Sparkles (hygiene)', value: 'mdi-sparkles' },
  { label: 'Lightning (quick service)', value: 'mdi-lightning-bolt' },
  { label: 'Heart (family friendly)', value: 'mdi-heart-outline' },
  { label: 'Star (recommended)', value: 'mdi-star-outline' },
  { label: 'Shield check (trust)', value: 'mdi-shield-check-outline' },
  { label: 'Clock (speed)', value: 'mdi-clock-fast' },
  { label: 'Food (recipes)', value: 'mdi-food-outline' },
  { label: 'Coffee', value: 'mdi-coffee-outline' },
]

function emptyForm() {
  return reactive({
    heroTag: '', heroHeadline: '', heroSubtext: '', heroImageUrl: null,
    promiseTitle: '', promiseSubtitle: '', promiseItems: [''],
    storyTitle: '', storyBody: '', storyPillars: [''],
    whyChooseTitle: '', whyChooseItems: [{ icon: 'mdi-star-outline', title: '', body: '' }],
    philosophyTitle: '', philosophyLines: [''],
    testimonialsTitle: '', testimonials: [{ quote: '', author: '' }],
  })
}

const form = ref(emptyForm())

function fillFormFrom(content) {
  if (!content) return
  form.value.heroTag = content.heroTag || ''
  form.value.heroHeadline = content.heroHeadline || ''
  form.value.heroSubtext = content.heroSubtext || ''
  form.value.heroImageUrl = content.heroImageUrl || null
  form.value.promiseTitle = content.promiseTitle || ''
  form.value.promiseSubtitle = content.promiseSubtitle || ''
  form.value.promiseItems = content.promiseItems?.length ? [...content.promiseItems] : ['']
  form.value.storyTitle = content.storyTitle || ''
  form.value.storyBody = content.storyBody || ''
  form.value.storyPillars = content.storyPillars?.length ? [...content.storyPillars] : ['']
  form.value.whyChooseTitle = content.whyChooseTitle || ''
  form.value.whyChooseItems = content.whyChooseItems?.length
    ? content.whyChooseItems.map((w) => ({ ...w }))
    : [{ icon: 'mdi-star-outline', title: '', body: '' }]
  form.value.philosophyTitle = content.philosophyTitle || ''
  form.value.philosophyLines = content.philosophyLines?.length ? [...content.philosophyLines] : ['']
  form.value.testimonialsTitle = content.testimonialsTitle || ''
  form.value.testimonials = content.testimonials?.length
    ? content.testimonials.map((t) => ({ ...t }))
    : [{ quote: '', author: '' }]
}

async function onHeroImageChange(event) {
  const file = event.target.files[0]
  if (!file) return
  uploadingHero.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await store.uploadImage(formData)
    form.value.heroImageUrl = res.data.url
  } catch (err) {
    console.error(err)
  } finally {
    uploadingHero.value = false
  }
}

async function submit() {
  const payload = {
    heroTag: form.value.heroTag?.trim() || null,
    heroHeadline: form.value.heroHeadline?.trim() || null,
    heroSubtext: form.value.heroSubtext?.trim() || null,
    heroImageUrl: form.value.heroImageUrl || null,
    promiseTitle: form.value.promiseTitle?.trim() || null,
    promiseSubtitle: form.value.promiseSubtitle?.trim() || null,
    promiseItems: form.value.promiseItems.map((s) => s.trim()).filter(Boolean),
    storyTitle: form.value.storyTitle?.trim() || null,
    storyBody: form.value.storyBody?.trim() || null,
    storyPillars: form.value.storyPillars.map((s) => s.trim()).filter(Boolean),
    whyChooseTitle: form.value.whyChooseTitle?.trim() || null,
    whyChooseItems: form.value.whyChooseItems
      .filter((w) => w.title?.trim() || w.body?.trim())
      .map((w) => ({ icon: w.icon || 'mdi-star-outline', title: w.title.trim(), body: w.body.trim() })),
    philosophyTitle: form.value.philosophyTitle?.trim() || null,
    philosophyLines: form.value.philosophyLines.map((s) => s.trim()).filter(Boolean),
    testimonialsTitle: form.value.testimonialsTitle?.trim() || null,
    testimonials: form.value.testimonials
      .filter((t) => t.quote?.trim())
      .map((t) => ({ quote: t.quote.trim(), author: t.author?.trim() || null })),
  }

  try {
    await store.saveContent(payload)
  } catch (err) {
    alert(err.message || 'Failed to save storefront content')
  }
}

onMounted(async () => {
  await store.fetchContent()
  fillFormFrom(store.content)
})
</script>

<style scoped>
.mobile-why-row,
.mobile-testimonial-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: start;
}
</style>
