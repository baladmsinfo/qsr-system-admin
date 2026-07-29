<template>
  <div>
    <p class="text-caption text-medium-emphasis mb-3">{{ meta?.label || block.type }}</p>

    <!-- Content -->
    <v-textarea v-if="meta?.hasText" :model-value="block.props.text" label="Text" variant="outlined" rows="2" @update:model-value="update('text', $event)" />

    <!-- Logo image upload -->
    <template v-if="meta?.isImage">
      <v-img v-if="block.props.imageUrl" :src="block.props.imageUrl" height="80" class="mb-2 bg-grey-lighten-3" />
      <v-file-input
        label="Upload Logo Image"
        accept="image/*"
        variant="outlined"
        density="compact"
        prepend-icon="mdi-image"
        :loading="uploading"
        @update:model-value="onImageSelected"
      />
      <v-text-field :model-value="block.props.imageUrl" label="Or paste an image URL" variant="outlined" density="compact" @update:model-value="update('imageUrl', $event)" />
    </template>

    <!-- Extra per-type fields -->
    <template v-for="field in meta?.extraFields || []" :key="field">
      <v-text-field
        v-if="field !== 'lines'"
        :model-value="block.props[field]"
        :label="extraFieldLabel(field)"
        variant="outlined"
        density="compact"
        @update:model-value="update(field, $event)"
      />
      <v-text-field
        v-else
        type="number"
        :model-value="block.props.lines"
        label="Number of blank lines"
        variant="outlined"
        density="compact"
        @update:model-value="update('lines', Number($event))"
      />
    </template>

    <!-- Style (freeform text blocks only - see escposRenderer.js/htmlRenderer.js for why) -->
    <template v-if="meta?.supportsStyle">
      <v-divider class="my-3" />
      <p class="text-caption font-weight-medium mb-1">Style</p>
      <v-btn-toggle :model-value="block.props.align || 'left'" mandatory density="compact" class="mb-3" @update:model-value="update('align', $event)">
        <v-btn value="left" icon="mdi-format-align-left" size="small" />
        <v-btn value="center" icon="mdi-format-align-center" size="small" />
        <v-btn value="right" icon="mdi-format-align-right" size="small" />
      </v-btn-toggle>
      <v-switch :model-value="!!block.props.bold" label="Bold" density="compact" color="primary" @update:model-value="update('bold', $event)" />
      <v-select
        :model-value="block.props.fontSize || 1"
        :items="[{ title: 'Normal', value: 1 }, { title: 'Large', value: 2 }, { title: 'Extra Large', value: 3 }]"
        label="Font Size"
        variant="outlined"
        density="compact"
        @update:model-value="update('fontSize', $event)"
      />
    </template>

    <!-- Layout (all blocks) -->
    <v-divider class="my-3" />
    <p class="text-caption font-weight-medium mb-1">Spacing</p>
    <div class="d-flex ga-2">
      <v-text-field
        type="number"
        :model-value="block.props.marginTop || 0"
        label="Margin Top (lines)"
        variant="outlined"
        density="compact"
        @update:model-value="update('marginTop', Number($event))"
      />
      <v-text-field
        type="number"
        :model-value="block.props.marginBottom || 0"
        label="Margin Bottom (lines)"
        variant="outlined"
        density="compact"
        @update:model-value="update('marginBottom', Number($event))"
      />
    </div>
    <v-text-field
      type="number"
      :model-value="block.props.padding || 0"
      label="Padding (px - preview/HTML only)"
      variant="outlined"
      density="compact"
      @update:model-value="update('padding', Number($event))"
    />

    <!-- Conditional Visibility -->
    <v-divider class="my-3" />
    <p class="text-caption font-weight-medium mb-1">Conditional Visibility</p>
    <v-combobox
      :model-value="block.visibleIf?.field"
      :items="VISIBILITY_FIELDS"
      label="Field"
      variant="outlined"
      density="compact"
      clearable
      @update:model-value="updateVisibility('field', $event)"
    />
    <template v-if="block.visibleIf?.field">
      <v-select
        :model-value="block.visibleIf?.operator || 'equals'"
        :items="[
          { title: 'Equals', value: 'equals' },
          { title: 'Not Equals', value: 'notEquals' },
          { title: 'Exists', value: 'exists' },
          { title: 'Does Not Exist', value: 'notExists' },
        ]"
        label="Condition"
        variant="outlined"
        density="compact"
        @update:model-value="updateVisibility('operator', $event)"
      />
      <v-text-field
        v-if="['equals', 'notEquals'].includes(block.visibleIf?.operator || 'equals')"
        :model-value="block.visibleIf?.value"
        label="Value"
        variant="outlined"
        density="compact"
        @update:model-value="updateVisibility('value', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { BLOCK_META } from '@/composables/receiptBlocks'
import { useDesignerStore } from '@/stores/designer'

const props = defineProps({
  block: { type: Object, required: true },
})
const emit = defineEmits(['update'])

const store = useDesignerStore()
const uploading = ref(false)

// Real, resolvable paths against the exact receiptData shape produced by
// the backend's services/printing/receiptData.js - matches what
// blockVisibility.js's dotted-path lookup actually walks.
const VISIBILITY_FIELDS = [
  'order.orderType', 'order.source', 'order.status',
  'customer.name', 'customer.phone',
  'table.tableNo',
  'payment.method',
  'totals.discount', 'totals.roundOff',
]

const meta = computed(() => BLOCK_META[props.block.type])

function update(field, value) {
  emit('update', { [field]: value })
}

function updateVisibility(field, value) {
  const current = props.block.visibleIf || {}
  store.updateBlockVisibleIf(props.block.id, { ...current, [field]: value })
}

function extraFieldLabel(field) {
  return { code: 'Coupon Code', data: 'Data (supports {{order.id}})', label: 'Label', char: 'Divider Character' }[field] || field
}

async function onImageSelected(file) {
  const f = Array.isArray(file) ? file[0] : file
  if (!f) return
  uploading.value = true
  try {
    const url = await store.uploadImage(f)
    update('imageUrl', url)
  } catch (err) {
    alert(err.message || 'Upload failed')
  }
  uploading.value = false
}
</script>
