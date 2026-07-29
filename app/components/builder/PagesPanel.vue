<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useBuilderStore } from '../../stores/builder'

const emit = defineEmits(['select'])
const builder = useBuilderStore()

const creating = ref(false)
const newPage = reactive({ title: '', slug: '' })
const editingId = ref(null)
const editForm = reactive({ title: '', slug: '' })

onMounted(() => {
  if (!builder.pages.length) builder.fetchPages()
})

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function onNewTitleInput(value) {
  newPage.title = value
  newPage.slug = slugify(value)
}

async function createPage() {
  if (!newPage.title || !newPage.slug) return
  try {
    const page = await builder.createPage({ slug: newPage.slug, title: newPage.title })
    creating.value = false
    newPage.title = ''
    newPage.slug = ''
    emit('select', page.id)
  } catch (err) {
    alert(err.message)
  }
}

function startEdit(page) {
  editingId.value = page.id
  editForm.title = page.title
  editForm.slug = page.slug
}

async function saveEdit(id) {
  try {
    await builder.updatePageMeta(id, { title: editForm.title, slug: editForm.slug })
    editingId.value = null
  } catch (err) {
    alert(err.message)
  }
}

async function duplicate(page) {
  const copy = await builder.duplicatePage(page.id)
  emit('select', copy.id)
}

async function remove(page) {
  if (page.isHome) return
  if (!confirm(`Delete page "${page.title}"?`)) return
  await builder.deletePage(page.id)
}

async function setHome(page) {
  await builder.setHomePage(page.id)
}

async function move(index, direction) {
  const pages = [...builder.pages]
  const target = index + direction
  if (target < 0 || target >= pages.length) return
  ;[pages[index], pages[target]] = [pages[target], pages[index]]
  await builder.reorderPages(pages.map((p) => p.id))
}
</script>

<template>
  <div class="tw-p-3 tw-h-full tw-overflow-y-auto">
    <div
      v-for="(page, i) in builder.pages"
      :key="page.id"
      class="tw-rounded-lg tw-border tw-border-slate-200 tw-p-2 tw-mb-2 hover:tw-border-violet-400"
    >
      <div v-if="editingId === page.id" class="tw-space-y-2">
        <input v-model="editForm.title" class="tw-w-full tw-rounded tw-border tw-border-slate-300 tw-px-2 tw-py-1 tw-text-sm" placeholder="Page title" />
        <input v-model="editForm.slug" class="tw-w-full tw-rounded tw-border tw-border-slate-300 tw-px-2 tw-py-1 tw-text-xs" placeholder="slug" />
        <div class="tw-flex tw-gap-2">
          <button class="tw-text-xs tw-font-medium tw-text-violet-700" @click="saveEdit(page.id)">Save</button>
          <button class="tw-text-xs tw-text-slate-400" @click="editingId = null">Cancel</button>
        </div>
      </div>
      <div v-else>
        <div class="tw-flex tw-items-center tw-justify-between tw-gap-1">
          <button class="tw-flex-1 tw-text-left tw-min-w-0" @click="emit('select', page.id)">
            <div class="tw-flex tw-items-center tw-gap-1">
              <i v-if="page.isHome" class="mdi mdi-home tw-text-amber-500 tw-text-sm" />
              <span class="tw-font-medium tw-text-sm tw-text-slate-800 tw-truncate">{{ page.title }}</span>
            </div>
            <div class="tw-text-xs tw-text-slate-400 tw-truncate">/{{ page.slug }}</div>
          </button>
          <span
            class="tw-text-[10px] tw-px-1.5 tw-py-0.5 tw-rounded-full tw-whitespace-nowrap"
            :class="page.status === 'PUBLISHED' ? 'tw-bg-green-100 tw-text-green-700' : 'tw-bg-slate-100 tw-text-slate-500'"
          >
            {{ page.status === 'PUBLISHED' ? 'Live' : 'Draft' }}
          </span>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2 tw-mt-2 tw-text-slate-400">
          <button title="Move up" :disabled="i === 0" class="hover:tw-text-slate-700 disabled:tw-opacity-30" @click="move(i, -1)"><i class="mdi mdi-arrow-up" /></button>
          <button title="Move down" :disabled="i === builder.pages.length - 1" class="hover:tw-text-slate-700 disabled:tw-opacity-30" @click="move(i, 1)"><i class="mdi mdi-arrow-down" /></button>
          <button title="Rename / edit slug" class="hover:tw-text-slate-700" @click="startEdit(page)"><i class="mdi mdi-pencil-outline" /></button>
          <button title="Duplicate" class="hover:tw-text-slate-700" @click="duplicate(page)"><i class="mdi mdi-content-copy" /></button>
          <button v-if="!page.isHome" title="Set as homepage" class="hover:tw-text-amber-500" @click="setHome(page)"><i class="mdi mdi-home-outline" /></button>
          <button v-if="!page.isHome" title="Delete" class="hover:tw-text-red-600 tw-ml-auto" @click="remove(page)"><i class="mdi mdi-trash-can-outline" /></button>
        </div>
      </div>
    </div>

    <div v-if="creating" class="tw-rounded-lg tw-border tw-border-dashed tw-border-violet-300 tw-p-2 tw-space-y-2">
      <input :value="newPage.title" placeholder="Page title" class="tw-w-full tw-rounded tw-border tw-border-slate-300 tw-px-2 tw-py-1 tw-text-sm" @input="onNewTitleInput($event.target.value)" />
      <input v-model="newPage.slug" placeholder="slug" class="tw-w-full tw-rounded tw-border tw-border-slate-300 tw-px-2 tw-py-1 tw-text-xs" />
      <div class="tw-flex tw-gap-2">
        <button class="tw-text-xs tw-font-medium tw-text-violet-700" @click="createPage">Create</button>
        <button class="tw-text-xs tw-text-slate-400" @click="creating = false">Cancel</button>
      </div>
    </div>
    <button
      v-else
      class="tw-w-full tw-rounded-lg tw-border tw-border-dashed tw-border-slate-300 tw-p-2 tw-text-xs tw-text-slate-500 hover:tw-border-violet-400"
      @click="creating = true"
    >
      + New Page
    </button>
  </div>
</template>
