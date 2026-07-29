<script setup>
import '../../../assets/builder.css'
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import { useBuilderStore } from '../../../stores/builder'
import { useNavigationStore } from '../../../stores/navigation'
import { usePublishingStore } from '../../../stores/publishing'

definePageMeta({ layout: false })

const auth = useAuthStore()
const builder = useBuilderStore()
const navigation = useNavigationStore()
const publishing = usePublishingStore()

const canvasRef = ref(null)
const leftSidebarRef = ref(null)
const selected = ref(null)
const historyOpen = ref(false)
let autosaveTimer = null

// Guards save()/publish() against exporting the canvas before loadBlocks()
// for the CURRENT page has actually finished - without this, a Save/Publish
// click (human or automated) that lands in the gap between "navigate to this
// page" and "GrapesJS finished loading its blocks" reads an empty canvas and
// persists that as the page's real content, silently wiping it. Confirmed
// this is exactly what happened to the seeded demo home page during this
// session's own Playwright verification of the Publish button.
const canvasReady = ref(false)

// Navbar now understands nested children (dropdown/mega-menu) and
// sticky/transparent, resolved from the real `navigation` row itself
// (see grapesEditor.js's mergeHeaderProps) - `navigationLinks` stays here
// only because it's still the flattened shape TemplatesPanel.vue's preview
// (a different, lower-stakes DynamicRenderer usage) expects.
const globalContext = computed(() => ({
  componentsByKey: new Map(builder.globalComponents.map((c) => [c.key, c])),
  navigationLinks: (navigation.navigation?.items || []).map((item) => ({ label: item.resolvedLabel ?? item.label, href: item.resolvedHref ?? item.url })),
  navigation: navigation.navigation,
  liveData: builder.liveData,
}))

onMounted(async () => {
  // Both children have finished mounting by the time this callback runs
  // (child onMounted hooks fire before the parent's), so LeftSidebar's
  // Blocks/Layers tab elements are guaranteed to be real DOM nodes here -
  // hand them to Canvas explicitly instead of using a Teleport (see
  // Canvas.vue for why Teleport-to-a-sibling's-id proved unreliable).
  canvasRef.value?.init(leftSidebarRef.value?.blocksTargetEl, leftSidebarRef.value?.layersTargetEl)

  if (!auth.token) auth.restoreToken()
  if (!auth.token) return navigateTo('/')
  if (!auth.userInfo) await auth.fetchMe()

  // fetchLiveDataPreview() depends on builder.website (for its company's
  // branches), so it's chained after fetchWebsite rather than run inside the
  // same Promise.all - awaited (not fire-and-forget) so the FIRST loadBlocks()
  // call already has live menu/branch data for any dynamic-mode block on the
  // initial page, rather than resolving empty until a later reload.
  await builder.fetchWebsite()
  await Promise.all([builder.fetchGlobalComponents(), navigation.fetchNavigation(), builder.fetchLiveDataPreview()])
  canvasRef.value?.applyTheme(builder.website?.theme)
  const home = builder.pages.find((p) => p.isHome) || builder.pages[0]
  if (home) await loadPage(home.id)
})

function onThemeChanged(theme) {
  canvasRef.value?.applyTheme(theme)
}

async function loadPage(id) {
  canvasReady.value = false
  await builder.fetchPage(id)
  canvasRef.value?.loadBlocks(builder.currentPage.draftBlocks?.blocks || [], globalContext.value)
  canvasReady.value = true
}

async function onSelectPage(id) {
  if (id === builder.currentPage?.id) return
  if (builder.dirty) await save()
  await loadPage(id)
}

function scheduleAutosave(blocks) {
  builder.dirty = true
  clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => save(blocks), 2000)
}

