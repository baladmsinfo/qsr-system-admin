<template>
  <div class="mobile-shell-page">
    <MobilePageHeader title="Receipt Templates" subtitle="Block layout for receipts, KOTs & invoices">
      <v-btn icon="mdi-pencil-ruler" variant="tonal" color="primary" density="comfortable" :to="'/admin/receipt-designer'" />
    </MobilePageHeader>

    <div class="pa-4">
      <MobileEmptyState v-if="!store.loading && store.templates.length === 0" icon="mdi-receipt-text-outline"
        title="No receipt templates yet" description="'New Template' opens the visual Receipt Designer.">
        <template #action>
          <v-btn color="primary" prepend-icon="mdi-pencil-ruler" :to="'/admin/receipt-designer'">New Template</v-btn>
        </template>
      </MobileEmptyState>

      <div v-for="t in store.templates" :key="t.id" class="app-card pa-4 mb-3">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-bold text-body-2">{{ t.name }}</span>
          <div class="d-flex ga-1">
            <v-chip size="x-small" variant="outlined">{{ t.type }}</v-chip>
            <v-chip v-if="t.isDefault" color="primary" size="x-small" variant="tonal">Default</v-chip>
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
    </div>

    <MobileActionBar v-if="store.templates.length">
      <v-btn block size="large" color="primary" prepend-icon="mdi-pencil-ruler" class="font-weight-bold" :to="'/admin/receipt-designer'">
        New Template
      </v-btn>
    </MobileActionBar>

    <!-- EDIT JSON -->
    <MobileFullscreenDialog v-model="dialog" :title="form.id ? 'Edit Template' : 'New Template'">
      <v-text-field v-model="form.name" label="Template Name" variant="outlined" class="mb-2" />
      <v-select v-model="form.type" :items="['RECEIPT', 'KOT', 'INVOICE']" label="Type" variant="outlined" class="mb-2" />
      <v-switch v-model="form.isDefault" label="Set as default for this type" color="primary" hide-details class="mb-3" />

      <v-expansion-panels class="mb-4">
        <v-expansion-panel title="Available block types">
          <v-expansion-panel-text>
            <v-chip v-for="bt in BLOCK_TYPES" :key="bt" size="small" variant="outlined" class="ma-1">{{ bt }}</v-chip>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-textarea v-model="layoutJsonText" label="Layout JSON" variant="outlined" rows="14" :error-messages="jsonError" />

      <template #footer>
        <v-btn block size="large" color="primary" class="font-weight-bold" :loading="saving" @click="submit">Save</v-btn>
      </template>
    </MobileFullscreenDialog>

    <!-- PREVIEW -->
    <MobileFullscreenDialog v-model="previewDialog" title="Live Preview">
      <div v-if="previewLoading" class="d-flex justify-center pa-6"><v-progress-circular indeterminate /></div>
      <iframe v-else :srcdoc="previewHtml" style="width:100%;height:70vh;border:0" />
    </MobileFullscreenDialog>
  </div>
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
