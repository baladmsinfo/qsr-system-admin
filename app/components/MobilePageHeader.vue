<template>
  <div class="mobile-page-header" :class="{ 'mobile-page-header--sticky': sticky }">
    <div class="d-flex align-center ga-2">
      <v-btn icon="mdi-menu" variant="text" density="comfortable" class="flex-shrink-0"
        @click="moreOpen = true" />
      <div class="d-flex align-center justify-space-between ga-3 flex-grow-1" style="min-width: 0">
        <div style="min-width: 0">
          <h1 class="text-subtitle-1 font-weight-bold mb-0 text-truncate">{{ title }}</h1>
          <p v-if="subtitle" class="text-caption text-medium-emphasis mb-0 text-truncate">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.action" class="flex-shrink-0">
          <slot name="action" />
        </div>
      </div>
    </div>
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useNavDrawer } from "@/composables/useNavDrawer";

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  // Set to false when nesting inside another sticky wrapper (e.g. paired
  // with MobileSearchBar) - two independently-sticky top:0 siblings overlap
  // instead of stacking, since neither knows the other's height.
  sticky: { type: Boolean, default: true },
});

// Opens the same phone-only side-nav drawer the old top app-bar's hamburger
// used to trigger - every mobile page renders this header, so this is the
// one place that needs the toggle now that the standalone bar is gone.
const { moreOpen } = useNavDrawer();
</script>

<style scoped>
.mobile-page-header {
  background: #fff;
  border-bottom: 1px solid #EEE9F7;
  padding: 12px 16px;
}
.mobile-page-header--sticky {
  position: sticky;
  top: 0;
  z-index: 4;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
</style>