async function save(blocks) {
  if (!builder.currentPage || !canvasReady.value) return
  const exported = blocks || canvasRef.value?.exportBlocks() || []
  // Defense-in-depth, independent of canvasReady: this exact category of bug
  // (an empty canvas export silently persisted over real content) has now
  // hit the seeded demo page's content twice this session despite the
  // canvasReady guard above, so the guard alone isn't closing every route to
  // it - never silently overwrite a page that's known to have had blocks a
  // moment ago with zero blocks. A legitimate "delete every block on this
  // page" save is also rejected by this - that's the accepted cost.
  if (!exported.length && builder.currentPage.draftBlocks?.blocks?.length > 0) {
    console.warn('Refused to save: canvas exported 0 blocks but the page currently has content. Reload and try again if you really meant to clear this page.')
    return
  }
  await builder.savePage(builder.currentPage.id, exported)
}

// Publishing a page only flips that page's draft -> live within the platform
// (what qsr-system-frondend reads directly) - it doesn't touch the deployed
// static site. A single "Publish" click is expected to do both: put the
// current page's edits live in-platform, then kick off the real static
// build + DO Spaces deploy, and jump to the Publish tab so progress/URL/
// rollback/domains are immediately visible instead of silently happening
// behind the Blocks tab.
async function publish() {
  if (!builder.currentPage) return
  await save()
  await builder.publishPage(builder.currentPage.id)
  leftSidebarRef.value.active = 'publish'
  try {
    await publishing.publish()
  } catch (err) {
    alert(err.message || 'Publish failed')
  }
}

async function openHistory() {
  await builder.fetchVersions(builder.currentPage.id)
  historyOpen.value = true
}

async function onRestored() {
  canvasRef.value?.loadBlocks(builder.currentPage.draftBlocks?.blocks || [], globalContext.value)
}

async function onApplyTemplate(templateId) {
  await builder.applyTemplate(builder.currentPage.id, templateId)
  canvasRef.value?.loadBlocks(builder.currentPage.draftBlocks?.blocks || [], globalContext.value)
}

// Preview always shows the current DRAFT (via the website's own unguessable
// previewToken - see routes/public.js), regardless of whether the page has
// ever been published, so unsaved canvas edits are flushed first.
async function onPreview() {
  const tenant = builder.website?.company?.tenant
  const previewToken = builder.website?.previewToken
  if (!tenant || !previewToken || !builder.currentPage) return

  await save()

  const config = useRuntimeConfig()
  const path = builder.currentPage.isHome ? '/' : `/${builder.currentPage.slug}`

  let base
  if (config.public.APEX_DOMAIN) {
    base = `https://${tenant}.${config.public.APEX_DOMAIN}`
  } else {
    const customerUrl = new URL(config.public.CUSTOMER_URL)
    base = `${customerUrl.protocol}//${tenant}.localhost${customerUrl.port ? ':' + customerUrl.port : ''}`
  }

  window.open(`${base}${path}?preview=${previewToken}`, '_blank')
}
</script>

<template>
  <div class="wb-root tw-h-screen tw-flex tw-flex-col tw-overflow-hidden">
    <Toolbar
      :page-title="builder.currentPage?.title || 'Website Builder'"
      :status="builder.currentPage?.status"
      :saving="builder.saving"
      :dirty="builder.dirty"
      @back="navigateTo('/admin/dashboard')"
      @undo="canvasRef?.undo()"
      @redo="canvasRef?.redo()"
      @device="canvasRef?.setDevice($event)"
      @save="save()"
      @publish="publish()"
      @history="openHistory()"
      @preview="onPreview()"
    />

    <div class="tw-flex-1 tw-flex tw-min-h-0">
      <LeftSidebar ref="leftSidebarRef" @apply-template="onApplyTemplate" @select-page="onSelectPage" @theme-changed="onThemeChanged" />
      <div class="tw-flex-1 tw-min-w-0 tw-relative tw-bg-slate-100">
        <Canvas ref="canvasRef" @change="scheduleAutosave" @select="selected = $event" />
      </div>
      <div class="tw-w-72 tw-border-l tw-border-slate-200 tw-bg-white">
        <PropertiesPanel :selected="selected" />
      </div>
    </div>

    <VersionHistoryDrawer
      :open="historyOpen"
      :page-id="builder.currentPage?.id"
      @close="historyOpen = false"
      @restored="onRestored"
    />
  </div>
</template>
