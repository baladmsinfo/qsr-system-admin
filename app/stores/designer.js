import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useReceiptTemplateStore } from './receiptTemplates'
import { newBlock } from '@/composables/receiptBlocks'

const MAX_HISTORY = 50
let previewDebounceTimer = null

// Working-draft state for the Receipt Designer - separate from
// receiptTemplates.js (the saved-templates CRUD store) the same way a
// document editor's "current buffer" is separate from its "list of saved
// files". Nothing here is persisted until save() is called.
export const useDesignerStore = defineStore('designer', {
  state: () => ({
    meta: { id: null, name: '', type: 'RECEIPT', isDefault: false },
    blocks: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,
    zoom: 1,
    saving: false,
    previewHtml: '',
    previewLoading: false,
    previewError: '',
  }),

  getters: {
    selectedBlock: (state) => state.blocks.find((b) => b.id === state.selectedId) || null,
    canUndo: (state) => state.historyIndex > 0,
    canRedo: (state) => state.historyIndex < state.history.length - 1,
  },

  actions: {
    loadTemplate(template) {
      this.meta = { id: template.id, name: template.name, type: template.type, isDefault: template.isDefault }
      this.blocks = (template.layoutJson?.blocks || []).map((b, i) => ({ id: b.id || `${b.type.toLowerCase()}-${i}`, ...b }))
      this.selectedId = null
      this.history = [this._snapshot()]
      this.historyIndex = 0
      this.fetchPreview()
    },

    loadBlank(type = 'RECEIPT') {
      this.meta = { id: null, name: '', type, isDefault: false }
      this.blocks = ['MERCHANT_INFO', 'ITEMS_TABLE', 'GRAND_TOTAL', 'FOOTER'].map((t) => newBlock(t))
      this.selectedId = null
      this.history = [this._snapshot()]
      this.historyIndex = 0
      this.fetchPreview()
    },

    _snapshot() {
      return JSON.parse(JSON.stringify(this.blocks))
    },

    // Called after every mutating action - truncates any redo-able future
    // (a new edit after undo() discards the branch you undid away from,
    // same as every other editor's undo/redo model).
    _pushHistory() {
      this.history = this.history.slice(0, this.historyIndex + 1)
      this.history.push(this._snapshot())
      if (this.history.length > MAX_HISTORY) this.history.shift()
      this.historyIndex = this.history.length - 1
      this.fetchPreview()
    },

    undo() {
      if (!this.canUndo) return
      this.historyIndex -= 1
      this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      this.fetchPreview()
    },

    redo() {
      if (!this.canRedo) return
      this.historyIndex += 1
      this.blocks = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      this.fetchPreview()
    },

    selectBlock(id) {
      this.selectedId = id
    },

    addBlock(type, atIndex) {
      const block = newBlock(type)
      if (atIndex == null || atIndex >= this.blocks.length) this.blocks.push(block)
      else this.blocks.splice(atIndex, 0, block)
      this.selectedId = block.id
      this._pushHistory()
    },

    removeBlock(id) {
      this.blocks = this.blocks.filter((b) => b.id !== id)
      if (this.selectedId === id) this.selectedId = null
      this._pushHistory()
    },

    duplicateBlock(id) {
      const index = this.blocks.findIndex((b) => b.id === id)
      if (index === -1) return
      const copy = { ...JSON.parse(JSON.stringify(this.blocks[index])), id: `${this.blocks[index].type.toLowerCase()}-${Date.now()}` }
      this.blocks.splice(index + 1, 0, copy)
      this.selectedId = copy.id
      this._pushHistory()
    },

    toggleHidden(id) {
      const block = this.blocks.find((b) => b.id === id)
      if (!block) return
      block.hidden = !block.hidden
      this._pushHistory()
    },

    toggleLocked(id) {
      const block = this.blocks.find((b) => b.id === id)
      if (!block) return
      block.locked = !block.locked
      this._pushHistory()
    },

    reorder(fromIndex, toIndex) {
      if (fromIndex === toIndex) return
      const [moved] = this.blocks.splice(fromIndex, 1)
      this.blocks.splice(toIndex, 0, moved)
      this._pushHistory()
    },

    updateBlockProps(id, patch) {
      const block = this.blocks.find((b) => b.id === id)
      if (!block) return
      block.props = { ...block.props, ...patch }
      this._pushHistory()
    },

    updateBlockVisibleIf(id, visibleIf) {
      const block = this.blocks.find((b) => b.id === id)
      if (!block) return
      block.visibleIf = visibleIf
      this._pushHistory()
    },

    setZoom(z) {
      this.zoom = Math.min(Math.max(z, 0.5), 2)
    },

    // Debounced so rapid typing in the properties panel doesn't fire a
    // network request per keystroke - the live preview always calls the
    // SAME backend renderer used for real printing (no separate client-side
    // rendering logic to keep in sync).
    fetchPreview() {
      clearTimeout(previewDebounceTimer)
      previewDebounceTimer = setTimeout(async () => {
        const templateStore = useReceiptTemplateStore()
        this.previewLoading = true
        this.previewError = ''
        try {
          this.previewHtml = await templateStore.fetchDraftPreviewHtml({ blocks: this._stripClientFields() })
        } catch (err) {
          this.previewError = err.response?.data?.message || err.message || 'Failed to render preview'
        } finally {
          this.previewLoading = false
        }
      }, 500)
    },

    // `id`/`locked` are Designer-only bookkeeping - stripped before sending
    // to the backend, which only knows type/props/visibleIf/hidden.
    _stripClientFields() {
      return this.blocks.map(({ id, locked, ...rest }) => rest)
    },

    async save() {
      if (!this.meta.name) throw new Error('Template name is required')
      const templateStore = useReceiptTemplateStore()
      this.saving = true
      try {
        const saved = await templateStore.saveTemplate({
          id: this.meta.id,
          name: this.meta.name,
          type: this.meta.type,
          isDefault: this.meta.isDefault,
          layoutJson: { blocks: this._stripClientFields() },
        })
        this.meta.id = saved.id
        return saved
      } finally {
        this.saving = false
      }
    },

    async uploadImage(file) {
      const auth = useAuthStore()
      const { $axios } = useNuxtApp()
      const config = useRuntimeConfig()
      const formData = new FormData()
      formData.append('file', file)
      const res = await $axios.post(`${config.public.API_ENDPOINT}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${auth.token}` },
      })
      if (res.data.statusCode !== '00') throw new Error(res.data.message || 'Upload failed')
      return res.data.data.url
    },
  },
})
