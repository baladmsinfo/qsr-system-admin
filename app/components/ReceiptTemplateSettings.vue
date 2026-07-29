<template>
  <v-container fluid class="pa-6">
    <div class="app-header-bar d-flex flex-wrap align-center justify-space-between mb-6 px-5 py-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">Receipt Templates</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Edit the block layout used to render receipts, KOTs and invoices - no code required
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-pencil-ruler" :to="'/admin/receipt-designer'">New Template</v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="6" v-for="t in store.templates" :key="t.id">
        <div class="app-card pa-5">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="font-weight-bold text-subtitle-1">{{ t.name }}</span>
            <div class="d-flex ga-1">
              <v-chip size="small" variant="outlined">{{ t.type }}</v-chip>
              <v-chip v-if="t.isDefault" color="primary" size="small" variant="tonal">Default</v-chip>
            </div>
          </div>
          <p class="text-caption text-medium-emphasis mb-3">{{ t.layoutJson?.blocks?.length || 0 }} blocks</p>
          <div class="d-flex flex-wrap ga-2">
            <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-pencil-ruler" :to="`/admin/receipt-designer?id=${t.id}`">Design</v-btn>
            <v-btn size="small" variant="tonal" @click="preview(t)">Live Preview</v-btn>
            <v-btn size="small" variant="text" @click="openDialog(t)">Edit JSON</v-btn>
            <v-btn size="small" variant="text" color="error" @click="remove(t)">Remove</v-btn>
          </div>
        </div>
      </v-col>

      <v-col v-if="!store.loading && store.templates.length === 0" cols="12">
        <div class="app-card pa-10 text-center text-medium-emphasis">
          No receipt templates yet - "New Template" opens the visual Receipt Designer.
        </div>
      </v-col>
    </v-row>

    <!-- Add/Edit - raw block-list JSON editor. A visual drag-drop Designer
         (Canvas/Properties Panel/Toolbar) is a separate, much larger piece
         of work than this pass covers - see BLOCK_TYPES below for exactly
         which block "type" strings the renderer understands. -->
    <v-dialog v-model="dialog" width="720">
      <v-card class="pa-4">
        <v-card-title class="font-weight-bold text-h6">{{ form.id ? 'Edit Template' : 'New Template' }}</v-card-title>
        <v-divider class="my-2" />
        <v-card-text>
          <v-text-field v-model="form.name" label="Template Name" variant="outlined" />
          <v-select v-model="form.type" :items="['RECEIPT', 'KOT', 'INVOICE']" label="Type" variant="outlined" />
          <v-switch v-model="form.isDefault" label="Set as default for this type" color="primary" />

          <v-expansion-panels class="mb-4">
            <v-expansion-panel title="Available block types">
              <v-expansion-panel-text>
                <v-chip v-for="bt in BLOCK_TYPES" :key="bt" size="small" variant="outlined" class="ma-1">{{ bt }}</v-chip>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-textarea
            v-model="layoutJsonText"
            label="Layout JSON"
            variant="outlined"
            rows="14"
            :error-messages="jsonError"
          />
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="previewDialog" width="420">
      <v-card class="pa-2">
        <v-card-title class="font-weight-bold text-h6 d-flex justify-space-between align-center">
          Live Preview
          <v-btn icon="mdi-close" variant="text" size="small" @click="previewDialog = false" />
        </v-card-title>
        <v-divider class="mb-2" />
        <div v-if="previewLoading" class="d-flex justify-center pa-6"><v-progress-circular indeterminate /></div>
        <iframe v-else :srcdoc="previewHtml" style="width:100%;height:520px;border:0" />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useReceiptTemplateStore } from '@/stores/receiptTemplates'

const BLOCK_TYPES = [
  'LOGO', 'MERCHANT_INFO', 'ADDRESS', 'GST', 'INVOICE', 'DATE', 'CASHIER', 'CUSTOMER',
  'ITEMS_TABLE', 'DISCOUNT', 'COUPON', 'TAX', 'SUBTOTAL', 'ROUND_OFF', 'GRAND_TOTAL',
  'PAYMENT', 'QR', 'BARCODE', 'TERMS', 'SIGNATURE', 'FOOTER', 'TEXT', 'DIVIDER', 'SPACER',
]

const store = useReceiptTemplateStore()

const dialog = ref(false)
const saving = ref(false)
const form = ref(emptyForm())
const layoutJsonText = ref('')
const jsonError = ref('')

const previewDialog = ref(false)
const previewLoading = ref(false)
const previewHtml = ref('')

function emptyForm() {
  return { id: null, name: '', type: 'RECEIPT', isDefault: false, layoutJson: { blocks: [{ type: 'MERCHANT_INFO' }, { type: 'ITEMS_TABLE' }, { type: 'GRAND_TOTAL' }, { type: 'FOOTER' }] } }
}

function openDialog(template) {
  form.value = template ? { ...template } : emptyForm()
  layoutJsonText.value = JSON.stringify(form.value.layoutJson, null, 2)
  jsonError.value = ''
  dialog.value = true
}

watch(layoutJsonText, (val) => {
  try {
    JSON.parse(val)
    jsonError.value = ''
  } catch {
    jsonError.value = 'Invalid JSON'
  }
})

async function submit() {
  if (!form.value.name) return alert('Template name is required')
  let layoutJson
  try {
    layoutJson = JSON.parse(layoutJsonText.value)
  } catch {
    return alert('Layout JSON is invalid')
  }
  saving.value = true
  try {
    await store.saveTemplate({ ...form.value, layoutJson })
    dialog.value = false
  } catch (err) {
    alert(err.message || 'Failed to save template')
  }
  saving.value = false
}

async function remove(t) {
  if (!confirm(`Remove template "${t.name}"?`)) return
  try {
    await store.removeTemplate(t.id)
  } catch (err) {
    alert(err.message || 'Failed to remove template')
  }
}

async function preview(t) {
  previewDialog.value = true
  previewLoading.value = true
  try {
    previewHtml.value = await store.fetchPreviewHtml(t.id)
  } catch (err) {
    previewHtml.value = `<p style="font-family:sans-serif;color:red;padding:16px">${err.message || 'Failed to render preview'}</p>`
  }
  previewLoading.value = false
}

onMounted(() => {
  store.fetchTemplates()
})
</script>
