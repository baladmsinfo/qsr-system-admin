import { defineStore } from 'pinia'

// Counter/POS draft orders (built-up carts not yet submitted). There is no
// backend Draft model - these are saved per-branch in this browser's
// localStorage so a cashier can park an order and resume it later on the
// same terminal.
const STORAGE_PREFIX = 'qsr_pos_drafts_'

function readAll(branchId) {
  if (!branchId || typeof localStorage === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + branchId) || '[]')
  } catch {
    return []
  }
}

function writeAll(branchId, drafts) {
  if (!branchId || typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_PREFIX + branchId, JSON.stringify(drafts))
}

export const usePosDraftsStore = defineStore('posDrafts', {
  state: () => ({
    drafts: [],
  }),

  actions: {
    load(branchId) {
      this.drafts = readAll(branchId)
    },

    save(branchId, draft) {
      const drafts = readAll(branchId)
      const entry = {
        id: draft.id || `draft-${Date.now()}`,
        label: draft.label || '',
        items: draft.items,
        customerName: draft.customerName || '',
        customerPhone: draft.customerPhone || '',
        tableId: draft.tableId || null,
        notes: draft.notes || '',
        createdAt: draft.createdAt || new Date().toISOString(),
      }
      const idx = drafts.findIndex((d) => d.id === entry.id)
      if (idx === -1) drafts.unshift(entry)
      else drafts[idx] = entry
      writeAll(branchId, drafts)
      this.drafts = drafts
      return entry
    },

    remove(branchId, id) {
      const drafts = readAll(branchId).filter((d) => d.id !== id)
      writeAll(branchId, drafts)
      this.drafts = drafts
    },
  },
})
