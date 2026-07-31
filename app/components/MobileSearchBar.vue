<template>
  <div class="mobile-search-bar" :class="{ 'mobile-search-bar--sticky': sticky }">
    <v-text-field :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder" density="compact" variant="solo" flat hide-details rounded="lg"
      prepend-inner-icon="mdi-magnify" class="mobile-search-input" />
    <div v-if="$slots.chips" class="mobile-search-chip-row d-flex ga-2 mt-2">
      <slot name="chips" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Search" },
  // Set to false when nesting inside another sticky wrapper (e.g. paired
  // right after MobilePageHeader) - see the same note on that component.
  sticky: { type: Boolean, default: true },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.mobile-search-bar {
  background: #fff;
  padding: 10px 16px;
  border-bottom: 1px solid #EEE9F7;
}
.mobile-search-bar--sticky {
  position: sticky;
  top: 0;
  z-index: 3;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.mobile-search-input :deep(.v-field) {
  background: #F8F6FC;
  border-radius: 14px;
}

.mobile-search-chip-row {
  overflow-x: auto;
  scrollbar-width: none;
}

.mobile-search-chip-row::-webkit-scrollbar {
  display: none;
}
</style>
