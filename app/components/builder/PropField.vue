<script setup>
import { useBuilderStore } from '../../stores/builder'

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: null, required: false, default: undefined },
})
const emit = defineEmits(['update:modelValue'])
const builder = useBuilderStore()

function update(value) {
  emit('update:modelValue', value)
}

function emptyItem(itemFields) {
  const item = {}
  for (const f of itemFields) item[f.key] = f.type === 'list' ? [] : ''
  return item
}

function addItem() {
  const list = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  list.push(emptyItem(props.field.itemFields))
  update(list)
}

function removeItem(index) {
  const list = [...props.modelValue]
  list.splice(index, 1)
  update(list)
}

function updateItemField(index, key, value) {
  const list = props.modelValue.map((item, i) => (i === index ? { ...item, [key]: value } : item))
  update(list)
}

async function onImageFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  const asset = await builder.uploadAsset(formData)
  update(asset.url)
  e.target.value = ''
}
</script>

<template>
  <div class="tw-mb-4">
    <label class="tw-block tw-text-xs tw-font-medium tw-text-slate-500 tw-mb-1">{{ field.label }}</label>

    <input
      v-if="field.type === 'text'"
      :value="modelValue"
      type="text"
      class="tw-w-full tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm"
      @input="update($event.target.value)"
    />

    <textarea
      v-else-if="field.type === 'textarea'"
      :value="modelValue"
      rows="3"
      class="tw-w-full tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm"
      @input="update($event.target.value)"
    />

    <select
      v-else-if="field.type === 'select'"
      :value="modelValue"
      class="tw-w-full tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm"
      @change="update($event.target.value)"
    >
      <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
    </select>

    <div v-else-if="field.type === 'color'" class="tw-flex tw-items-center tw-gap-2">
      <input
        :value="modelValue || '#ffffff'"
        type="color"
        class="tw-h-8 tw-w-10 tw-rounded tw-border tw-border-slate-300 tw-p-0.5"
        @input="update($event.target.value)"
      />
      <input
        :value="modelValue"
        type="text"
        placeholder="none"
        class="tw-flex-1 tw-rounded-md tw-border tw-border-slate-300 tw-px-2 tw-py-1.5 tw-text-sm"
        @input="update($event.target.value)"
      />
      <button v-if="modelValue" type="button" class="tw-text-xs tw-text-slate-400 hover:tw-text-red-600" @click="update('')">✕</button>
    </div>

    <input
      v-else-if="field.type === 'range'"
      :value="modelValue ?? field.min ?? 0"
      type="range"
      :min="field.min ?? 0"
      :max="field.max ?? 1"
      :step="field.step ?? 0.05"
      class="tw-w-full"
      @input="update(Number($event.target.value))"
    />

    <div v-else-if="field.type === 'image'" class="tw-space-y-2">
      <div v-if="modelValue" class="tw-h-20 tw-rounded tw-overflow-hidden tw-bg-slate-100">
        <img :src="modelValue" alt="" class="tw-h-full tw-w-full tw-object-cover" />
      </div>
      <input type="file" accept="image/*" class="tw-text-xs" @change="onImageFile" />
    </div>

    <div v-else-if="field.type === 'list'" class="tw-space-y-3">
      <div
        v-for="(item, i) in modelValue || []"
        :key="i"
        class="tw-rounded-md tw-border tw-border-slate-200 tw-p-2 tw-relative"
      >
        <button
          type="button"
          class="tw-absolute tw-top-1 tw-right-1 tw-text-slate-400 hover:tw-text-red-600 tw-text-xs"
          @click="removeItem(i)"
        >
          ✕
        </button>
        <PropField
          v-for="subField in field.itemFields"
          :key="subField.key"
          :field="subField"
          :model-value="item[subField.key]"
          @update:model-value="updateItemField(i, subField.key, $event)"
        />
      </div>
      <button
        type="button"
        class="tw-text-xs tw-font-medium tw-text-violet-700 hover:tw-text-violet-900"
        @click="addItem"
      >
        + Add {{ field.label }}
      </button>
    </div>
  </div>
</template>
