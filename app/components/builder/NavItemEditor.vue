<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  pages: { type: Array, default: () => [] },
  depth: { type: Number, default: 1 },
})
const emit = defineEmits(['update:item', 'remove'])

function patch(fields) {
  emit('update:item', { ...props.item, ...fields })
}

const children = computed(() => props.item.children || [])

function addChild() {
  patch({ children: [...children.value, { id: `${Date.now()}`, linkType: 'page', pageId: props.pages[0]?.id || '' }] })
}

function updateChild(index, updated) {
  const list = [...children.value]
  list[index] = updated
  patch({ children: list })
}

function removeChild(index) {
  const list = [...children.value]
  list.splice(index, 1)
  patch({ children: list })
}
</script>

<template>
  <div class="tw-rounded-md tw-border tw-border-slate-200 tw-p-2 tw-mb-2">
    <div class="tw-flex tw-items-center tw-gap-1">
      <select
        :value="item.linkType"
        class="tw-rounded tw-border tw-border-slate-300 tw-text-xs tw-py-1"
        @change="patch({ linkType: $event.target.value })"
      >
        <option value="page">Page</option>
        <option value="external">External URL</option>
        <option value="anchor">Anchor</option>
      </select>

      <select
        v-if="item.linkType === 'page'"
        :value="item.pageId"
        class="tw-flex-1 tw-min-w-0 tw-rounded tw-border tw-border-slate-300 tw-text-xs tw-py-1"
        @change="patch({ pageId: $event.target.value })"
      >
        <option v-for="p in pages" :key="p.id" :value="p.id">{{ p.title }}</option>
      </select>
      <input
        v-else
        :value="item.url"
        placeholder="https:// or #anchor"
        class="tw-flex-1 tw-min-w-0 tw-rounded tw-border tw-border-slate-300 tw-text-xs tw-px-2 tw-py-1"
        @input="patch({ url: $event.target.value })"
      />

      <button class="tw-text-slate-400 hover:tw-text-red-600 tw-text-xs" @click="emit('remove')">✕</button>
    </div>

    <input
      :value="item.label"
      placeholder="Label override (optional)"
      class="tw-mt-1 tw-w-full tw-rounded tw-border tw-border-slate-200 tw-text-xs tw-px-2 tw-py-1"
      @input="patch({ label: $event.target.value })"
    />

    <div class="tw-pl-3 tw-mt-2 tw-border-l tw-border-slate-100">
      <NavItemEditor
        v-for="(child, i) in children"
        :key="child.id"
        :item="child"
        :pages="pages"
        :depth="depth + 1"
        @update:item="updateChild(i, $event)"
        @remove="removeChild(i)"
      />
      <button
        v-if="depth < 3"
        class="tw-text-xs tw-font-medium tw-text-violet-700 hover:tw-text-violet-900"
        @click="addChild"
      >
        + Sub-item
      </button>
    </div>
  </div>
</template>
