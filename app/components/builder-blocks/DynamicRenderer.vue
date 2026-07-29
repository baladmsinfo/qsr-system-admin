<script setup>
import { computed } from 'vue'
import { BLOCK_REGISTRY } from './registry'

const props = defineProps({
  blocks: { type: Array, default: () => [] },
  globalComponents: { type: Array, default: () => [] },
  navigationLinks: { type: Array, default: () => [] },
})

// GlobalComponentRef entries resolve against the passed-in GlobalComponent
// rows (with HEADER additionally getting live navigationLinks merged in) -
// same resolution the GrapesJS canvas does in grapesEditor.js's loadBlocks().
const resolvedBlocks = computed(() => {
  const byKey = new Map(props.globalComponents.map((c) => [c.key, c]))
  return props.blocks
    .map((block) => {
      if (block.type !== 'GlobalComponentRef') return block
      const source = byKey.get(block.key)
      if (!source) return null
      const blockProps = block.key === 'HEADER' ? { ...source.props, links: props.navigationLinks?.length ? props.navigationLinks : source.props.links } : source.props
      return { type: source.blockType, props: blockProps }
    })
    .filter((block) => block && BLOCK_REGISTRY[block.type])
})
</script>

<template>
  <div class="wb-root">
    <component
      v-for="(block, i) in resolvedBlocks"
      :key="i"
      :is="BLOCK_REGISTRY[block.type]?.component"
      v-bind="block.props"
    />
  </div>
</template>
